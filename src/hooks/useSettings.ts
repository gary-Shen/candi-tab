import type { Block, Link, Setting } from '@/types/setting.type'
import _ from 'lodash'
import update from 'lodash/fp/update'
import { useCallback, useEffect, useState } from 'react'

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

export default function useSettings(): [
  Setting | null,
  (settings: Setting) => void,
] {
  const { i18n } = useTranslation()
  const [settings, setSettings] = useState<Setting | null>(null)
  const gist = settings?.gist || ({} as any)

  const oneGist = useGistOne(gist.id || settings?.gistId)

  useEffect(() => {
    load().then((result) => {
      const newSettings = setIds({ ...defaultSettings, ...result })

      // 根据用户保存的语言设置更新 i18n
      if (newSettings?.general?.language) {
        i18n.changeLanguage(newSettings.general.language)
      }

      setSettings(newSettings)
    })
  }, [i18n])

  // fetch gist on first load
  useEffect(() => {
    if (!oneGist.isSuccess) {
      return
    }
    const newSettings = parseGistContent(oneGist.data!, settings?.gist?.fileName)

    if (!newSettings) {
      return
    }

    // 如果本地更新或时间戳相等，不覆盖本地设置
    if (settings?.updatedAt && newSettings.updatedAt <= settings?.updatedAt) {
      return
    }
    else if (settings?.createdAt && newSettings.createdAt && newSettings.createdAt <= settings?.createdAt) {
      // 兼容旧配置
      return
    }

    newSettings.gist = {
      ...newSettings.gist,
      ..._.pick(oneGist.data, ['description', 'id']),
    }

    // eslint-disable-next-line react-hooks-extra/no-direct-set-state-in-use-effect
    setSettings(newSettings)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [oneGist.data, oneGist.isSuccess])

  const updateSettings = useCallback(
    async (newSettings: Setting) => {
      i18n.changeLanguage(newSettings?.general?.language || chrome?.i18n?.getUILanguage() || 'en-US')
      const _value = {
        ...newSettings,
        updatedAt: Date.now(),
      }
      setSettings(() => {
        return _value
      })
      save(_value)
    },
    [i18n],
  )

  return [settings, updateSettings]
}
