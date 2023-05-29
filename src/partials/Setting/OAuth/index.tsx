import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import dayjs from 'dayjs';
import _ from 'lodash';
import { BiLinkExternal } from '@react-icons/all-files/bi/BiLinkExternal';
import React, { useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

// import Card from '@/components/Card';
import { Transition } from '@headlessui/react';
import classNames from 'classnames';
import { Octokit } from '@octokit/rest';

import Button from '@/components/LinkButton';
import Modal from '@/components/Dialog';
import SettingsContext from '@/context/settings.context';
import * as gistService from '@/service/gist';
import type { IGist } from '@/types/gist.type';
import { calcLayout } from '@/utils/calcLayout';
import { gid } from '@/utils/gid';
import parseGistContent from '@/utils/parseGistContent';
import { useGistAll, useGistOne } from '@/hooks/useGistQuery';
import Input from '@/components/Input';
import TextArea from '@/components/TextArea';
import Spin from '@/components/Spin';
import MyRadioGroup from '@/components/RadioGroup';
import IconText from '@/components/IconText';
import Select from '@/components/Select';
import { useGistCreation } from '@/hooks/useGistMutation';
import { setOctokit } from '@/service/gist';

import StyledOauth from './styled';

const spinner = <Spin />;

const uuid = gid();
const OAUTH_URL = `https://github.com/login/oauth/authorize?scope=gist&client_id=9f776027a79806fc1363&redirect_uri=https://candi-tab.vercel.app/api/github?uuid=${uuid}`;

function GistList() {
  const { settings, updateSettings, accessToken } = useContext(SettingsContext);
  const allGist = useGistAll(accessToken);
  const [selectedGist, setSelectedGist] = useState<IGist | undefined>();
  const [selectedFile, setSelectedFile] = useState<string>('');
  const oneGist = useGistOne(selectedGist?.id || settings.gistId);
  const { t } = useTranslation();

  const files = useMemo(() => {
    if (!oneGist.data) {
      return [];
    }

    return Object.keys(oneGist.data.files || {}).map((fileName) => {
      return {
        label: fileName,
        value: fileName,
      };
    });
  }, [oneGist]);

  useEffect(() => {
    if (oneGist.isSuccess && !selectedFile) {
      setSelectedFile(settings.gist?.fileName || files?.[0]?.value);
      setSelectedGist(oneGist.data);
    }
  }, [files, oneGist, selectedFile, settings.gist?.fileName]);

  const gistOptions = useMemo(() => {
    return (allGist.data ?? []).map((gist) => {
      return {
        label: gist.description,
        value: gist.id,
      };
    });
  }, [allGist.data]);

  const handleSelectGist = useCallback(
    (gistId: string) => {
      const gist = allGist.data?.find((item) => item.id === gistId);
      setSelectedGist(gist!);
      setSelectedFile('');
    },
    [allGist.data],
  );
  const handleSelectFile = useCallback((changedFileName: string) => {
    setSelectedFile(changedFileName);
  }, []);

  const handleSave = useCallback(() => {
    if (oneGist?.data && selectedGist?.id) {
      const newSettings = {
        gistId: selectedGist.id,
        // @ts-ignore
        ...parseGistContent(oneGist.data!, selectedFile),
      };

      newSettings.gist = {
        ..._.pick(oneGist.data, ['description', 'id']),
        fileName: selectedFile,
      };

      updateSettings(newSettings);
    }
  }, [oneGist.data, selectedFile, selectedGist?.id, updateSettings]);

  const disabled = useMemo(() => {
    return !oneGist.data || oneGist.isLoading || !(selectedFile in oneGist.data.files!);
  }, [selectedFile, oneGist.data, oneGist.isLoading]);

  if (gistOptions.length === 0) {
    return null;
  }

  return (
    <div className="max-h-[60vh] mx-[-0.8rem] px-[0.8rem] my-[-3px] py-[3px]">
      <div className="mb-2">
        <div>{t('gist')}</div>
        <Select options={gistOptions} value={settings.gistId} onChange={handleSelectGist} />
      </div>
      <div className="flex justify-end mb-4">
        <a href={OAUTH_URL} target="_blank" rel="noreferrer">
          {t('createGist')}
        </a>
      </div>
      <div className="mb-2">
        <div>{t('file')}</div>
        <Select options={files} value={selectedFile} onChange={handleSelectFile} />
      </div>
      <div className="flex justify-end mb-4">
        <a href={OAUTH_URL} target="_blank" rel="noreferrer">
          {t('createFile')}
        </a>
      </div>
      <Button disabled={disabled} type="primary" loading={oneGist.isLoading} className="w-full" onClick={handleSave}>
        {t('useThisFile')}
      </Button>
    </div>
  );
}

export default function OAuth() {
  const { settings, updateSettings, accessToken, updateAccessToken } = useContext(SettingsContext);
  const [tokenValue, setTokenValue] = useState(accessToken);
  const { t } = useTranslation();

  useEffect(() => {
    setTokenValue(accessToken);
  }, [accessToken]);

  const handleOnChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTokenValue(e.target.value);
  };

  /** ========================== 选中gist ========================== */

  const gistId = _.get(settings, `gistId`);
  const oneGist = useGistOne(gistId);
  const allGist = useGistAll(accessToken);

  console.log('accessToken', accessToken, oneGist, allGist.isLoading);

  const handleSave = useCallback(() => {
    setOctokit(
      new Octokit({
        auth: tokenValue,
      }),
    );
    updateAccessToken(tokenValue);
    oneGist.refetch();
  }, [oneGist, tokenValue, updateAccessToken]);

  /** ========================== 选中gist ========================== */

  /** ========================== 创建gist ========================== */
  const [createGistModalVisible, toggleCreateGistModalVisible] = useState(false);

  const [gistForm, setGistForm] = useState({
    files: {},
    public: false,
    description: 'Gist created by Candi Tab',
    fileName: 'candi-tab-settings.json',
  });
  const gistCreation = useGistCreation({
    onSuccess: (data) => {
      allGist.refetch();
      const newSettings = {
        gistId: data.data.id,
        // @ts-ignore
        ...parseGistContent(data.data, gistForm.fileName),
      };

      newSettings.gist = {
        ..._.pick(data.data, ['description', 'id']),
        fileName: gistForm.fileName,
      };
      updateSettings(newSettings);
      toggleCreateGistModalVisible(false);
    },
  });
  const handleCreateGist = useCallback(() => {
    toggleCreateGistModalVisible(true);
  }, []);
  const handleGistChange = useCallback(
    (field: string) => (e: React.ChangeEvent<any>) => {
      setGistForm({
        ...gistForm,
        [field]: e.target.value,
      });
    },
    [gistForm],
  );
  const handleSaveCreateGist = useCallback(() => {
    gistCreation.mutate({
      gist: gistForm,
      settings,
    });
  }, [gistCreation, gistForm, settings]);
  /** ========================== 创建gist ========================== */

  return (
    <StyledOauth className="oauth-modal-content">
      <Input
        className="mb-2"
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
      <div>
        <div
          className={classNames({
            block: !createGistModalVisible,
            hidden: createGistModalVisible,
          })}
        >
          <form
            className="oauth-form"
            onSubmit={(e) => {
              e.preventDefault();
              return;
            }}
          >
            <Spin spinning={allGist.isFetching}>
              <GistList />
            </Spin>
          </form>
        </div>
        <div
          className={classNames({
            block: createGistModalVisible,
            hidden: !createGistModalVisible,
          })}
        >
          <div>{t('fileName')}</div>
          <Input
            className="mb-2"
            placeholder={t('fileName')}
            onChange={handleGistChange('fileName')}
            value={gistForm.fileName}
          />
          <div>{t('description')}</div>
          <TextArea className="mb-2" rows={3} value={gistForm.description} onChange={handleGistChange('description')} />
          <Button className="w-full" type="primary" loading={gistCreation.isLoading} onClick={handleSaveCreateGist}>
            {t('save')}
          </Button>
        </div>
      </div>
    </StyledOauth>
  );
}
