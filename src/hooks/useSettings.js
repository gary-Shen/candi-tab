import { useEffect, useState } from 'react';
import { update } from 'lodash/fp';

import { save, load } from './settings';
import { uuid } from '../utils';

const defaultSettings = require('../default-settings.json');

const setIds = update('links')((blocks) =>
  blocks.map((block) => {
    const extra = {
      id: uuid(),
    };

    const mapLink = (link) => {
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
        buttons: block.buttons.map(mapLink),
      };
    }
    return {
      ...block,
      buttons: block.buttons.map(mapLink),
    };
  }),
);

export default function useSettings() {
  const [settings, setSettings] = useState(null);
  // const manifest = chrome.runtime.getManifest();
  useEffect(() => {
    load().then((result) => {
      const newSettings = setIds({ ...defaultSettings, ...result });
      setSettings(newSettings);
    });
  }, []);

  const updateSettings = (newSettings) => {
    const _value = {
      ...newSettings,
    };

    setSettings(() => {
      return _value;
    });
    save(_value);
  };

  return [settings, updateSettings];
}
