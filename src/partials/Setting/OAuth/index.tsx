import type { IGist } from '@/types/gist.type'
import { Octokit } from '@octokit/rest'
import classNames from 'classnames'
import _ from 'lodash'
import { ExternalLink } from 'lucide-react'
import React, { useCallback, useContext, useEffect, useMemo, useState } from 'react'
import toast from 'react-hot-toast'

import { useTranslation } from 'react-i18next'
import IconText from '@/components/IconText'
import Input, { InputGroup } from '@/components/Input'
import Button from '@/components/LinkButton'
import Select from '@/components/Select'
import Spin from '@/components/Spin'
import TextArea from '@/components/TextArea'
import SettingsContext from '@/context/settings.context'
import { useGistCreation, useGistUpdate } from '@/hooks/useGistMutation'
import { useGistAll, useGistOne } from '@/hooks/useGistQuery'
import { setOctokit } from '@/service/gist'
import { gid } from '@/utils/gid'
import parseGistContent from '@/utils/parseGistContent'
import { serializeSettingsForPush, toMs } from '@/utils/sync'

const CLIENT_ID = '9f776027a79806fc1363'
const REDIRECT_URI = 'https://candi-tab.vercel.app/api/github'

function buildOAuthUrl(useIdentityApi: boolean): string {
  const uuid = gid()
  if (useIdentityApi && chrome?.identity?.getRedirectURL) {
    // 使用 chrome.identity API 时，通过 state 参数传递 redirect_url
    const extensionRedirectUrl = chrome.identity.getRedirectURL('oauth')
    // 将 uuid 和 redirect_url 编码到 state 参数中
    const state = btoa(JSON.stringify({ uuid, redirect_url: extensionRedirectUrl }))
    return `https://github.com/login/oauth/authorize?scope=gist&client_id=${CLIENT_ID}&redirect_uri=${encodeURIComponent(REDIRECT_URI)}&state=${encodeURIComponent(state)}`
  }
  // 降级方案：手动复制 token
  return `https://github.com/login/oauth/authorize?scope=gist&client_id=${CLIENT_ID}&redirect_uri=${encodeURIComponent(REDIRECT_URI)}`
}

// 用于手动复制 token 的链接
const MANUAL_OAUTH_URL = buildOAuthUrl(false)

interface GistListProps {
  onSave: () => void
}

