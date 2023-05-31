import type { PropsWithChildren } from 'react';
import React, { useCallback, useState, useEffect, useMemo } from 'react';
import { Toaster } from 'react-hot-toast';
import { Octokit } from '@octokit/rest';
import { useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';

import useSettings from '@/hooks/useSettings';
import useStorage from '@/hooks/useStorage';
import { destroyOctokit, setOctokit } from '@/service/gist';
import { gistKeys } from '@/constant/queryKeys/gist';

import type { SettingsContextType } from '../context/settings.context';
import SettingsContext from '../context/settings.context';
import Modal from './Dialog';
import Input from './Input';
import TextArea from './TextArea';
import Button from './LinkButton';

export default function SettingProvider({ children }: PropsWithChildren) {
  const [accessToken, setAccessToken] = useStorage('accessToken');
  const [settings, updateSettings] = useSettings();
  const { t } = useTranslation();
  const [gistInfo, setGistInfo] = useState({ fileName: '', description: '' });
  const queryClient = useQueryClient();
  const value = useMemo(() => {
    return {
      updateSettings,
      settings,
      accessToken,
      updateAccessToken: setAccessToken,
    };
  }, [updateSettings, settings, accessToken, setAccessToken]);

  useEffect(() => {
    if (!accessToken) {
      queryClient.setQueryData(gistKeys.lists(), undefined);
      return;
    }

    setOctokit(
      new Octokit({
        auth: accessToken,
      }),
    );

    return () => {
      destroyOctokit();
    };
  }, [accessToken, queryClient]);

  const handleGistChange = useCallback(
    (field: string) => (e: React.ChangeEvent<any>) => {
      setGistInfo({
        ...gistInfo,
        [field]: e.target.value,
      });
    },
    [gistInfo],
  );

  const handleSave = useCallback(() => {
    updateSettings({
      ...settings!,
      gist: {
        id: settings!.gistId!,
        fileName: gistInfo.fileName,
        description: gistInfo.description,
      },
    });
  }, [gistInfo.description, gistInfo.fileName, settings, updateSettings]);

  return (
    <SettingsContext.Provider value={value as NonNullable<SettingsContextType>}>
      <>
        {children}
        <Toaster position="bottom-right" reverseOrder={false} />
        <Modal title={t('gist information is missing')} visible={!settings?.gist}>
          <div className="mb-2">{t('fileName')}</div>
          <Input
            className="mb-2"
            placeholder={`${t('File name ends with json')}`}
            onChange={handleGistChange('fileName')}
            value={gistInfo.fileName}
          />
          <div className="mb-2">{t('description')}</div>
          <TextArea className="mb-2" rows={3} value={gistInfo.description} onChange={handleGistChange('description')} />

          <Button
            className="w-full"
            type="primary"
            disabled={!gistInfo.fileName || !gistInfo.fileName.endsWith('.json') || !gistInfo.description}
            onClick={handleSave}
          >
            {t('save')}
          </Button>
        </Modal>
      </>
    </SettingsContext.Provider>
  );
}
