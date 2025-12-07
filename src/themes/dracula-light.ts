import type { ThemeTypes } from './types'

import { rgba } from 'polished'

const theme: ThemeTypes = {
  primaryColor: '#793a80',
  infoColor: '#005f60',
  warningColor: '#8a4b00',
  dangerColor: '#b31d28',
  lightColor: '#f8f8f2',
  darkColor: '#282a36',
  // ======
  bodyBackground: '#fafafa',
  bodyBackgroundImage: 'none',
  fontSize: '1rem',
  borderColor: '#e1e1e6',
  secondaryColor: '#bfbfbf',
  borderRadius: '5px',
  boxShadow: '0 8px 24px rgba(0,0,0,0.1)',
  // ======
  grayColor: '#bfbfbf',
  grayColorHover: '#793a80',
  fontColor: '#282a36',
  card: {
    paddingX: '1rem',
    paddingY: '0.375rem',
    headerBackground: '#f2f2f2',
    bodyBackground: '#fafafa',
  },

  modal: {
    headerBackground: '#f2f2f2',
    bodyBackground: '#fafafa',
    footerBackground: '#f2f2f2',
    borderColor: 'transparent',
  },

  tabs: {
    hoverColor: rgba('#793a80', 0.1),
    activeColor: rgba('#793a80', 0.7),
    textColor: '#282a36',
    activeTextColor: '#f8f8f2',
    backgroundColor: rgba('#793a80', 0.1),
  },

  select: {
    backgroundColor: '#fff',
    overlayBackgroundColor: '#fff',
    borderColor: 'transparent',
  },

  menu: {
    overlayBackgroundColor: '#fff',
    activeBackgroundColor: '#793a80',
    activeColor: '#fff',
    borderColor: 'transparent',
  },

  form: {
    insetColor: '#f2f2f2',
  },

  button: {
    paddingX: '1.5rem',
    paddingY: '.25rem',
  },
}

export default theme
