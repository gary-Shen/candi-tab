import update from 'lodash/fp/update';
import { useCallback, useEffect, useRef, useState } from 'react';
import type { UseMutationResult } from '@tanstack/react-query';
import type { OctokitResponse } from '@octokit/types';
import toast from 'react-hot-toast';
import { Octokit } from '@octokit/rest';
import { useTranslation } from 'react-i18next';
import _ from 'lodash';

import type { Block, Link, Setting } from '@/types/setting.type';
import { gid } from '@/utils/gid';
import parseGistContent from '@/utils/parseGistContent';
import { destroyOctokit, setOctokit } from '@/service/gist';
import { calcLayout } from '@/utils/calcLayout';

import { load, save } from './settings';
import { useGistUpdate } from './useGistMutation';
import defaultSettings from '../default-settings.json';
import { useGistOne } from './useGistQuery';
import useStorage from './useStorage';

const setIds = update('links')((blocks: Block[]) =>
  blocks.map((block) => {
    const extra = {
      id: gid(),
    };

    const mapLink = (link: Link) => {
      const withId = {
        id: gid(),
      };

      if (!link.id) {
        return {
          ...link,
          ...withId,
        };
      }

      return link;
    };

    if (!block.id) {
      return {
        ...block,
        ...extra,
        buttons: block?.buttons?.map(mapLink),
      };
    }
    return {
      ...block,
      buttons: block?.buttons?.map(mapLink),
    };
  }),
);

export default function useSettings(): [
  Setting | null,
  (settings: Setting) => void,
  UseMutationResult<OctokitResponse<any>>,
] {
  const { t, i18n } = useTranslation();
  const [settings, setSettings] = useState<Setting | null>(null);
  const [accessToken] = useStorage('accessToken');
  const gist = settings?.gist || ({} as any);
  const mutation = useGistUpdate(settings?.gist?.id);
  useEffect(() => {
    if (!accessToken) {
      destroyOctokit();
      return;
    }

    setOctokit(
      new Octokit({
        auth: accessToken,
      }),
    );
  }, [accessToken]);

  const oneGist = useGistOne(gist.id || settings?.gistId);

  useEffect(() => {
    load().then((result) => {
      const newSettings = setIds({ ...defaultSettings, ...result });

      setSettings(newSettings);
    });
  }, []);

  // fetch gist on first load
  useEffect(() => {
    if (!oneGist.isSuccess) {
      return;
    }
    // @ts-ignore
    const newSettings = parseGistContent(oneGist.data!, settings?.gist?.fileName);

    if (!newSettings) {
      return;
    }

    if (settings?.updatedAt && newSettings.updatedAt < settings?.updatedAt) {
      return;
    } else if (settings?.createdAt && newSettings.createdAt && newSettings.createdAt < settings?.createdAt) {
      // 兼容旧配置
      return;
    }

    newSettings.gist = {
      ...newSettings.gist,
      ..._.pick(oneGist.data, ['description', 'id']),
    };

    setSettings(newSettings);
  }, [oneGist.data, oneGist.isSuccess, settings?.createdAt, settings?.gist?.fileName, settings?.updatedAt]);

  const updateSettings = useCallback(
    async (newSettings: Setting) => {
      i18n.changeLanguage(newSettings?.general?.language || chrome?.i18n?.getUILanguage() || 'en-US');
      setSettings(() => {
        return newSettings;
      });
      save(newSettings);
    },
    [i18n],
  );

  const timer = useRef<any>(null);
  const updateWithToast = useCallback(
    async (newSettings: Setting) => {
      const _value = {
        ...newSettings,
        updatedAt: Date.now(),
      };

      updateSettings(_value);

      clearTimeout(timer.current);
      timer.current = setTimeout(() => {
        const settingsWithNewLayout = calcLayout(_value);

        updateSettings(settingsWithNewLayout);
        clearTimeout(timer.current);
        timer.current = null;

        if (!settingsWithNewLayout.gist?.fileName) {
          return;
        }

        // @ts-ignore
        toast.promise(
          mutation.mutateAsync({
            gist_id: settingsWithNewLayout.gist?.id || settingsWithNewLayout?.gistId,
            public: false,
            description: settingsWithNewLayout.gist?.description,
            files: {
              [settingsWithNewLayout.gist.fileName]: {
                content: JSON.stringify(settingsWithNewLayout),
              },
            },
          }),
          {
            loading: t('syncing'),
            success: t('sync success'),
            error: t('sync failed'),
          },
        );
      }, 2000);
    },
    [mutation, t, updateSettings],
  );

  // @ts-ignore
  return [settings, updateWithToast, mutation];
}