function GistList({ onSave }: GistListProps) {
  const { settings, patchSettings, accessToken } = useContext(SettingsContext)
  const allGist = useGistAll(accessToken)
  const [selectedGist, setSelectedGist] = useState<IGist | undefined>()
  const [selectedFile, setSelectedFile] = useState<string>('')
  const oneGist = useGistOne(selectedGist?.id || settings.gistId)
  const { t } = useTranslation()
  const [isCreateGist, setIsCreateGist] = useState(false)
  const [isCreateFile, setIsCreateFile] = useState(false)
  const [newGist, setNewGist] = useState({
    files: {},
    public: false,
    description: 'Gist created by Candi Tab',
    fileName: 'candi-tab-settings.json',
  })
  const [newFileName, setFileName] = useState('')
  const gistUpdate = useGistUpdate(selectedGist?.id || settings?.gist?.id)
  const gistCreation = useGistCreation({
    onSuccess: (data: any) => {
      // 兜底取 0 而不是 Date.now()：基线偏小只会多走一次"回声推进"自愈，
      // 偏大（本地时钟超前于服务端）会把后续真实的远程变更误判为过期读
      const remoteUpdatedAt = toMs(data?.data?.updated_at) || 0
      const parsed = parseGistContent(data.data, newGist.fileName)
      // 用 patchSettings 完整替换内容，避免 updateSettings 自增 updatedAt 触发不必要的回推
      patchSettings({
        ...parsed,
        gistId: data.data.id,
        gist: {
          ..._.pick(data.data, ['description', 'id']),
          fileName: newGist.fileName,
        },
        remoteUpdatedAt,
        // 刚创建的 gist 内容即本地内容，标记为已同步
        lastSyncedUpdatedAt: parsed?.updatedAt ?? 0,
      })
      allGist.refetch()
      setIsCreateGist(false)
    },
  })

  const files = useMemo(() => {
    if (!oneGist.data) {
      return []
    }

    // @ts-expect-error Library type mismatch
    return Object.keys(oneGist.data.files || {}).map((_fileName) => {
      return {
        label: _fileName,
        value: _fileName,
      }
    })
  }, [oneGist])

  useEffect(() => {
    if (oneGist.isSuccess && !selectedFile) {
      // eslint-disable-next-line react-hooks-extra/no-direct-set-state-in-use-effect, react-hooks/set-state-in-effect
      setSelectedFile(settings.gist?.fileName || files?.[0]?.value)
      // @ts-expect-error Library type mismatch
      // eslint-disable-next-line react-hooks-extra/no-direct-set-state-in-use-effect
      setSelectedGist(oneGist.data)
    }
  }, [files, oneGist, selectedFile, settings.gist?.fileName])

  const gistOptions = useMemo(() => {
    return (allGist.data ?? []).map((gist: IGist) => {
      return {
        label: (
          <div className="flex flex-col">
            <div className="mb-2">
              ID:
              {gist.id}
            </div>
            <div className="text-[var(--gray-color)]">{gist.description}</div>
          </div>
        ),
        value: gist.id,
      }
    })
  }, [allGist.data])

  const handleSelectGist = useCallback(
    (gistId: string) => {
      const gist = allGist.data?.find((item: IGist) => item.id === gistId)
      setSelectedGist(gist!)
      setSelectedFile('')
    },
    [allGist.data],
  )

  const handleGistChange = useCallback(
    (field: string) => (e: React.ChangeEvent<any>) => {
      setNewGist({
        ...newGist,
        [field]: e.target.value,
      })
    },
    [newGist],
  )

  const handleSaveCreateGist = useCallback(async () => {
    try {
      const gistResponse = await gistCreation.mutateAsync({
        gist: newGist,
        settings,
      })

      // 注意：settings 的更新已在 gistCreation.onSuccess 中通过 patchSettings 写入服务端时间戳。
      // 这里不再调用 updateSettings 避免再次自增 updatedAt 触发回推。
      allGist.refetch()
      // @ts-expect-error Library type mismatch
      setSelectedGist(gistResponse.data)
      setIsCreateGist(false)
    }
    catch (err: any) {
      toast.error(err.toString())
    }
  }, [allGist, gistCreation, newGist, settings])

  const handleFileOnChange = useCallback((changedFileName: string) => {
    setSelectedFile(changedFileName)
  }, [])

  // eslint-disable-next-line react-hooks/preserve-manual-memoization
  const handleFileSelect = useCallback(() => {
    if (oneGist?.data && selectedGist?.id) {
      const remoteUpdatedAt = toMs((oneGist.data as any)?.updated_at) || 0
      const parsed = parseGistContent(oneGist.data!, selectedFile)
      // 切换到指定远程版本：用 patchSettings 完整覆盖内容并写入服务端基线
      // 关键：保留远程内容里的 updatedAt（避免被 updateSettings 自增后误判为本地有未推送修改 → 回推覆盖远程）
      patchSettings({
        ...parsed,
        gistId: selectedGist.id,
        gist: {
          ..._.pick(oneGist.data, ['description', 'id']),
          fileName: selectedFile,
        },
        remoteUpdatedAt,
        // 本地内容即远程版本，标记为已同步
        lastSyncedUpdatedAt: parsed?.updatedAt ?? 0,
      })
      onSave?.()
    }
  }, [onSave, oneGist.data, selectedFile, selectedGist?.id, patchSettings])

  // eslint-disable-next-line react-hooks/preserve-manual-memoization
  const handleUpdateGist = useCallback(async () => {
    try {
      const result = await gistUpdate.mutateAsync({
        gist_id: selectedGist?.id || settings?.gist?.id || settings?.gistId || '',
        description: settings?.gist?.description,
        files: {
          [newFileName]: {
            content: serializeSettingsForPush(settings),
          },
        },
      })

      const remoteUpdatedAt = toMs((result?.data as any)?.updated_at) || 0
      oneGist.refetch()
      setSelectedFile(newFileName)
      setIsCreateFile(false)
      // 推送了新文件后更新本地的 fileName 指向 + 服务端时间戳基线，并标记当前内容已同步
      patchSettings({
        gist: { ...(settings.gist || {} as any), fileName: newFileName },
        remoteUpdatedAt,
        lastSyncedUpdatedAt: settings.updatedAt ?? 0,
      })
    }
    catch (err: any) {
      toast.error(err.toString())
    }
  }, [gistUpdate, selectedGist?.id, settings, newFileName, oneGist, patchSettings])

  const disabled = useMemo(() => {
    // @ts-expect-error Preserving logic despite type mismatch
    return !oneGist.data || oneGist.isLoading || !(selectedFile in oneGist.data.files!)
  }, [selectedFile, oneGist.data, oneGist.isLoading])

  if (gistOptions.length === 0 && !accessToken) {
    return null
  }

  return (
    <div className="max-h-[60vh] mx-[-0.8rem] px-[0.8rem] my-[-3px] py-[3px]">
      <div
        className={classNames({
          block: !isCreateFile && !isCreateGist,
          hidden: isCreateFile || isCreateGist,
        })}
      >
        <div className="mb-2">
          <div>{t('gist')}</div>
          <Select options={gistOptions} value={settings.gistId || ''} onChange={handleSelectGist} />
        </div>
        <div className="flex justify-end mb-4">
          <Button type="link" onClick={() => setIsCreateGist(true)}>
            {t('createGist')}
          </Button>
        </div>
      </div>
      <div
        className={classNames({
          block: !isCreateFile && !isCreateGist,
          hidden: isCreateFile || isCreateGist,
        })}
      >
        <div className="mb-2">
          <div>{t('file')}</div>
          <Select options={files} value={selectedFile || ''} onChange={handleFileOnChange} />
        </div>
        <div className="flex justify-end mb-4">
          <Button type="link" onClick={() => setIsCreateFile(true)}>
            {t('createFile')}
          </Button>
        </div>
        <Button
          disabled={disabled}
          type="primary"
          loading={oneGist.isLoading}
          className="w-full"
          onClick={handleFileSelect}
        >
          {t('useThisFile')}
        </Button>
      </div>
      <div
        className={classNames({
          block: isCreateGist,
          hidden: !isCreateGist,
        })}
      >
        <div className="mb-2">{t('fileName')}</div>
        <Input
          className="mb-4"
          placeholder={t('fileName')}
          onChange={handleGistChange('fileName')}
          value={newGist.fileName}
        />
        <div className="mb-2">{t('description')}</div>
        <TextArea className="mb-2" rows={3} value={newGist.description} onChange={handleGistChange('description')} />

        <div className="flex">
          <Button className="flex-1" type="secondary" onClick={() => setIsCreateGist(false)}>
            {t('cancel')}
          </Button>
          <Button
            className="flex-1 ml-4"
            type="primary"
            loading={gistCreation.isLoading}
            onClick={handleSaveCreateGist}
          >
            {t('save')}
          </Button>
        </div>
      </div>

      <div
        className={classNames({
          block: isCreateFile,
          hidden: !isCreateFile,
        })}
      >
        <div className="mb-2">{t('fileName')}</div>
        <Input
          className="mb-4"
          placeholder={`${t('File name ends with json')}`}
          onChange={e => setFileName(e.target.value)}
          value={newFileName}
        />
        <div className="flex">
          <Button className="flex-1" type="secondary" onClick={() => setIsCreateFile(false)}>
            {t('cancel')}
          </Button>
          <Button
            className="flex-1 ml-2"
            type="primary"
            loading={gistUpdate.isLoading}
            disabled={!newFileName || !newFileName.endsWith('.json')}
            onClick={handleUpdateGist}
          >
            {t('save')}
          </Button>
        </div>
      </div>
    </div>
  )
}

