import type { Block, Link, Setting } from '@/types/setting.type'
import _ from 'lodash'
import update from 'lodash/fp/update'
import { useCallback, useEffect, useRef, useState } from 'react'

import toast from 'react-hot-toast'
import { useTranslation } from 'react-i18next'
import { gid } from '@/utils/gid'
import mergeSettings from '@/utils/mergeSettings'
import parseGistContent from '@/utils/parseGistContent'
import { getHeadVersion, isRemoteNewer, isSameContent, serializeSettingsForPush, toMs } from '@/utils/sync'

import defaultSettings from '../default-settings.json'
import { adoptSyncBase, getSyncBase, load, loadSyncBase, save, setSyncBase } from './settings'
import { subscribe } from './storage'
import { useGistOne } from './useGistQuery'

const setIds = update('links')((blocks: Block[]) =>
  blocks.map((block) => {
    const extra = {
      id: gid(),
    }

    const mapLink = (link: Link) => {
      const withId = {
        id: gid(),
      }

      if (!link.id) {
        return {
          ...link,
          ...withId,
        }
      }

      return link
    }

    if (!block.id) {
      return {
        ...block,
        ...extra,
        buttons: block?.buttons?.map(mapLink),
      }
    }
    return {
      ...block,
      buttons: block?.buttons?.map(mapLink),
    }
  }),
)

// 本地是否有未推送修改：updatedAt 与 lastSyncedUpdatedAt 同源于本地单调序列，
// 不与 GitHub 服务端时钟跨时钟比较（时钟偏差曾导致漏推送/误判冲突）
function hasUnpushedChanges(settings: Setting | null | undefined): boolean {
  if (!settings) {
    return false
  }
  return (settings.updatedAt ?? 0) > (settings.lastSyncedUpdatedAt ?? 0)
}

