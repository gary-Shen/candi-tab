import { use } from 'i18next';
import { get } from 'lodash';
import { initReactI18next } from 'react-i18next';

import { load as loadSettings } from '../hooks/settings';
import translation_en_us from './en-US.json';
import translation_zh_cn from './zh-CN.json';
import translation_zh_tr from './zh-TR.json';

const resources = {
  'en-US': {
    translation: translation_en_us,
  },
  'zh-CN': {
    translation: translation_zh_cn,
  },
  'zh-TR': {
    translation: translation_zh_tr,
  },
};

(async () => {
  const settings = await loadSettings();

  use(initReactI18next).init({
    resources: resources,
    lng: get(settings, 'general.language') || 'en-US',
    fallbackLng: 'en-US',

    interpolation: {
      escapeValue: false,
    },
  });
})();
