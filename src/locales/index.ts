import i18n from 'i18next';
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

  const options = {
    resources: resources,
    lng: get(settings, 'general.language') || chrome?.i18n?.getUILanguage() || 'en-US',
    fallbackLng: 'en-US',

    interpolation: {
      escapeValue: false,
    },
  };

  i18n.use(initReactI18next).init(options);
})();

export default i18n;
