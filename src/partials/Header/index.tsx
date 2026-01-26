import type { Setting } from '@/types/setting.type'
import { set } from 'lodash/fp'
import omit from 'lodash/fp/omit'
import { Check, ClipboardPen, Cog, Download, Info, Menu, Edit, Search, Upload } from 'lucide-react'
import React, { useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'

import MyModal from '@/components/Dialog'
import IconButton from '@/components/IconButton'
import IconText from '@/components/IconText'
import Input from '@/components/Input'
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
  const searchInputRef = React.useRef<HTMLInputElement>(null)
  const { t } = useTranslation()
  const { settings, updateSettings } = useContext(SettingsContext)
  const [oauthVisible, setOauthVisible] = useState(false)
  const [importVisible, setImportVisible] = useState(false)
  const [toImport, setToImport] = useState<Setting | null>(null)
  const [search, setSearch] = useState('')
  const [searchFocused, setSearchFocused] = useState(false)

  // 监听 Cmd+F / Ctrl+F 快捷键
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'f') {
        e.preventDefault()
        searchInputRef.current?.focus()
        searchInputRef.current?.select()
      }
      // ESC 关闭搜索
      if (e.key === 'Escape' && searchFocused) {
        searchInputRef.current?.blur()
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [searchFocused])

  const handleSearchFocus = useCallback(() => {
    setSearchFocused(true)
  }, [])

  const handleSearchBlur = useCallback(() => {
    setSearchFocused(false)
  }, [])

  const handleSearch = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && search) {
      const lowerSearch = search.toLowerCase()
      const matches: string[] = []

      for (const block of settings.links) {
        for (const link of block.buttons || []) {
          if (
            link.title?.toLowerCase().includes(lowerSearch)
            || link.url?.toLowerCase().includes(lowerSearch)
            || (link.menu && link.menu.some(m => m.title?.toLowerCase().includes(lowerSearch) || m.url?.toLowerCase().includes(lowerSearch)))
          ) {
            matches.push(link.id)
          }
        }
      }

      matches.forEach((id, index) => {
        const el = document.querySelector(`[data-link-id="${id}"]`)
        if (el) {
          if (index === 0) {
            el.scrollIntoView({ behavior: 'smooth', block: 'center' })
          }
          el.classList.add('flash-animation')
          setTimeout(() => {
            el.classList.remove('flash-animation')
          }, 1000)
        }
      })
    }
  }, [search, settings.links])

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
            <Cog size={16} />
          </IconText>
        ),
        onClick: handleOpenSyncing,
      },
      {
        key: 'import',
        title: (
          <IconText text={t('import')}>
            <Upload size={16} />
          </IconText>
        ),
        onClick: handleOpenImport,
      },
      {
        key: 'export',
        title: (
          <IconText text={t('export')}>
            <Download size={16} />
          </IconText>
        ),
        onClick: handleExport,
      },
      {
        key: 'about',
        title: (
          <IconText text={t('about')}>
            <Info size={16} />
          </IconText>
        ),
        onClick: handleShowAbout,
      },
    ]
  }, [handleExport, handleOpenImport, handleOpenSyncing, handleShowAbout, t])

  return (
    <>
      <div className="fixed top-0 left-0 w-full h-16 z-50 backdrop-blur-md bg-[rgba(255,255,255,0.01)] border-b border-transparent transition-colors duration-300">
        <div className="flex items-center w-full max-w-[1240px] px-5 mx-auto h-full">
          {/* 搜索框 - 聚焦时占满宽度 */}
          <div
            className={`search-container relative transition-all duration-300 ease-out ${
              searchFocused ? 'w-full' : 'w-64'
            }`}
          >
            <Input
              ref={searchInputRef}
              className={`!pl-10 transition-all duration-300 ease-out ${
                searchFocused
                  ? 'bg-form-inset border-default'
                  : 'bg-transparent border-transparent hover:bg-form-inset'
              }`}
              placeholder={searchFocused ? `${t('search')}... (Enter ${t('confirm')}, Esc ${t('close')})` : t('search')}
              value={search}
              onChange={e => setSearch(e.target.value)}
              onKeyDown={handleSearch}
              onFocus={handleSearchFocus}
              onBlur={handleSearchBlur}
            />
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none w-4 h-4"
            />
          </div>

          {/* 右侧菜单 - 聚焦搜索时隐藏 */}
          <div
            className={`flex items-center flex-shrink-0 transition-all duration-300 ease-out ${
              searchFocused
                ? 'opacity-0 w-0 overflow-hidden ml-0'
                : 'opacity-100 ml-auto'
            }`}
          >
            <IconButton onClick={handleOpenClipboard}>
              <ClipboardPen size={16} />
            </IconButton>
            <IconButton onClick={onEdit}>{editable ? <Check size={16} /> : <Edit size={16} />}</IconButton>

            <MyMenu options={menuOptions}>
              <IconButton className="ml-2">
                <Menu size={16} />
              </IconButton>
            </MyMenu>
          </div>
        </div>
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
