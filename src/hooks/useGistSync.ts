import type { Setting } from '@/types/setting.type'
import _, { debounce } from 'lodash'
import { useEffect, useRef } from 'react'
import toast from 'react-hot-toast'

import { useTranslation } from 'react-i18next'
import queryClient from '@/components/QueryProvider'
import { gistKeys } from '@/constant/queryKeys/gist'
import { fetchRevision } from '@/service/gist'
import mergeSettings from '@/utils/mergeSettings'
import parseGistContent from '@/utils/parseGistContent'
import { getHeadVersion, isRemoteNewer, isSameContent, serializeSettingsForPush, toMs } from '@/utils/sync'
import { getSyncBase, setSyncBase } from './settings'
import { useGistUpdate } from './useGistMutation'
import { useGistOne } from './useGistQuery'

const DEFAULT_FILE_NAME = 'candi-tab-settings.json'

// 跨标签页互斥：多个新标签页实例可能同时到达推送点，用 Web Locks 串行化；
// 后到者在锁内先 refetch，会看到先到者的推送结果并走回声/合并路径，不会重复推送
function runExclusivePush(fn: () => Promise<void>): Promise<void> {
  const locks = (typeof navigator !== 'undefined' && (navigator as any).locks) || null
  if (locks?.request) {
    return locks.request('candi-tab:gist-push', fn)
  }
  return fn()
}

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
  const settingsRef = useRef(settings)

  useEffect(() => {
    mutationRef.current = mutation
    gistFilesRef.current = gistFiles
    gistIdRef.current = gistId
    tRef.current = t
    oneGistRef.current = oneGist
    patchSettingsRef.current = patchSettings
    settingsRef.current = settings
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
      // 闭包内 TS 无法对 let 保持收窄，固定为 const
      const _fileName = fileName

      pushingRef.current = true
      try {
        await runExclusivePush(async () => {
        // 推送前刷新远程做冲突检测：远程在基线之后被改过 → 本轮不推送，
        // 刷新带来的新数据会触发 useSettings 的合并 effect 做仲裁
        // （回声推进基线 / 拉取远程 / 三方合并），仲裁后若本地仍有未推送修改，
        // settings 变化会自动重新触发推送。过期读（远程更旧）不构成新信息，照常推送。
        // 注意：refetch 必须在锁内执行，等锁的标签页才能看到先行推送的结果。
          try {
            const refetched = await _oneGist.refetch()
            if (refetched.data && isRemoteNewer(refetched.data, currentSettings)) {
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
                [_fileName]: {
                  content: serializeSettingsForPush(currentSettings),
                },
              },
            })

            // 推送成功：基线 = 服务端 updated_at + 修订 SHA；
            // lastSyncedUpdatedAt = 本次推送内容的本地时间戳
            // （若推送期间用户又有修改，updatedAt 已大于它，仍视为未推送，下一轮自动补推）。
            // 时间戳兜底取旧基线（偏小）而不是 Date.now()：基线偏小只会多走一次"回声推进"自愈，
            // 偏大（本地时钟超前）则会把后续真实的远程变更误判为过期读。
            const pushedAt = toMs((result.data as any)?.updated_at) || (currentSettings.remoteUpdatedAt ?? 0)
            const headVersion = getHeadVersion(result.data)
            _patchSettings({
              remoteUpdatedAt: pushedAt,
              remoteVersion: headVersion || currentSettings.remoteVersion,
              lastSyncedUpdatedAt: currentSettings.updatedAt ?? 0,
            })

            // 三方合并的 base 推进为刚推送的内容（先留住旧 base 供竞态补救使用）
            const prevBase = getSyncBase()
            setSyncBase(JSON.parse(serializeSettingsForPush(currentSettings)))

            // 把 PATCH 响应写入查询缓存：缓存内容/时间戳与刚推送的状态保持一致，
            // 后续窗口聚焦 refetch 不再与本地状态打架
            queryClient.setQueryData(gistKeys.detail(_gistId), result)

            toast.success(_t('sync success'), { id: toastId })

            // 推送竞态补救（TOCTOU）：Gist PATCH 没有条件写入，
            // "推送前检查 → PATCH" 的窗口内若有其他设备推送，会被本次推送覆盖。
            // 校验 PATCH 结果的父修订是否是我们已知的基线版本，
            // 不是则取回被覆盖的修订做三方合并，标脏后由下一轮推送自动上行。
            const actualParent = (result.data as any)?.history?.[1]?.version
            const expectedParent = currentSettings.remoteVersion
            if (expectedParent && actualParent && actualParent !== expectedParent && prevBase) {
              await repairClobberedRevision({
                gistId: _gistId,
                sha: actualParent,
                fileName: _fileName,
                base: prevBase,
                pushed: currentSettings,
                patch: _patchSettings,
                t: _t,
              })
            }
          }
          catch (error) {
            console.error(error)
            toast.error(_t('sync failed'), { id: toastId })
          }
        })
      }
      finally {
        pushingRef.current = false
      }
    }, 3000)

    return () => {
      syncRef.current?.cancel()
    }
  }, [])

  // 取回被本次推送覆盖的修订，与已推送内容做三方合并
  async function repairClobberedRevision({
    gistId: _gistId,
    sha,
    fileName,
    base,
    pushed,
    patch,
    t: _t,
  }: {
    gistId: string
    sha: string
    fileName: string
    base: Setting
    pushed: Setting
    patch: (p: Partial<Setting>) => void
    t: (key: string) => string
  }) {
    try {
      const clobbered = await fetchRevision({ gist_id: _gistId, sha })
      const theirs = parseGistContent(clobbered.data, fileName)
      if (!theirs) {
        return
      }

      // 补救期间用户又有修改 → 放弃本次补救，避免覆盖更新的本地内容
      // （被覆盖的修订仍保留在 gist 历史中，不会真正丢失）
      const latest = settingsRef.current
      if (!latest || (latest.updatedAt ?? 0) !== (pushed.updatedAt ?? 0)) {
        console.warn('[sync] skip clobbered-revision repair: local changed during repair')
        return
      }

      const mergedContent = mergeSettings(base, pushed, theirs)
      if (isSameContent(mergedContent, pushed)) {
        // 被覆盖修订的改动是已推送内容的子集 → 无需补救
        return
      }

      toast.success(_t('Remote and local changes merged'))
      // 只下发内容字段并标脏：mergeSettings 会从 local 带回旧的同步元数据，
      // 不能让它覆盖刚推进的基线（remoteVersion / remoteUpdatedAt / lastSyncedUpdatedAt）
      patch({
        ..._.omit(mergedContent, ['remoteUpdatedAt', 'remoteVersion', 'lastSyncedUpdatedAt']),
        updatedAt: Math.max(Date.now(), (pushed.updatedAt ?? 0) + 1),
      })
    }
    catch (err) {
      console.warn('[sync] clobbered-revision repair failed', err)
    }
  }

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
