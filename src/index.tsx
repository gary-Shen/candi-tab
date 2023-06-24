import 'lina-context-menu/dist/style.css';
import React from 'react';
import ReactDOM from 'react-dom/client';
import { I18nextProvider } from 'react-i18next';

import App from './App';
import { QueryProvider } from './components/QueryProvider';
import i18n from './locales';
import SettingProvider from './components/SettingProvider';
import GlobalCss from './components/GlobalCss';

import './style/index.css';

const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement);
root.render(
  <React.StrictMode>
    <I18nextProvider i18n={i18n}>
      <QueryProvider>
        <SettingProvider>
          <GlobalCss>
            <App />
          </GlobalCss>
        </SettingProvider>
      </QueryProvider>
    </I18nextProvider>
  </React.StrictMode>,
);
