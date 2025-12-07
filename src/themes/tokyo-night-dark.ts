import type { ThemeTypes } from './types'

import { rgba } from 'polished'

// No specialized background image for now, leaving empty or using a solid color
const theme: ThemeTypes = {
  primaryColor: '#7aa2f7',
  infoColor: '#0db9d7',
  warningColor: '#e0af68',
  dangerColor: '#f7768e',
  lightColor: '#c0caf5',
  darkColor: '#15161e',
  // ======
  bodyBackground: '#1a1b26',
  bodyBackgroundImage: 'none',
  fontSize: '1rem',
  borderColor: '#565f89',
  secondaryColor: '#414868',
  borderRadius: '5px',
  boxShadow: '0 8px 24px rgba(0,0,0,0.2)',
  // ======
  grayColor: '#565f89',
  grayColorHover: '#9aa5ce',
  fontColor: '#c0caf5',
  card: {
    paddingX: '1rem',
    paddingY: '0.375rem',
    headerBackground: '#16161e',
    bodyBackground: '#1a1b26',
  },

  modal: {
    headerBackground: '#16161e',
    bodyBackground: '#1a1b26',
    footerBackground: '#16161e',
    borderColor: 'transparent',
  },

  tabs: {
    hoverColor: rgba('#3d4465', 0.2),
    activeColor: '#3d4465',
    textColor: '#565f89',
    activeTextColor: '#c0caf5',
    backgroundColor: rgba('#7aa2f7', 0.1),
  },

  select: {
    backgroundColor: '#16161e',
    overlayBackgroundColor: '#16161e',
    borderColor: 'transparent',
  },

  menu: {
    overlayBackgroundColor: '#16161e',
    activeBackgroundColor: '#7aa2f7',
    activeColor: '#fff',
    borderColor: 'transparent',
  },

  form: {
    insetColor: '#16161e',
  },

  button: {
    paddingX: '1.5rem',
    paddingY: '.25rem',
  },
}

export default theme
