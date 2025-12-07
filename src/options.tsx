import React from 'react'
import ReactDOM from 'react-dom/client'
import { I18nextProvider } from 'react-i18next'
import GlobalCss from './components/GlobalCss'

import { QueryProvider } from './components/QueryProvider'
import SettingProvider from './components/SettingProvider'
import i18n from './locales'
import SettingContent from './partials/Setting/Content'
import 'lina-context-menu/dist/style.css'

import './style/index.css'

function OptionsApp() {
  return (
    <div className="w-[800px] mx-auto mt-10 p-6 bg-[var(--background-color)] rounded-lg shadow-lg">
      <h1 className="text-2xl font-bold mb-6 text-[var(--font-color)]">Settings</h1>
      <SettingContent />
    </div>
  )
}

const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement)
root.render(
  <React.StrictMode>
    <I18nextProvider i18n={i18n}>
      <QueryProvider>
        <SettingProvider>
          <GlobalCss>
            <OptionsApp />
          </GlobalCss>
        </SettingProvider>
      </QueryProvider>
    </I18nextProvider>
  </React.StrictMode>,
)
