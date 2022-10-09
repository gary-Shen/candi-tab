import bg from '@/assets/bg-light.png';

import type { ThemeTypes } from './types';

const theme: ThemeTypes = {
  primaryColor: '#0969da',
  infoColor: '',
  warningColor: '',
  dangerColor: '',
  lightColor: '',
  darkColor: '',
  // ======
  bodyBackground: '#fff',
  bodyBackgroundImage: `url(${bg})`,
  fontSize: '1rem',
  borderColor: '#d0d7de',
  secondaryColor: '',
  borderRadius: '5px',
  boxShadow: '0 8px 24px rgba(140,149,159,0.2)',
  // ======
  grayColor: '#6A737D',
  grayColorHover: '',
  fontColor: '#586069',
  card: {
    paddingX: '1rem',
    paddingY: '0.375rem',
    headerBackground: '#f6f8fa',
    bodyBackground: '#fff',
  },

  modal: {
    bodyBackground: '#fff',
    headerBackground: '#f6f8fa',
  },

  menu: {
    activeBackgroundColor: '#0969da',
    activeColor: '#fff',
  },

  form: {
    insetColor: '#f6f8fa',
  },

  button: {
    paddingX: '.5rem',
    paddingY: '.25rem',
  },
};

export default theme;
