import '@reach/dialog/styles.css';
import 'bootstrap/dist/css/bootstrap.css';
import 'lina-context-menu/dist/style.css';
import React from 'react';
import ReactDOM from 'react-dom/client';

import App from './App';
import { QueryProvider } from './components/QueryProvider';
import './locales';
import SettingProvider from './components/SettingProvider';
import GlobalCss from './components/GlobalCss';

const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement);
root.render(
  <React.StrictMode>
    <QueryProvider>
      <SettingProvider>
        <GlobalCss />
        <App />
      </SettingProvider>
    </QueryProvider>
  </React.StrictMode>,
);
