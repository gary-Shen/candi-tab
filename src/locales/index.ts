import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'

import translation_en_us from './en-US.json'
import translation_ja_jp from './ja-JP.json'
import translation_ko_kr from './ko-KR.json'
import translation_zh_cn from './zh-CN.json'
import translation_zh_tr from './zh-TR.json'

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
  'ja-JP': {
    translation: translation_ja_jp,
  },
  'ko-KR': {
    translation: translation_ko_kr,
  },
}

// 获取初始语言：优先使用浏览器语言，之后在 SettingProvider 中根据用户设置更新
function getInitialLanguage(): string {
  try {
    return chrome?.i18n?.getUILanguage() || 'en-US'
  }
  catch {
    return 'en-US'
  }
}

i18n.use(initReactI18next).init({
  resources,
  lng: getInitialLanguage(),
  fallbackLng: 'en-US',
  interpolation: {
    escapeValue: false,
  },
})

export default i18n
