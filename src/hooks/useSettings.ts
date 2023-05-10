import update from 'lodash/fp/update';
import { useCallback, useEffect, useState } from 'react';
import type { UseMutationResult } from '@tanstack/react-query';
import type { OctokitResponse } from '@octokit/types';
import toast from 'react-hot-toast';

import type { Block, Link, Setting } from '@/types/setting.type';
import { gid } from '@/utils/gid';

import { load, save } from './settings';
import { useGistUpdate } from './useGistMutation';
import defaultSettings from '../default-settings.json';

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
  const [settings, setSettings] = useState<Setting | null>(null);
  const mutation = useGistUpdate(settings?.gistId);

  useEffect(() => {
    load().then((result) => {
      const newSettings = setIds({ ...defaultSettings, ...result });
      setSettings(newSettings);
    });
  }, []);

  const updateSettings = useCallback(
    async (newSettings: Setting) => {
      const _value = {
        ...newSettings,
        createdAt: Date.now(),
      };

      setSettings(() => {
        return _value;
      });
      save(_value);
      await mutation.mutateAsync(_value);
    },
    [mutation],
  );

  const updateWithToast = useCallback(
    (newSettings: Setting) => {
      toast.promise(updateSettings(newSettings), {
        loading: 'Syncing...',
        success: 'Saved!',
        error: 'Error saving',
      });
    },
    [updateSettings],
  );

  return [settings, updateWithToast, mutation];
}
