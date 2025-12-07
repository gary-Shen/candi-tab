import type { ThemeTypes } from './types'

import { rgba } from 'polished'

const theme: ThemeTypes = {
  primaryColor: '#268bd2', // Blue
  infoColor: '#2aa198', // Cyan
  warningColor: '#b58900', // Yellow
  dangerColor: '#dc322f', // Red
  lightColor: '#fdf6e3', // Base3 (Bg)
  darkColor: '#002b36', // Base03 (Dark Bg)
  // ======
  bodyBackground: '#fdf6e3', // Base3
  bodyBackgroundImage: 'none',
  fontSize: '1rem',
  borderColor: '#eee8d5', // Base2 (Highlight)
  secondaryColor: '#93a1a1', // Base1
  borderRadius: '5px',
  boxShadow: '0 8px 24px rgba(0,0,0,0.1)',
  // ======
  grayColor: '#93a1a1', // Base1
  grayColorHover: '#839496', // Base0
  fontColor: '#657b83', // Base00 (Body Text)
  card: {
    paddingX: '1rem',
    paddingY: '0.375rem',
    headerBackground: '#eee8d5', // Base2
    bodyBackground: '#fdf6e3', // Base3
  },

  modal: {
    headerBackground: '#eee8d5', // Base2
    bodyBackground: '#fdf6e3', // Base3
    footerBackground: '#eee8d5', // Base2
    borderColor: 'transparent',
  },

  tabs: {
    hoverColor: rgba('#268bd2', 0.1),
    activeColor: '#268bd2',
    textColor: '#657b83', // Base00
    activeTextColor: '#fdf6e3', // Base3 (Inverse)
    backgroundColor: rgba('#268bd2', 0.1),
  },

  select: {
    backgroundColor: '#fdf6e3', // Or Base3
    overlayBackgroundColor: '#fdf6e3',
    borderColor: 'transparent',
  },

  menu: {
    overlayBackgroundColor: '#fdf6e3',
    activeBackgroundColor: '#268bd2',
    activeColor: '#fdf6e3',
    borderColor: 'transparent',
  },

  form: {
    insetColor: '#eee8d5', // Base2
  },

  button: {
    paddingX: '1.5rem',
    paddingY: '.25rem',
  },
}

export default theme
