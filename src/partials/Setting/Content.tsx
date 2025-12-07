import { changeLanguage } from 'i18next'
import { set } from 'lodash/fp'
import get from 'lodash/get'
import React, { useCallback, useContext, useMemo } from 'react'
import { useTranslation } from 'react-i18next'

import Select from '@/components/Select'
import MyTabs from '@/components/Tabs'
import SettingsContext from '@/context/settings.context'
import i18n from '@/locales'

import OAuth from './OAuth'
import themes from '@/themes'

export interface SettingContentProps {
  onCheckForUpdate?: () => void
  onClose?: () => void
}

const langOptions = [
  {
    label: 'English',
    value: 'en-US',
  },
  {
    label: '中文-简体',
    value: 'zh-CN',
  },
  {
    label: '中文-繁体',
    value: 'zh-TR',
  },
  {
    label: '日本語',
    value: 'ja-JP',
  },
  {
    label: '한국어',
    value: 'ko-KR',
  },
]

export default function SettingContent({ onClose }: SettingContentProps) {
  const { settings, updateSettings } = useContext(SettingsContext)
  const { t } = useTranslation()

  const handleLangChange = useCallback(
    (value: string) => {
      updateSettings(set('general.language')(value)(settings))
      changeLanguage(value)

      setTimeout(() => {
        document.dispatchEvent(new CustomEvent('sync-upload'))
      }, 1000)
    },
    [settings, updateSettings],
  )

  const handleThemeSolutionChange = useCallback(
    (value: string) => {
      updateSettings(set('theme.solution')(value)(settings))
    },
    [settings, updateSettings],
  )

  const themeOptions = useMemo(() => {
    return Object.entries(themes).map(([key, value]) => ({
      // 按 - 分割，然后首字母大写
      label: key.split('-').map((word) => word.charAt(0).toUpperCase() + word.slice(1)).join(' '),
      value: key,
    }))
  }, [])

  const tabItems = useMemo(() => {
    return [
      {
        title: t('general'),
        key: 'general',
        content: (
          <div>
            <div className="mb-4">
              <div className="mb-2">{t('language')}</div>
              <Select
                options={langOptions}
                value={get(settings, 'general.language') || i18n.language || 'en-US'}
                defaultValue={i18n.language || 'en-US'}
                onChange={handleLangChange}
              />
            </div>
            <div>
              <div className="mb-2">{t('themeSolution')}</div>
              <Select options={themeOptions} value={get(settings, 'theme.solution') || 'github-light'} onChange={handleThemeSolutionChange} />
            </div>
          </div>
        ),
      },
      {
        title: t('synchronization'),
        key: 'synchronization',
        content: <OAuth onClose={onClose || (() => { })} />,
      },
    ]
  }, [handleLangChange, handleThemeSolutionChange, onClose, settings, t])

  return <MyTabs items={tabItems} />
}
