import type { ThemeTypes } from './types'

import { rgba } from 'polished'

const theme: ThemeTypes = {
  primaryColor: '#bd93f9',
  infoColor: '#8be9fd',
  warningColor: '#ffb86c',
  dangerColor: '#ff5555',
  lightColor: '#f8f8f2',
  darkColor: '#282a36',
  // ======
  bodyBackground: '#282a36',
  bodyBackgroundImage: 'none',
  fontSize: '1rem',
  borderColor: '#44475a',
  secondaryColor: '#6272a4',
  borderRadius: '5px',
  boxShadow: '0 8px 24px rgba(0,0,0,0.2)',
  // ======
  grayColor: '#44475a',
  grayColorHover: '#6272a4',
  fontColor: '#f8f8f2',
  card: {
    paddingX: '1rem',
    paddingY: '0.375rem',
    headerBackground: '#21222c',
    bodyBackground: '#282a36',
  },

  modal: {
    headerBackground: '#21222c',
    bodyBackground: '#282a36',
    footerBackground: '#21222c',
    borderColor: 'transparent',
  },

  tabs: {
    hoverColor: rgba('#bd93f9', 0.1),
    activeColor: rgba('#bd93f9', 0.35),
    textColor: '#f8f8f2',
    activeTextColor: '#f8f8f2',
    backgroundColor: rgba('#bd93f9', 0.1),
  },

  select: {
    backgroundColor: '#282a36',
    overlayBackgroundColor: '#282a36',
    borderColor: 'transparent',
  },

  menu: {
    overlayBackgroundColor: '#282a36',
    activeBackgroundColor: '#bd93f9',
    activeColor: '#fff',
    borderColor: 'transparent',
  },

  form: {
    insetColor: '#282a36',
  },

  button: {
    paddingX: '1.5rem',
    paddingY: '.25rem',
  },
}

export default theme
