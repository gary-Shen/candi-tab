import type { Block, Setting } from '@/types/setting.type'
import { describe, expect, it } from 'vitest'
import mergeSettings from './mergeSettings'
import { isRemoteNewer, isSameContent } from './sync'

function block(id: string, title: string, buttons: { id: string, title: string, url?: string }[] = []): Block {
  return {
    id,
    title,
    layout: { i: id, x: 0, y: 0, w: 2, h: 2 },
    buttons: buttons.map(b => ({ style: 'primary' as const, ...b })),
  }
}

function setting(blocks: Block[], extra: Partial<Setting> = {}): Setting {
  return {
    links: blocks,
    updatedAt: 1000,
    createdAt: 1,
    general: { language: 'en-US' },
    theme: { solution: 'light' },
    clipboard: '',
    ...extra,
  } as Setting
}

const clone = <T>(v: T): T => JSON.parse(JSON.stringify(v))

describe('mergeSettings', () => {
  it('双方各自新增区块都保留（bug 场景：本地刚添加的区块不丢失）', () => {
    const base = setting([block('a', 'A')])
    const local = setting([block('a', 'A'), block('b', '本地新增')])
    const remote = setting([block('a', 'A'), block('c', '远端新增')])

    const merged = mergeSettings(base, local, remote)
    expect(merged.links.map(b => b.id)).toEqual(['a', 'b', 'c'])
  })

  it('本地新增链接 + 远端改主题 → 两者都保留', () => {
    const base = setting([block('a', 'A', [{ id: 'l1', title: 'link1' }])])
    const local = clone(base)
    local.links[0].buttons!.push({ id: 'l2', title: '本地新增链接', style: 'primary' })
    const remote = clone(base)
    remote.theme = { solution: 'dark' }

    const merged = mergeSettings(base, local, remote)
    expect(merged.links[0].buttons!.map(b => b.id)).toEqual(['l1', 'l2'])
    expect(merged.theme.solution).toBe('dark')
  })

  it('同一链接的不同字段被两侧分别修改 → 字段级合并', () => {
    const base = setting([block('a', 'A', [{ id: 'l1', title: 'old', url: 'http://old' }])])
    const local = clone(base)
    local.links[0].buttons![0].title = '本地改标题'
    const remote = clone(base)
    remote.links[0].buttons![0].url = 'http://remote'

    const merged = mergeSettings(base, local, remote)
    expect(merged.links[0].buttons![0].title).toBe('本地改标题')
    expect(merged.links[0].buttons![0].url).toBe('http://remote')
  })

  it('同一字段双方都改 → 本地优先', () => {
    const base = setting([block('a', 'A', [{ id: 'l1', title: 'old' }])])
    const local = clone(base)
    local.links[0].buttons![0].title = '本地'
    const remote = clone(base)
    remote.links[0].buttons![0].title = '远端'

    const merged = mergeSettings(base, local, remote)
    expect(merged.links[0].buttons![0].title).toBe('本地')
  })

  it('远端删除、本地未改 → 接受删除', () => {
    const base = setting([block('a', 'A'), block('b', 'B')])
    const local = clone(base)
    const remote = setting([block('a', 'A')])

    const merged = mergeSettings(base, local, remote)
    expect(merged.links.map(b => b.id)).toEqual(['a'])
  })

  it('远端删除、但本地改过 → 修改优先于删除', () => {
    const base = setting([block('a', 'A'), block('b', 'B')])
    const local = clone(base)
    local.links[1].title = '本地改过'
    const remote = setting([block('a', 'A')])

    const merged = mergeSettings(base, local, remote)
    expect(merged.links.map(b => b.id)).toEqual(['a', 'b'])
    expect(merged.links[1].title).toBe('本地改过')
  })

  it('本地删除、远端改过 → 保留远端版本', () => {
    const base = setting([block('a', 'A'), block('b', 'B')])
    const local = setting([block('a', 'A')])
    const remote = clone(base)
    remote.links[1].title = '远端改过'

    const merged = mergeSettings(base, local, remote)
    expect(merged.links.map(b => b.id)).toEqual(['a', 'b'])
    expect(merged.links[1].title).toBe('远端改过')
  })

  it('本地删除、远端未改 → 接受删除', () => {
    const base = setting([block('a', 'A'), block('b', 'B')])
    const local = setting([block('a', 'A')])
    const remote = clone(base)

    const merged = mergeSettings(base, local, remote)
    expect(merged.links.map(b => b.id)).toEqual(['a'])
  })

  it('本地无改动时合并结果等于远端内容（isSameContent 判定走"采用远端"分支）', () => {
    const base = setting([block('a', 'A')])
    const local = clone(base)
    const remote = setting([block('a', 'A'), block('c', 'C')], { theme: { solution: 'dark' } })

    const merged = mergeSettings(base, local, remote)
    expect(isSameContent(merged, remote)).toBe(true)
  })

  it('远端无改动时合并结果等于本地内容（走"保持本地"分支）', () => {
    const base = setting([block('a', 'A')])
    const local = setting([block('a', 'A'), block('b', 'B')])
    const remote = clone(base)

    const merged = mergeSettings(base, local, remote)
    expect(isSameContent(merged, local)).toBe(true)
  })

  it('同步元数据不参与合并，保持本地值', () => {
    const base = setting([])
    const local = setting([], { remoteUpdatedAt: 111, remoteVersion: 'v-local', lastSyncedUpdatedAt: 5 })
    const remote = setting([], { remoteUpdatedAt: 999, remoteVersion: 'v-remote' } as Partial<Setting>)

    const merged = mergeSettings(base, local, remote)
    expect(merged.remoteUpdatedAt).toBe(111)
    expect(merged.remoteVersion).toBe('v-local')
    expect(merged.lastSyncedUpdatedAt).toBe(5)
  })
})

