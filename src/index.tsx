import React from 'react'
import ReactDOM from 'react-dom/client'
import { I18nextProvider } from 'react-i18next'
import App from './App'

import ErrorBoundary from './components/ErrorBoundary'
import GlobalCss from './components/GlobalCss'
import MovableProvider from './components/MovableProvider'
import { QueryProvider } from './components/QueryProvider'
import SettingProvider from './components/SettingProvider'
import i18n from './locales'
import 'lina-context-menu/dist/style.css'

import './style/index.css'

const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement)
root.render(
  <React.StrictMode>
    <ErrorBoundary>
      <I18nextProvider i18n={i18n}>
        <QueryProvider>
          <SettingProvider>
            <MovableProvider>
              <GlobalCss>
                <App />
              </GlobalCss>
            </MovableProvider>
          </SettingProvider>
        </QueryProvider>
      </I18nextProvider>
    </ErrorBoundary>
  </React.StrictMode>,
)
