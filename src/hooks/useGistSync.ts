import type { Setting } from '@/types/setting.type'
import { debounce } from 'lodash'
import { useEffect, useRef } from 'react'
import toast from 'react-hot-toast'

import { useTranslation } from 'react-i18next'
import parseGistContent from '@/utils/parseGistContent'
import { useGistUpdate } from './useGistMutation'
import { useGistOne } from './useGistQuery'

function toMs(iso: string | undefined): number {
  if (!iso) {
    return 0
  }
  const ms = new Date(iso).getTime()
  return Number.isFinite(ms) ? ms : 0
}

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

  useEffect(() => {
    syncRef.current = debounce(async (currentSettings: Setting) => {
      const _gistId = gistIdRef.current
      const _mutation = mutationRef.current
      const _gistFiles = gistFilesRef.current
      const _t = tRef.current
      const _oneGist = oneGistRef.current
      const _patchSettings = patchSettingsRef.current

      if (!currentSettings || !_gistId || _mutation.isPending) {
        return
      }

      // 核心不变量 1：本地存在未推送修改 ⇔ updatedAt > remoteUpdatedAt
      const localRemoteUpdatedAt = currentSettings.remoteUpdatedAt ?? 0
      if ((currentSettings.updatedAt ?? 0) <= localRemoteUpdatedAt) {
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

      // 推送前主动刷新远程，做并发冲突校验：避免覆盖其他设备的最新修改
      let refetchedRemoteUpdatedAt = toMs((_oneGist.data as any)?.updated_at)
      try {
        const refetched = await _oneGist.refetch()
        refetchedRemoteUpdatedAt = toMs((refetched.data as any)?.updated_at) || refetchedRemoteUpdatedAt
      }
      catch (err) {
        console.warn('[sync] refetch before push failed', err)
      }

      // 远程比我们记录的基线更新 → 另一台设备改过；不推送，把决策权交给 useSettings 的合并 effect
      if (refetchedRemoteUpdatedAt && refetchedRemoteUpdatedAt > localRemoteUpdatedAt) {
        toast.error(_t('Remote has newer changes, please retry'))
        return
      }

      // 同时校验：refetched 内容里的 updatedAt 也不能比本地新（防御性兜底）
      const remoteSettings = parseGistContent(_oneGist.data, fileName)
      if (remoteSettings && remoteSettings.updatedAt > currentSettings.updatedAt) {
        return
      }

      const toastId = toast.loading(_t('syncing'))

      try {
        const result = await _mutation.mutateAsync({
          gist_id: _gistId,
          description: currentSettings.gist?.description,
          files: {
            [fileName]: {
              content: JSON.stringify(currentSettings),
            },
          },
        })

        // 推送成功后：用 GitHub 返回的服务端 updated_at 更新本地基线，避免下次重复推送 / 错误地认为远程被外部改过
        const pushedAt = toMs((result.data as any)?.updated_at) || Date.now()
        _patchSettings({ remoteUpdatedAt: pushedAt })

        toast.success(_t('sync success'), { id: toastId })
      }
      catch (error) {
        console.error(error)
        toast.error(_t('sync failed'), { id: toastId })
      }
    }, 3000)

    return () => {
      syncRef.current?.cancel()
    }
  }, [])

  // 首次挂载也允许触发 sync：之前的 isFirstMount 跳过会让"本地有未推送修改但还没改过"的场景永远不上行
  useEffect(() => {
    if (settings) {
      syncRef.current?.(settings)
    }
    return () => {
      syncRef.current?.cancel()
    }
  }, [settings])
}
