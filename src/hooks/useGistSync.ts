import type { Setting } from '@/types/setting.type'
import { debounce } from 'lodash'
import { useEffect, useRef } from 'react'
import toast from 'react-hot-toast'

import { useTranslation } from 'react-i18next'
import queryClient from '@/components/QueryProvider'
import { gistKeys } from '@/constant/queryKeys/gist'
import { serializeSettingsForPush, toMs } from '@/utils/sync'
import { useGistUpdate } from './useGistMutation'
import { useGistOne } from './useGistQuery'

const DEFAULT_FILE_NAME = 'candi-tab-settings.json'

export function useGistSync(
  settings: Setting | null,
  patchSettings: (patch: Partial<Setting>) => void,
) {
  const { t } = useTranslation()
  const gistId = settings?.gist?.id || settings?.gistId
  const mutation = useGistUpdate(gistId)
  const oneGist = useGistOne(gistId)
  // oneGist.data 经过 select: data => data?.data 已是 GistObject
  const gistFiles = (oneGist.data as any)?.files

  // Refs 保持最新引用，避免在 debounce 闭包内拿到旧值
  const mutationRef = useRef(mutation)
  const gistFilesRef = useRef(gistFiles)
  const gistIdRef = useRef(gistId)
  const tRef = useRef(t)
  const oneGistRef = useRef(oneGist)
  const patchSettingsRef = useRef(patchSettings)

  useEffect(() => {
    mutationRef.current = mutation
    gistFilesRef.current = gistFiles
    gistIdRef.current = gistId
    tRef.current = t
    oneGistRef.current = oneGist
    patchSettingsRef.current = patchSettings
  })

  const syncRef = useRef<any>(null)
  // react-query v4 的 mutation 没有 isPending（v5 才有），用本地 ref 防止并发推送
  const pushingRef = useRef(false)

  useEffect(() => {
    syncRef.current = debounce(async (currentSettings: Setting) => {
      const _gistId = gistIdRef.current
      const _mutation = mutationRef.current
      const _gistFiles = gistFilesRef.current
      const _t = tRef.current
      const _oneGist = oneGistRef.current
      const _patchSettings = patchSettingsRef.current

      if (!currentSettings || !_gistId || pushingRef.current) {
        return
      }

      // 本地无未推送修改：updatedAt 与 lastSyncedUpdatedAt 同源于本地单调序列，
      // 不与 GitHub 服务端时钟跨时钟比较
      if ((currentSettings.updatedAt ?? 0) <= (currentSettings.lastSyncedUpdatedAt ?? 0)) {
        return
      }

      let fileName = currentSettings.gist?.fileName

      // 兼容旧配置：未记录 fileName 时回退（注意：默认文件名是 candi-tab-settings.json）
      if (!fileName && _gistFiles) {
        const keys = Object.keys(_gistFiles)
        if (DEFAULT_FILE_NAME in _gistFiles) {
          fileName = DEFAULT_FILE_NAME
        }
        else if (keys.length === 1) {
          fileName = keys[0]
        }
      }

      if (!fileName) {
        return
      }

      pushingRef.current = true
      try {
        // 推送前刷新远程做冲突检测：远程在基线之后被改过 → 本轮不推送，
        // 刷新带来的新数据会触发 useSettings 的合并 effect 做仲裁（回声推进基线 / 拉取远程 / 冲突取新），
        // 仲裁后若本地仍有未推送修改，settings 变化会自动重新触发推送。
        // 拿到"远程更旧"的过期读（GitHub 最终一致）不构成新信息，照常推送。
        const baseline = currentSettings.remoteUpdatedAt ?? 0
        try {
          const refetched = await _oneGist.refetch()
          const refetchedRemoteUpdatedAt = toMs((refetched.data as any)?.updated_at)
          if (refetchedRemoteUpdatedAt > baseline) {
            return
          }
        }
        catch (err) {
          console.warn('[sync] refetch before push failed', err)
        }

        const toastId = toast.loading(_t('syncing'))

        try {
          const result = await _mutation.mutateAsync({
            gist_id: _gistId,
            description: currentSettings.gist?.description,
            files: {
              [fileName]: {
                content: serializeSettingsForPush(currentSettings),
              },
            },
          })

          // 推送成功：基线 = 服务端 updated_at；lastSyncedUpdatedAt = 本次推送内容的本地时间戳。
          // 若推送期间用户又有修改，updatedAt 已大于它，仍视为未推送，下一轮自动补推。
          // 兜底取 baseline（偏小）而不是 Date.now()：基线偏小只会多走一次"回声推进"自愈，
          // 偏大（本地时钟超前）则会把后续真实的远程变更误判为过期读。
          const pushedAt = toMs((result.data as any)?.updated_at) || baseline
          _patchSettings({
            remoteUpdatedAt: pushedAt,
            lastSyncedUpdatedAt: currentSettings.updatedAt ?? 0,
          })

          // 把 PATCH 响应写入查询缓存：缓存内容/时间戳与刚推送的状态保持一致，
          // 后续窗口聚焦 refetch 不再与本地状态打架
          queryClient.setQueryData(gistKeys.detail(_gistId), result)

          toast.success(_t('sync success'), { id: toastId })
        }
        catch (error) {
          console.error(error)
          toast.error(_t('sync failed'), { id: toastId })
        }
      }
      finally {
        pushingRef.current = false
      }
    }, 3000)

    return () => {
      syncRef.current?.cancel()
    }
  }, [])

  // 首次挂载也允许触发 sync：本地可能带着上次会话未推送的修改
  useEffect(() => {
    if (settings) {
      syncRef.current?.(settings)
    }
    return () => {
      syncRef.current?.cancel()
    }
  }, [settings])
}
