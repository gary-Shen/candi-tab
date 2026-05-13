import type { Block, Link, Setting } from '@/types/setting.type'
import _ from 'lodash'
import update from 'lodash/fp/update'
import { useCallback, useEffect, useRef, useState } from 'react'

import toast from 'react-hot-toast'
import { useTranslation } from 'react-i18next'
import { gid } from '@/utils/gid'
import parseGistContent from '@/utils/parseGistContent'

import defaultSettings from '../default-settings.json'
import { load, save } from './settings'
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

function toMs(iso: string | undefined): number {
  if (!iso) {
    return 0
  }
  const ms = new Date(iso).getTime()
  return Number.isFinite(ms) ? ms : 0
}

// 排除瞬态/同步字段后比较内容是否相同，避免"自己刚推送的回声"触发覆盖
function isSameContent(a: Setting | null | undefined, b: Setting | null | undefined): boolean {
  if (!a || !b) {
    return false
  }
  const omitKeys: (keyof Setting)[] = ['updatedAt', 'createdAt', 'remoteUpdatedAt', 'gist']
  return _.isEqual(_.omit(a, omitKeys as string[]), _.omit(b, omitKeys as string[]))
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
    load().then((result) => {
      const newSettings = setIds({ ...defaultSettings, ...result })
      localLoadedRef.current = true
      settingsRef.current = newSettings
      setSettings(newSettings)
    })
  }, [])

  // 远程 Gist → 本地的合并：以 GitHub 服务端 updated_at 作为权威时间戳，避免本地时钟漂移导致漏同步
  useEffect(() => {
    if (!oneGist.isSuccess || !localLoadedRef.current) {
      return
    }

    const current = settingsRef.current
    const remoteServerUpdatedAt = toMs((oneGist.data as any)?.updated_at)
    if (!remoteServerUpdatedAt) {
      return
    }

    const localRemoteUpdatedAt = current?.remoteUpdatedAt ?? 0

    // 远程 updated_at 与本地记录的"上次同步时的服务端时间戳"一致，说明远程未变更
    if (remoteServerUpdatedAt === localRemoteUpdatedAt) {
      return
    }

    const parsed = parseGistContent(oneGist.data!, current?.gist?.fileName)
    if (!parsed) {
      return
    }

    // 内容与本地一致（典型场景：刚推送完成后远程回来的同一份数据），只刷新基线
    if (isSameContent(parsed, current)) {
      const next = { ...current!, remoteUpdatedAt: remoteServerUpdatedAt }
      settingsRef.current = next
      // eslint-disable-next-line react-hooks-extra/no-direct-set-state-in-use-effect
      setSettings(next)
      save(next)
      return
    }

    // 本地存在未推送修改且与远程内容不同 → 真正的冲突。远程优先，避免静默丢弃他人在远程的修改。
    const hasLocalUnpushed = (current?.updatedAt ?? 0) > localRemoteUpdatedAt
    if (hasLocalUnpushed) {
      toast.error(t('Remote changes detected, local edits discarded'))
    }

    const merged: Setting = {
      ...parsed,
      remoteUpdatedAt: remoteServerUpdatedAt,
    }
    merged.gist = {
      ...(parsed.gist || {}),
      ..._.pick(oneGist.data, ['description', 'id']),
    }

    settingsRef.current = merged
    // eslint-disable-next-line react-hooks-extra/no-direct-set-state-in-use-effect
    setSettings(merged)
    save(merged)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [oneGist.data, oneGist.isSuccess])

  const updateSettings = useCallback(
    async (newSettings: Setting) => {
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