export default function useSettings(): [
  Setting | null,
  (settings: Setting) => void,
  (patch: Partial<Setting>) => void,
] {
  const { i18n, t } = useTranslation()
  const [settings, setSettings] = useState<Setting | null>(null)
  const settingsRef = useRef<Setting | null>(null)
  const localLoadedRef = useRef(false)
  const gist = settings?.gist || ({} as any)

  const oneGist = useGistOne(gist.id || settings?.gistId)

  // 始终保持 ref 与最新 settings 同步，给异步逻辑读取
  useEffect(() => {
    settingsRef.current = settings
  }, [settings])

  useEffect(() => {
    Promise.all([load(), loadSyncBase()]).then(([result]) => {
      const newSettings = setIds({ ...defaultSettings, ...result })
      // 迁移：旧版本没有 lastSyncedUpdatedAt，按旧不变量推导
      // （updatedAt ≤ remoteUpdatedAt 视为已同步，否则视为有未推送修改）
      if (newSettings.lastSyncedUpdatedAt === undefined) {
        newSettings.lastSyncedUpdatedAt
          = (newSettings.updatedAt ?? 0) <= (newSettings.remoteUpdatedAt ?? 0) ? (newSettings.updatedAt ?? 0) : 0
      }
      // 播种三方合并的 base：本地处于"已同步"状态时，本地内容就是上次同步时的
      // 远端内容，可直接作为 base。否则升级后第一次遇到冲突会因为没有快照
      // 走整文档 LWW 兜底，可能把其他设备的新修改整体顶掉。
      if (
        !getSyncBase()
        && (newSettings.remoteUpdatedAt || newSettings.remoteVersion)
        && (newSettings.updatedAt ?? 0) <= (newSettings.lastSyncedUpdatedAt ?? 0)
      ) {
        setSyncBase(JSON.parse(serializeSettingsForPush(newSettings)))
      }
      localLoadedRef.current = true
      settingsRef.current = newSettings
      setSettings(newSettings)
    })
  }, [])

  // 跨标签页同步：每个新标签页都是独立实例，共享存储但内存状态互不感知。
  // 监听存储变更并采纳其他标签页写入的新状态，避免双方各持旧状态互相覆盖。
  useEffect(() => {
    const unsubscribeSettings = subscribe('settings', (incoming: Setting | null) => {
      if (!incoming || !localLoadedRef.current) {
        return
      }
      const current = settingsRef.current
      // 回声（本页自己的写入）或无变化 → 忽略
      if (_.isEqual(incoming, current)) {
        return
      }
      // 过期写入（并发竞态下的旧值）→ 忽略；updatedAt 同机同源，可直接比较。
      // 等于也采纳：patchSettings 只改同步元数据（基线等）不自增 updatedAt
      if ((incoming.updatedAt ?? 0) < (current?.updatedAt ?? 0)) {
        return
      }
      settingsRef.current = incoming
      setSettings(incoming)
    })

    // 其他标签页推进了三方合并的 base → 跟随更新本实例缓存
    const unsubscribeSyncBase = subscribe('syncBase', (incoming: Setting | null) => {
      adoptSyncBase(incoming ?? null)
    })

    return () => {
      unsubscribeSettings()
      unsubscribeSyncBase()
    }
  }, [])

  // 远程 Gist → 本地的合并：以修订 SHA（回退服务端 updated_at）判断远端是否真有更新
  useEffect(() => {
    if (!oneGist.isSuccess || !localLoadedRef.current) {
      return
    }

    const current = settingsRef.current

    // 只处理"远端严格新于基线"：未变化与过期读（GitHub API 最终一致 /
    // 与推送竞态的旧请求）一律忽略。过期读绝不能覆盖本地，
    // 否则刚添加的内容会被旧数据顶掉——这是此前内容丢失的根因之一。
    if (!isRemoteNewer(oneGist.data, current)) {
      return
    }

    const remoteServerUpdatedAt = toMs((oneGist.data as any)?.updated_at)
    const remoteVersion = getHeadVersion(oneGist.data)

    const parsed = parseGistContent(oneGist.data!, current?.gist?.fileName)
    if (!parsed) {
      return
    }

    const applyNext = (next: Setting) => {
      settingsRef.current = next
      // eslint-disable-next-line react-hooks-extra/no-direct-set-state-in-use-effect
      setSettings(next)
      save(next)
    }

    // 内容与本地一致（典型场景：刚推送完成后远程回来的同一份数据），推进基线并标记已同步
    if (isSameContent(parsed, current)) {
      setSyncBase(parsed)
      applyNext({
        ...current!,
        remoteUpdatedAt: remoteServerUpdatedAt,
        remoteVersion,
        lastSyncedUpdatedAt: current!.updatedAt ?? 0,
      })
      return
    }

    const hasLocalUnpushed = hasUnpushedChanges(current)
    const base = getSyncBase()

    // 本地无未推送修改 → 正常拉取远端
    if (!hasLocalUnpushed || !current) {
      setSyncBase(parsed)
      const merged: Setting = {
        ...parsed,
        remoteUpdatedAt: remoteServerUpdatedAt,
        remoteVersion,
        lastSyncedUpdatedAt: parsed.updatedAt ?? 0,
      }
      merged.gist = {
        ...(parsed.gist || {}),
        ..._.pick(oneGist.data, ['description', 'id']),
      }
      applyNext(merged)
      return
    }

    // 真冲突（双方都有修改）+ 有上次同步快照 → 区块级三方合并，双方修改都保留
    if (base) {
      const mergedContent = mergeSettings(base, current, parsed)
      setSyncBase(parsed)

      // 合并结果 == 远端（本地改动是远端的子集）→ 采用远端，标记已同步
      if (isSameContent(mergedContent, parsed)) {
        const next: Setting = {
          ...mergedContent,
          remoteUpdatedAt: remoteServerUpdatedAt,
          remoteVersion,
          updatedAt: current.updatedAt ?? 0,
          lastSyncedUpdatedAt: current.updatedAt ?? 0,
        }
        next.gist = {
          ...(parsed.gist || {}),
          ..._.pick(oneGist.data, ['description', 'id']),
        }
        applyNext(next)
        return
      }

      // 合并结果 == 本地（远端改动是本地的子集）→ 内容保持本地，只推进基线，
      // 保持"未推送"状态，由 useGistSync 的推送流程覆盖远端
      if (isSameContent(mergedContent, current)) {
        applyNext({ ...current, remoteUpdatedAt: remoteServerUpdatedAt, remoteVersion })
        return
      }

      // 双方都有独立改动 → 应用合并结果，标脏等待推送（合并结果需要上行到远端）
      toast.success(t('Remote and local changes merged'))
      applyNext({
        ...mergedContent,
        remoteUpdatedAt: remoteServerUpdatedAt,
        remoteVersion,
        updatedAt: Math.max(Date.now(), (current.updatedAt ?? 0) + 1),
        lastSyncedUpdatedAt: current.lastSyncedUpdatedAt ?? 0,
      })
      return
    }

    // 无快照（升级迁移期）→ 退回整文档 LWW：取内容时间戳较新的一方，平局保本地
    if ((current.updatedAt ?? 0) >= (parsed.updatedAt ?? 0)) {
      applyNext({ ...current, remoteUpdatedAt: remoteServerUpdatedAt, remoteVersion })
      return
    }

    toast.error(t('Remote changes detected, local edits discarded'))
    setSyncBase(parsed)
    const merged: Setting = {
      ...parsed,
      remoteUpdatedAt: remoteServerUpdatedAt,
      remoteVersion,
      lastSyncedUpdatedAt: parsed.updatedAt ?? 0,
    }
    merged.gist = {
      ...(parsed.gist || {}),
      ..._.pick(oneGist.data, ['description', 'id']),
    }
    applyNext(merged)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [oneGist.data, oneGist.isSuccess])

  const updateSettings = useCallback(
    async (newSettings: Setting) => {
      // 无变化守卫：内容没有实际改动时不刷新 updatedAt（不变脏、不触发同步）。
      // 否则 UI 层的回声（如 react-grid-layout 挂载时的 onLayoutChange）
      // 会把旧内容标记成"刚刚修改过"，在冲突仲裁中错误地压过其他设备的新内容。
      if (settingsRef.current && _.isEqual(
        _.omit(newSettings, 'updatedAt'),
        _.omit(settingsRef.current, 'updatedAt'),
      )) {
        return
      }
      i18n.changeLanguage(newSettings?.general?.language || chrome?.i18n?.getUILanguage() || 'en-US')
      // 单调递增的本地业务时间戳：max(Date.now(), prev+1)，避免时钟回拨/同毫秒覆盖
      const prevUpdatedAt = settingsRef.current?.updatedAt ?? 0
      const _value: Setting = {
        ...newSettings,
        updatedAt: Math.max(Date.now(), prevUpdatedAt + 1),
      }
      settingsRef.current = _value
      setSettings(() => _value)
      save(_value)
    },
    [i18n],
  )

  // 局部更新（不动 updatedAt）：用于推送/拉取流程回写 remoteUpdatedAt 等同步元数据
  const patchSettings = useCallback((patch: Partial<Setting>) => {
    const current = settingsRef.current
    if (!current) {
      return
    }
    const next = { ...current, ...patch }
    settingsRef.current = next
    setSettings(next)
    save(next)
  }, [])

  return [settings, updateSettings, patchSettings]
}
