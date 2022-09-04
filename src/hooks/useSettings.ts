import { update } from 'lodash/fp';
import { useCallback, useEffect, useState } from 'react';

import type { Block, Link, Setting } from '@/types/setting.type';
import { uuid } from '@/utils';

import { load, save } from './settings';

const defaultSettings = require('../default-settings.json');

const setIds = update('links')((blocks: Block[]) =>
  blocks.map((block) => {
    const extra = {
      id: uuid(),
    };

    const mapLink = (link: Link) => {
      const withId = {
        id: uuid(),
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

export default function useSettings(): [Setting | null, (settings: Setting) => void] {
  const [settings, setSettings] = useState<Setting | null>(null);

  useEffect(() => {
    load().then((result) => {
      const newSettings = setIds({ ...defaultSettings, ...result });
      setSettings(newSettings);
    });
  }, []);

  const updateSettings = useCallback((newSettings: Setting) => {
    const _value = {
      ...newSettings,
    };

    setSettings(() => {
      return _value;
    });
    save(_value);
  }, []);

  return [settings, updateSettings];
}
