import bg from '@/assets/bg-dark.png';

import type { ThemeTypes } from './types';

const theme: ThemeTypes = {
  primaryColor: '#0d6efd',
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
  secondaryColor: '',
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
  },

  menu: {
    activeBackgroundColor: '#0d6efd',
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