interface OAuthProps {
  onClose: () => void
}

export default function OAuth({ onClose }: OAuthProps) {
  const { settings, accessToken, updateAccessToken } = useContext(SettingsContext)
  const [tokenValue, setTokenValue] = useState(accessToken)
  const [isAuthenticating, setIsAuthenticating] = useState(false)
  const { t } = useTranslation()

  useEffect(() => {
    // eslint-disable-next-line react-hooks-extra/no-direct-set-state-in-use-effect
    setTokenValue(accessToken)
  }, [accessToken])

  const handleOnChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTokenValue(e.target.value)
  }

  const gistId = _.get(settings, `gistId`)
  const oneGist = useGistOne(gistId)
  const allGist = useGistAll(accessToken)

  const handleSave = useCallback(() => {
    setOctokit(
      new Octokit({
        auth: tokenValue,
      }),
    )
    updateAccessToken(tokenValue)
    oneGist.refetch()
  }, [oneGist, tokenValue, updateAccessToken])

  // 使用 chrome.identity API 进行 OAuth 认证
  const handleOAuthLogin = useCallback(async () => {
    if (!chrome?.identity?.launchWebAuthFlow) {
      // 降级：打开手动复制链接
      window.open(MANUAL_OAUTH_URL, '_blank')
      return
    }

    setIsAuthenticating(true)
    try {
      const authUrl = buildOAuthUrl(true)
      const responseUrl = await new Promise<string>((resolve, reject) => {
        chrome.identity.launchWebAuthFlow(
          { url: authUrl, interactive: true },
          (callbackUrl) => {
            if (chrome.runtime.lastError) {
              reject(new Error(chrome.runtime.lastError.message))
            }
            else if (callbackUrl) {
              resolve(callbackUrl)
            }
            else {
              reject(new Error('No callback URL received'))
            }
          },
        )
      })

      // 从回调 URL 中提取 accessToken
      const url = new URL(responseUrl)
      const token = url.searchParams.get('accessToken')

      if (token) {
        setTokenValue(token)
        setOctokit(new Octokit({ auth: token }))
        updateAccessToken(token)
        oneGist.refetch()
        toast.success(t('Authorization successful'))
      }
      else {
        throw new Error('No access token in response')
      }
    }
    catch (err: any) {
      console.error('OAuth error:', err)
      // 用户取消或出错时不显示错误（用户主动取消是正常行为）
      if (!err.message?.includes('canceled') && !err.message?.includes('cancelled')) {
        toast.error(err.message || t('Authorization failed'))
      }
    }
    finally {
      setIsAuthenticating(false)
    }
  }, [oneGist, t, updateAccessToken])

  return (
    <div className="flex flex-col items-end justify-center [&_.oauth-form]:w-full [&_.oauth-form_.mb-3:last-child]:mb-0 oauth-modal-content">
      {!accessToken && (
        <Button
          className="w-full mb-4"
          type="primary"
          loading={isAuthenticating}
          onClick={handleOAuthLogin}
        >
          {t('Login with GitHub')}
        </Button>
      )}
      <InputGroup className="mb-2">
        <Input
          placeholder={t('pasteToken')}
          autoFocus={!!accessToken}
          onBlur={handleSave}
          onKeyDown={(e) => {
            if (e.which === 13) {
              e.preventDefault()
              handleSave()
            }
          }}
          onChange={handleOnChange}
          value={tokenValue}
        />
        <Button className="!px-4" disabled={!tokenValue} onClick={handleSave}>
          {t('proceed')}
        </Button>
      </InputGroup>
      <div className="flex justify-end mb-4">
        <IconText
          position="right"
          text={(
            <a href={MANUAL_OAUTH_URL} target="_blank" rel="noreferrer">
              {t('createAccessToken')}
            </a>
          )}
        >
          <ExternalLink size={16} />
        </IconText>
      </div>
      <Spin spinning={allGist.isFetching}>
        <GistList onSave={onClose} />
      </Spin>
    </div>
  )
}
