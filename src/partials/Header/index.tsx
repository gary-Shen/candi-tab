import type { Setting } from '@/types/setting.type'
import { Check, Clipboard, Cog, Edit2, Download, Upload, Info, Menu } from 'lucide-react'
import { set } from 'lodash/fp'
import omit from 'lodash/fp/omit'
import React, { useCallback, useContext, useEffect, useMemo, useState } from 'react'

import { useTranslation } from 'react-i18next'
import MyModal from '@/components/Dialog'
import IconButton from '@/components/IconButton'
import IconText from '@/components/IconText'
import Button from '@/components/LinkButton'
import MyMenu from '@/components/Menu'
import TextArea from '@/components/TextArea'
import SettingsContext from '@/context/settings.context'
import download from '@/utils/download'

import About from '../About'
import SettingModal from '../Setting'

export interface HeaderProps {
  onEdit: (e: React.MouseEvent) => void
  editable?: boolean
}

export default function Header({ onEdit, editable }: HeaderProps) {
  const textRef = React.useRef<HTMLTextAreaElement>(null)
  const { t } = useTranslation()
  const { settings, updateSettings } = useContext(SettingsContext)
  const [oauthVisible, setOauthVisible] = useState(false)
  const [importVisible, setImportVisible] = useState(false)
  const [toImport, setToImport] = useState<Setting | null>(null)

  const handleOpenSyncing = useCallback(() => {
    setOauthVisible(true)
  }, [])
  const handleCloseSyncing = useCallback(() => {
    setOauthVisible(false)
  }, [])

  const handleExport = useCallback(() => {
    download(
      `data:application/json;charset=UTF-8,${encodeURIComponent(JSON.stringify(settings))}`,
      settings.gist?.fileName ?? 'candi-tab-settings.json',
    )
  }, [settings])

  const handleOpenImport = useCallback(() => {
    setImportVisible(true)
  }, [])

  const handleFileOnload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const { files } = e.target

    if (files && files.length) {
      const file = files.item(0)
      const reader = new FileReader()
      reader.readAsText(file!)
      reader.onload = () => {
        let imported
        try {
          imported = JSON.parse(reader.result as string)
        }
        catch {
          // return window.alert(file.name + " doesn't seem to be a valid JSON file.");
        }

        setToImport(imported)
      }
    }
  }, [])

  const handleSaveImport = useCallback(() => {
    if (!toImport) {
      setImportVisible(false)
      return
    }

    const newSettings = {
      ...(omit(['gistId', 'gist'])(toImport) as Setting),
      gistId: settings.gistId,
      createdAt: Date.now(),
    }

    updateSettings(newSettings)
    setImportVisible(false)
  }, [updateSettings, toImport, settings])

  // 关于
  const [aboutVisible, toggleAboutVisible] = useState(false)
  const handleShowAbout = useCallback(() => {
    toggleAboutVisible(true)
  }, [])

  // clipboard
  const [clipboardVisible, toggleClipboardVisible] = useState(false)
  const [clipContent, setClipContent] = useState(settings.clipboard)

  useEffect(() => {
    // eslint-disable-next-line react-hooks-extra/no-direct-set-state-in-use-effect, react-hooks/set-state-in-effect
    setClipContent(settings.clipboard)
  }, [settings.clipboard])

  const handleOpenClipboard = useCallback(() => {
    toggleClipboardVisible(true)
  }, [])
  const handleClipContentChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setClipContent(e.target.value)
  }, [])
  const handleSaveClipboard = useCallback(() => {
    updateSettings(set('clipboard')(clipContent)(settings))
    toggleClipboardVisible(false)
  }, [clipContent, settings, updateSettings])

  const menuOptions = useMemo(() => {
    return [
      {
        key: 'setting',
        title: (
          <IconText text={t('setting')}>
            <Cog />
          </IconText>
        ),
        onClick: handleOpenSyncing,
      },
      {
        key: 'import',
        title: (
          <IconText text={t('import')}>
            <Upload />
          </IconText>
        ),
        onClick: handleOpenImport,
      },
      {
        key: 'export',
        title: (
          <IconText text={t('export')}>
            <Download />
          </IconText>
        ),
        onClick: handleExport,
      },
      {
        key: 'about',
        title: (
          <IconText text={t('about')}>
            <Info />
          </IconText>
        ),
        onClick: handleShowAbout,
      },
    ]
  }, [handleExport, handleOpenImport, handleOpenSyncing, handleShowAbout, t])

  return (
    <>
      <div className="fixed flex top-4 right-4 z-[3]">
        <IconButton onClick={handleOpenClipboard}>
          <Clipboard />
        </IconButton>
        <IconButton onClick={onEdit}>{editable ? <Check /> : <Edit2 />}</IconButton>

        <MyMenu options={menuOptions}>
          <IconButton className="ml-2">
            <Menu />
          </IconButton>
        </MyMenu>
      </div>
      <SettingModal visible={oauthVisible} onClose={handleCloseSyncing} />
      <About visible={aboutVisible} onClose={() => toggleAboutVisible(false)} />
      <MyModal
        title={t('import')}
        visible={importVisible}
        onClose={() => setImportVisible(false)}
        footer={(
          <Button className="w-full" onClick={handleSaveImport}>
            {t('done')}
          </Button>
        )}
      >
        <input type="file" onChange={handleFileOnload} />
      </MyModal>

      <MyModal
        visible={clipboardVisible}
        width={640}
        title={t('clipboard content')}
        footer={(
          <Button className="w-full" type="primary" onClick={handleSaveClipboard}>
            {t('done')}
          </Button>
        )}
        initialFocus={textRef}
        onClose={() => toggleClipboardVisible(false)}
      >
        <form onSubmit={e => e.preventDefault()}>
          <TextArea rows={12} ref={textRef} value={clipContent} onChange={handleClipContentChange} />
        </form>
      </MyModal>
    </>
  )
}
