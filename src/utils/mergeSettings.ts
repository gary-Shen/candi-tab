import type { Block, Setting } from '@/types/setting.type'
import _ from 'lodash'

/**
 * 三方合并（base = 上次同步快照，local = 本地，remote = 远端）。
 *
 * 规则：
 * - 单侧相对 base 有改动 → 取该侧；双侧都改同一处 → 本地优先（用户正看着的一侧）
 * - 区块/链接按 id 对齐：双侧各自新增的条目都保留
 * - 删除与修改冲突时修改优先（不丢内容）
 * - 同步元数据与 gist 指向不参与合并，保持本地值，由调用方按需覆盖
 */

// 不参与内容合并的字段：updatedAt 由调用方决定；其余为设备本地同步状态
const NON_CONTENT_KEYS = ['updatedAt', 'remoteUpdatedAt', 'remoteVersion', 'lastSyncedUpdatedAt', 'gist']

// 三方择值：本地未改 → 跟随远端；本地改了（无论远端是否改）→ 本地优先
function pick3<T>(base: T, local: T, remote: T): T {
  return _.isEqual(local, base) ? remote : local
}

// 对象按字段三方合并（base 缺失时视为双方同 id 新增，保本地）
function mergeFields<T extends object>(base: T | undefined, local: T, remote: T): T {
  if (!base) {
    return local
  }
  const keys = _.union(Object.keys(base), Object.keys(local), Object.keys(remote))
  const out: any = {}
  for (const key of keys) {
    const value = pick3((base as any)[key], (local as any)[key], (remote as any)[key])
    if (value !== undefined) {
      out[key] = value
    }
  }
  return out
}

interface Identified {
  id: string
}

// id 对齐的列表三方合并。骨架取本地顺序，远端独有的条目追加在尾部。
function mergeById<T extends Identified>(
  base: T[] | undefined,
  local: T[] | undefined,
  remote: T[] | undefined,
  mergeItem: (b: T | undefined, l: T, r: T) => T,
): T[] {
  const baseList = base ?? []
  const localList = local ?? []
  const remoteList = remote ?? []
  const baseMap = new Map(baseList.map(item => [item.id, item]))
  const remoteMap = new Map(remoteList.map(item => [item.id, item]))

  const result: T[] = []
  const seen = new Set<string>()

  for (const localItem of localList) {
    seen.add(localItem.id)
    const baseItem = baseMap.get(localItem.id)
    const remoteItem = remoteMap.get(localItem.id)
    if (remoteItem) {
      // 双侧都有 → 按字段合并
      result.push(mergeItem(baseItem, localItem, remoteItem))
    }
    else if (!baseItem) {
      // 本地新增 → 保留
      result.push(localItem)
    }
    else if (!_.isEqual(localItem, baseItem)) {
      // 远端删除但本地改过 → 修改优先于删除
      result.push(localItem)
    }
    // 其余：base 有、本地未改、远端已删 → 接受删除
  }

  for (const remoteItem of remoteList) {
    if (seen.has(remoteItem.id)) {
      continue
    }
    const baseItem = baseMap.get(remoteItem.id)
    if (!baseItem) {
      // 远端新增 → 保留
      result.push(remoteItem)
    }
    else if (!_.isEqual(remoteItem, baseItem)) {
      // 本地删除但远端改过 → 修改优先于删除
      result.push(remoteItem)
    }
    // 其余：本地删除且远端未改 → 接受删除
  }

  return result
}

function mergeBlock(base: Block | undefined, local: Block, remote: Block): Block {
  const merged = mergeFields(
    base ? (_.omit(base, 'buttons') as Block) : undefined,
    _.omit(local, 'buttons') as Block,
    _.omit(remote, 'buttons') as Block,
  )
  return {
    ...merged,
    buttons: mergeById(base?.buttons, local.buttons, remote.buttons, mergeFields),
  }
}

export default function mergeSettings(base: Setting, local: Setting, remote: Setting): Setting {
  const keys = _.union(Object.keys(base), Object.keys(local), Object.keys(remote)).filter(
    key => !NON_CONTENT_KEYS.includes(key) && key !== 'links',
  )

  const out: any = {}
  for (const key of keys) {
    const value = pick3((base as any)[key], (local as any)[key], (remote as any)[key])
    if (value !== undefined) {
      out[key] = value
    }
  }

  out.links = mergeById(base.links, local.links, remote.links, mergeBlock)

  for (const key of NON_CONTENT_KEYS) {
    if ((local as any)[key] !== undefined) {
      out[key] = (local as any)[key]
    }
  }

  return out as Setting
}
