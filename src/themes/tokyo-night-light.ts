import type { ThemeTypes } from './types'

import { rgba } from 'polished'

const theme: ThemeTypes = {
  primaryColor: '#34548a',
  infoColor: '#0e6988',
  warningColor: '#8f5e15',
  dangerColor: '#8c4351',
  lightColor: '#',
  darkColor: '#343b59',
  // ======
  bodyBackground: '#d5d6db',
  bodyBackgroundImage: 'none',
  fontSize: '1rem',
  borderColor: '#9699a3',
  secondaryColor: '#565a6e',
  borderRadius: '5px',
  boxShadow: '0 8px 24px rgba(0,0,0,0.1)',
  // ======
  grayColor: '#9699a3',
  grayColorHover: '#343b59',
  fontColor: '#343b59',
  card: {
    paddingX: '1rem',
    paddingY: '0.375rem',
    headerBackground: '#e1e2e7',
    bodyBackground: '#d5d6db',
  },

  modal: {
    headerBackground: '#e1e2e7',
    bodyBackground: '#d5d6db',
    footerBackground: '#e1e2e7',
    borderColor: 'transparent',
  },

  tabs: {
    hoverColor: rgba('#343b59', 0.1),
    activeColor: '#e1e2e7',
    textColor: rgba('#343b59', 0.7),
    activeTextColor: '#343b59',
    backgroundColor: rgba('#34548a', 0.1),
  },

  select: {
    backgroundColor: '#e1e2e7',
    overlayBackgroundColor: '#e1e2e7',
    borderColor: 'transparent',
  },

  menu: {
    overlayBackgroundColor: '#e1e2e7',
    activeBackgroundColor: '#34548a',
    activeColor: '#e1e2e7',
    borderColor: 'transparent',
  },

  form: {
    insetColor: '#e1e2e7',
  },

  button: {
    paddingX: '1.5rem',
    paddingY: '.25rem',
  },
}

export default theme
