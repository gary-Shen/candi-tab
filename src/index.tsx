import '@reach/dialog/styles.css';
import 'bootstrap/dist/css/bootstrap.css';
import 'lina-context-menu/dist/style.css';
import React from 'react';
import ReactDOM from 'react-dom/client';

import App from './App';
import './locales';

const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
