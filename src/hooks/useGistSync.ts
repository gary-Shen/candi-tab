import type { Setting } from '@/types/setting.type'
import { debounce } from 'lodash'
import { useEffect, useRef } from 'react'
import toast from 'react-hot-toast'

import { useTranslation } from 'react-i18next'
import parseGistContent from '@/utils/parseGistContent'
import { useGistUpdate } from './useGistMutation'
import { useGistOne } from './useGistQuery'

export function useGistSync(settings: Setting | null) {
  const { t } = useTranslation()
  const gistId = settings?.gist?.id || settings?.gistId
  const mutation = useGistUpdate(gistId)
  const oneGist = useGistOne(gistId)
  const gistFiles = oneGist.data?.data?.files

  // Create refs to hold latest values to avoid recreating the debounced function
  const mutationRef = useRef(mutation)
  const gistFilesRef = useRef(gistFiles)
  const gistIdRef = useRef(gistId)
  const tRef = useRef(t)
  const oneGistRef = useRef(oneGist)

  // Update refs on every render via effect
  useEffect(() => {
    mutationRef.current = mutation
    gistFilesRef.current = gistFiles
    gistIdRef.current = gistId
    tRef.current = t
    oneGistRef.current = oneGist
  })

  const syncRef = useRef<any>(null)

  useEffect(() => {
    syncRef.current = debounce(async (currentSettings: Setting) => {
      const _gistId = gistIdRef.current
      const _mutation = mutationRef.current
      const _gistFiles = gistFilesRef.current
      const _t = tRef.current
      const _oneGist = oneGistRef.current

      if (!currentSettings || !_gistId || _mutation.isPending) {
        return
      }

      let fileName = currentSettings.gist?.fileName

      // Attempt to find filename if missing (legacy support)
      if (!fileName && _gistFiles) {
        const keys = Object.keys(_gistFiles)
        if (keys.length === 1 || (keys.length === 1 && 'undefined' in _gistFiles)) {
          fileName = keys[0]
        }
        if ('candi_tab_settings.json' in _gistFiles) {
          fileName = 'candi_tab_settings.json'
        }
      }

      if (!fileName) {
        return
      }

      // Check if remote is newer
      const remoteSettings = parseGistContent(_oneGist.data, fileName)
      if (remoteSettings && remoteSettings.updatedAt > currentSettings.updatedAt) {
        // If remote is newer, do not overwrite it.
        // The useSettings hook handles pulling the new data.
        return
      }

      // If timestamps are equal, we interpret that as "synced", so no need to push.
      // This prevents infinite loops if the push just happened and we got a fresh callback.
      if (remoteSettings && remoteSettings.updatedAt === currentSettings.updatedAt) {
        return
      }

      const toastId = toast.loading(_t('syncing'))

      try {
        await _mutation.mutateAsync({
          gist_id: _gistId,
          description: currentSettings.gist?.description,
          files: {
            [fileName]: {
              content: JSON.stringify(currentSettings),
            },
          },
        })
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

  // Use a ref to track if it's the first mount to avoid syncing on load
  const isFirstMount = useRef(true)

  useEffect(() => {
    if (isFirstMount.current) {
      isFirstMount.current = false
      return
    }

    if (settings) {
      syncRef.current?.(settings)
    }

    // Cleanup debounce on unmount
    return () => {
      syncRef.current?.cancel()
    }
  }, [settings])
}