describe('isRemoteNewer', () => {
  const settingsWith = (extra: Partial<Setting>) => setting([], extra)

  it('头部修订 == 基线 → 未变化（即使 updated_at 不同也不误判）', () => {
    const gist = { updated_at: '2026-06-11T00:00:09Z', history: [{ version: 'v3' }, { version: 'v2' }] }
    expect(isRemoteNewer(gist, settingsWith({ remoteVersion: 'v3', remoteUpdatedAt: 0 }))).toBe(false)
  })

  it('基线在历史更深处 → 严格更新（同一秒内的推送也能识别）', () => {
    const sameSecond = '2026-06-11T00:00:09Z'
    const gist = { updated_at: sameSecond, history: [{ version: 'v3' }, { version: 'v2' }] }
    const local = settingsWith({ remoteVersion: 'v2', remoteUpdatedAt: new Date(sameSecond).getTime() })
    expect(isRemoteNewer(gist, local)).toBe(true)
  })

  it('基线不在历史中（过期读快照）→ 回退时间戳，更旧则忽略', () => {
    const gist = { updated_at: '2026-06-11T00:00:01Z', history: [{ version: 'v1' }] }
    const local = settingsWith({
      remoteVersion: 'v2',
      remoteUpdatedAt: new Date('2026-06-11T00:00:05Z').getTime(),
    })
    expect(isRemoteNewer(gist, local)).toBe(false)
  })

  it('无版本信息（旧数据迁移）→ 时间戳严格大于才算更新', () => {
    const newer = { updated_at: '2026-06-11T00:00:05Z' }
    const same = { updated_at: '2026-06-11T00:00:03Z' }
    const local = settingsWith({ remoteUpdatedAt: new Date('2026-06-11T00:00:03Z').getTime() })
    expect(isRemoteNewer(newer, local)).toBe(true)
    expect(isRemoteNewer(same, local)).toBe(false)
  })
})
