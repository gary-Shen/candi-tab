import update from 'lodash/fp/update';
import { useCallback, useEffect, useRef, useState } from 'react';
import type { UseMutationResult } from '@tanstack/react-query';
import type { OctokitResponse } from '@octokit/types';
import toast from 'react-hot-toast';

import type { Block, Link, Setting } from '@/types/setting.type';
import { gid } from '@/utils/gid';

import { load, save } from './settings';
import { useGistUpdate } from './useGistMutation';
import defaultSettings from '../default-settings.json';

async function sleep(timeout: number) {
  return new Promise((resolve) => {
    setTimeout(resolve, timeout);
  });
}

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
  const gist = settings?.gist || ({} as any);
  const mutation = useGistUpdate({
    gist_id: gist.id || settings?.gistId,
    public: false,
    description: gist.description,
    files: {
      [gist.fileName!]: {
        content: JSON.stringify(settings),
      },
    },
  });

  useEffect(() => {
    load().then((result) => {
      const newSettings = setIds({ ...defaultSettings, ...result });
      setSettings(newSettings);
    });
  }, []);

  const updateSettings = useCallback(async (newSettings: Setting) => {
    setSettings(() => {
      return newSettings;
    });
    save(newSettings);
  }, []);

  const timer = useRef<any>(null);
  const updateWithToast = useCallback(
    async (newSettings: Setting) => {
      const _value = {
        ...newSettings,
        updatedAt: Date.now(),
      };

      updateSettings(_value);
      await sleep(1000);

      clearTimeout(timer.current);
      timer.current = setTimeout(() => {
        clearTimeout(timer.current);
        timer.current = null;
        // @ts-ignore
        toast.promise(mutation.mutateAsync(_value), {
          loading: 'Syncing...',
          success: 'Saved!',
          error: 'Error saving',
        });
      }, 1000);
    },
    [mutation, updateSettings],
  );

  // @ts-ignore
  return [settings, updateWithToast, mutation];
}
