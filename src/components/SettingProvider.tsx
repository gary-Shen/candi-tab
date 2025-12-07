import type { PropsWithChildren } from 'react'
import type { SettingsContextType } from '../context/settings.context'
import { Octokit } from '@octokit/rest'
import { useQueryClient } from '@tanstack/react-query'
import React, { useEffect, useMemo } from 'react'

import { Toaster } from 'react-hot-toast'
import { gistKeys } from '@/constant/queryKeys/gist'
import useSettings from '@/hooks/useSettings'
import useStorage from '@/hooks/useStorage'

import { destroyOctokit, setOctokit } from '@/service/gist'
import SettingsContext from '../context/settings.context'

export default function SettingProvider({ children }: PropsWithChildren) {
  const [accessToken, setAccessToken] = useStorage('accessToken')
  const [settings, updateSettings] = useSettings()
  const queryClient = useQueryClient()
  const value = useMemo(() => {
    return {
      updateSettings,
      settings,
      accessToken,
      updateAccessToken: setAccessToken,
    }
  }, [updateSettings, settings, accessToken, setAccessToken])

  useEffect(() => {
    if (!accessToken) {
      queryClient.setQueryData(gistKeys.lists(), undefined)
      return
    }

    setOctokit(
      new Octokit({
        auth: accessToken,
      }),
    )

    return () => {
      destroyOctokit()
    }
  }, [accessToken, queryClient])

  return (
    <SettingsContext.Provider value={value as NonNullable<SettingsContextType>}>
      <>
        {children}
        <Toaster position="bottom-right" reverseOrder={false} />
      </>
    </SettingsContext.Provider>
  )
}
