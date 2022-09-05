import React from 'react';
import { render } from 'react-dom';

import 'bootstrap/dist/css/bootstrap.css';
import '@reach/dialog/styles.css';

import App from '@/App';

const mountNode = document.getElementById('app');
render(<App />, mountNode);
