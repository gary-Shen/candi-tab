import { rgba } from 'polished';

import bg from '@/assets/bg-light.png';

import type { ThemeTypes } from './types';

const theme: ThemeTypes = {
  primaryColor: '#1677ff',
  infoColor: '',
  warningColor: '',
  dangerColor: '',
  lightColor: '#f6f8fa',
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
  fontColor: '#333',
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
    borderColor: 'transparent',
  },

  tabs: {
    hoverColor: rgba('#fff', 0.1),
    activeColor: '#fff',
    textColor: '#586069',
    activeTextColor: '#333',
    backgroundColor: rgba('#1677ff', 0.1),
  },

  select: {
    backgroundColor: '#fff',
    overlayBackgroundColor: '#fff',
    borderColor: 'transparent',
  },

  menu: {
    overlayBackgroundColor: '#fff',
    activeBackgroundColor: '#1677ff',
    activeColor: '#fff',
    borderColor: 'transparent',
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
