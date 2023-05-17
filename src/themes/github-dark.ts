import { rgba } from 'polished';

import bg from '@/assets/bg-dark.png';

import type { ThemeTypes } from './types';

const theme: ThemeTypes = {
  primaryColor: '#5765F2',
  infoColor: '',
  warningColor: '',
  dangerColor: '',
  lightColor: '',
  darkColor: '',
  // ======
  bodyBackground: '#0d1117',
  bodyBackgroundImage: `url(${bg})`,
  borderColor: '#30363d',
  fontSize: '1rem',
  secondaryColor: '#4E5058',
  borderRadius: '6px',
  boxShadow: '0 8px 24px #010409',
  // ======
  grayColor: '#6A737D',
  grayColorHover: '#E1E4E8',
  fontColor: '#c9d1d9',
  card: {
    paddingX: '1rem',
    paddingY: '0.375rem',
    headerBackground: '#161b22',
    bodyBackground: '#0d1117',
  },

  modal: {
    headerBackground: '#161b22',
    bodyBackground: '#0d1117',
    footerBackground: '#161b22',
  },

  tabs: {
    hoverColor: '#161b22',
    activeColor: '#5765F2',
    textColor: '#c9d1d9',
    activeTextColor: '#fff',
    backgroundColor: rgba('#895DF5', 0.1),
  },

  select: {
    backgroundColor: 'transparent',
    overlayBackgroundColor: '#0d1117',
  },

  menu: {
    overlayBackgroundColor: '#0d1117',
    activeBackgroundColor: '#5765F2',
    activeColor: '#fff',
  },

  form: {
    insetColor: '#010409',
  },

  button: {
    paddingX: '.5rem',
    paddingY: '.25rem',
  },
};
export default theme;
