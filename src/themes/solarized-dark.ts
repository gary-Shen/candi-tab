import type { ThemeTypes } from './types'

import { rgba } from 'polished'

const theme: ThemeTypes = {
  primaryColor: '#268bd2', // Blue
  infoColor: '#2aa198', // Cyan
  warningColor: '#b58900', // Yellow
  dangerColor: '#dc322f', // Red
  lightColor: '#fdf6e3', // Base3 (Light Bg)
  darkColor: '#002b36', // Base03 (Bg)
  // ======
  bodyBackground: '#002b36', // Base03
  bodyBackgroundImage: 'none',
  fontSize: '1rem',
  borderColor: '#073642', // Base02 (Highlight)
  secondaryColor: '#586e75', // Base01
  borderRadius: '5px',
  boxShadow: '0 8px 24px rgba(0,0,0,0.2)',
  // ======
  grayColor: '#586e75', // Base01
  grayColorHover: '#657b83', // Base00
  fontColor: '#839496', // Base0 (Body Text)
  card: {
    paddingX: '1rem',
    paddingY: '0.375rem',
    headerBackground: '#073642', // Base02
    bodyBackground: '#002b36', // Base03
  },

  modal: {
    headerBackground: '#073642', // Base02
    bodyBackground: '#002b36', // Base03
    footerBackground: '#073642', // Base02
    borderColor: 'transparent',
  },

  tabs: {
    hoverColor: rgba('#268bd2', 0.1),
    activeColor: '#268bd2',
    textColor: '#839496', // Base0
    activeTextColor: '#002b36', // Base03 (Inverse)
    backgroundColor: rgba('#268bd2', 0.1),
  },

  select: {
    backgroundColor: '#073642', // Base02
    overlayBackgroundColor: '#073642',
    borderColor: 'transparent',
  },

  menu: {
    overlayBackgroundColor: '#073642',
    activeBackgroundColor: '#268bd2',
    activeColor: '#fff',
    borderColor: 'transparent',
  },

  form: {
    insetColor: '#073642', // Base02
  },

  button: {
    paddingX: '1.5rem',
    paddingY: '.25rem',
  },
}

export default theme
