import update from 'lodash/fp/update';
import { useCallback, useEffect, useState } from 'react';

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

export default function useSettings(): [Setting | null, (settings: Setting) => void, boolean] {
  const [settings, setSettings] = useState<Setting | null>(null);
  const mutation = useGistUpdate(settings?.gistId);

  useEffect(() => {
    load().then((result) => {
      const newSettings = setIds({ ...defaultSettings, ...result });
      setSettings(newSettings);
    });
  }, []);

  const updateSettings = useCallback(async (newSettings: Setting) => {
    const _value = {
      ...newSettings,
    };

    setSettings(() => {
      return _value;
    });
    save(_value);
    mutation.mutate(_value);
  }, []);

  return [settings, updateSettings, mutation.isLoading];
}
