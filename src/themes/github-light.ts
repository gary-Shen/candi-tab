import bg from '@/assets/bg-light.png';

import type { ThemeTypes } from './types';

const theme: ThemeTypes = {
  primaryColor: '#895DF5',
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
  secondaryColor: '#4E5058',
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
    headerBackground: '#f6f8fa',
    bodyBackground: '#fff',
    footerBackground: '#f6f8fa',
  },

  menu: {
    activeBackgroundColor: '#895DF5',
    activeColor: '#fff',
  },

  form: {
    insetColor: '#f6f8fa',
  },

  button: {
    paddingX: '1.5rem',
    paddingY: '.5rem',
  },
};

export default theme;
