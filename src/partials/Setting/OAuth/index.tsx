import _ from 'lodash';
import { BiLinkExternal } from '@react-icons/all-files/bi/BiLinkExternal';
import React, { useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';
import classNames from 'classnames';
import { Octokit } from '@octokit/rest';
import { set } from 'lodash/fp';

import Button from '@/components/LinkButton';
import SettingsContext from '@/context/settings.context';
import type { IGist } from '@/types/gist.type';
import { gid } from '@/utils/gid';
import parseGistContent from '@/utils/parseGistContent';
import { useGistAll, useGistOne } from '@/hooks/useGistQuery';
import Input, { InputGroup } from '@/components/Input';
import TextArea from '@/components/TextArea';
import Spin from '@/components/Spin';
import IconText from '@/components/IconText';
import Select from '@/components/Select';
import { useGistCreation, useGistUpdate } from '@/hooks/useGistMutation';
import { setOctokit } from '@/service/gist';

import StyledOauth from './styled';

const uuid = gid();
const OAUTH_URL = `https://github.com/login/oauth/authorize?scope=gist&client_id=9f776027a79806fc1363&redirect_uri=https://candi-tab.vercel.app/api/github?uuid=${uuid}`;

interface GistListProps {
  onSave: () => void;
}

function GistList({ onSave }: GistListProps) {
  const { settings, updateSettings, accessToken } = useContext(SettingsContext);
  const allGist = useGistAll(accessToken);
  const [selectedGist, setSelectedGist] = useState<IGist | undefined>();
  const [selectedFile, setSelectedFile] = useState<string>('');
  const oneGist = useGistOne(selectedGist?.id || settings.gistId);
  const { t } = useTranslation();
  const [isCreateGist, setIsCreateGist] = useState(false);
  const [isCreateFile, setIsCreateFile] = useState(false);
  const [newGist, setNewGist] = useState({
    files: {},
    public: false,
    description: 'Gist created by Candi Tab',
    fileName: 'candi-tab-settings.json',
  });
  const [newFileName, setFileName] = useState('');
  const gistUpdate = useGistUpdate(selectedGist?.id || settings?.gist?.id);
  const gistCreation = useGistCreation({
    onSuccess: (data: any) => {
      const newSettings = {
        // @ts-ignore
        ...parseGistContent(data.data, newGist.fileName),
        gistId: data.data.id,
      };

      newSettings.gist = {
        ..._.pick(data.data, ['description', 'id']),
        fileName: newGist.fileName,
      };
      allGist.refetch();
      updateSettings(newSettings);
      setIsCreateGist(false);
    },
  });

  const files = useMemo(() => {
    if (!oneGist.data) {
      return [];
    }

    // @ts-ignore
    return Object.keys(oneGist.data.files || {}).map((_fileName) => {
      return {
        label: _fileName,
        value: _fileName,
      };
    });
  }, [oneGist]);

  useEffect(() => {
    if (oneGist.isSuccess && !selectedFile) {
      setSelectedFile(settings.gist?.fileName || files?.[0]?.value);
      // @ts-ignore
      setSelectedGist(oneGist.data);
    }
  }, [files, oneGist, selectedFile, settings.gist?.fileName]);

  const gistOptions = useMemo(() => {
    return (allGist.data ?? []).map((gist: IGist) => {
      return {
        label: (
          <div className="flex flex-col">
            <div className="mb-2">ID: {gist.id}</div>
            <div className="text-[var(--gray-color)]">{gist.description}</div>
          </div>
        ),
        value: gist.id,
      };
    });
  }, [allGist.data]);

  const handleSelectGist = useCallback(
    (gistId: string) => {
      const gist = allGist.data?.find((item: IGist) => item.id === gistId);
      setSelectedGist(gist!);
      setSelectedFile('');
    },
    [allGist.data],
  );

  const handleGistChange = useCallback(
    (field: string) => (e: React.ChangeEvent<any>) => {
      setNewGist({
        ...newGist,
        [field]: e.target.value,
      });
    },
    [newGist],
  );

  const handleSaveCreateGist = useCallback(async () => {
    try {
      const gistResponse = await gistCreation.mutateAsync({
        gist: newGist,
        settings,
      });

      allGist.refetch();
      // @ts-ignore
      setSelectedGist(gistResponse.data);
      setIsCreateGist(false);

      updateSettings(
        set('gist')({
          ...newGist,
          id: gistResponse.data.id,
        })(settings),
      );
    } catch (err: any) {
      toast.error(err.toString());
    }
  }, [allGist, gistCreation, newGist, settings, updateSettings]);

  const handleFileOnChange = useCallback((changedFileName: string) => {
    setSelectedFile(changedFileName);
  }, []);

  const handleFileSelect = useCallback(() => {
    if (oneGist?.data && selectedGist?.id) {
      const newSettings = {
        // @ts-ignore
        ...parseGistContent(oneGist.data!, selectedFile),
        gistId: selectedGist.id,
      };

      newSettings.gist = {
        ..._.pick(oneGist.data, ['description', 'id']),
        fileName: selectedFile,
      };

      updateSettings(newSettings);
      onSave?.();
    }
  }, [onSave, oneGist.data, selectedFile, selectedGist?.id, updateSettings]);

  const handleUpdateGist = useCallback(async () => {
    try {
      await gistUpdate.mutateAsync({
        gist_id: selectedGist?.id || settings?.gist?.id || settings?.gistId,
        description: settings?.gist?.description,
        files: {
          [newFileName]: {
            content: JSON.stringify(settings),
          },
        },
      });

      oneGist.refetch();
      setSelectedFile(newFileName);
      setIsCreateFile(false);
      updateSettings(set('gist.fileName', newFileName)(settings));
    } catch (err: any) {
      toast.error(err.toString());
    }
  }, [gistUpdate, selectedGist?.id, settings, newFileName, oneGist, updateSettings]);

  const disabled = useMemo(() => {
    // @ts-ignore
    return !oneGist.data || oneGist.isLoading || !(selectedFile in oneGist.data.files!);
  }, [selectedFile, oneGist.data, oneGist.isLoading]);

  if (gistOptions.length === 0 && !accessToken) {
    return null;
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
          <Select options={gistOptions} value={settings.gistId} onChange={handleSelectGist} />
        </div>
        <div className="flex justify-end mb-4">
          <a href="javascript: void" onClick={() => setIsCreateGist(true)}>
            {t('createGist')}
          </a>
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
          <Select options={files} value={selectedFile} onChange={handleFileOnChange} />
        </div>
        <div className="flex justify-end mb-4">
          <a href="javascript: void" onClick={() => setIsCreateFile(true)}>
            {t('createFile')}
          </a>
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
          onChange={(e) => setFileName(e.target.value)}
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
  );
}

interface OAuthProps {
  onClose: () => void;
}

export default function OAuth({ onClose }: OAuthProps) {
  const { settings, accessToken, updateAccessToken } = useContext(SettingsContext);
  const [tokenValue, setTokenValue] = useState(accessToken);
  const { t } = useTranslation();

  useEffect(() => {
    setTokenValue(accessToken);
  }, [accessToken]);

  const handleOnChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTokenValue(e.target.value);
  };

  const gistId = _.get(settings, `gistId`);
  const oneGist = useGistOne(gistId);
  const allGist = useGistAll(accessToken);

  const handleSave = useCallback(() => {
    setOctokit(
      new Octokit({
        auth: tokenValue,
      }),
    );
    updateAccessToken(tokenValue);
    oneGist.refetch();
  }, [oneGist, tokenValue, updateAccessToken]);

  return (
    <StyledOauth className="oauth-modal-content">
      <InputGroup className="mb-2">
        <Input
          placeholder={t('pasteToken')}
          autoFocus
          onBlur={handleSave}
          onKeyDown={(e) => {
            if (e.which === 13) {
              e.preventDefault();
              handleSave();
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
          text={
            <a href={OAUTH_URL} target="_blank" rel="noreferrer">
              {t('createAccessToken')}
            </a>
          }
        >
          <BiLinkExternal />
        </IconText>
      </div>
      <Spin spinning={allGist.isFetching}>
        <GistList onSave={onClose} />
      </Spin>
    </StyledOauth>
  );
}
