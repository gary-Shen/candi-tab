import { lighten } from 'polished';
import { createGlobalStyle, css } from 'styled-components';

import themes from '@/themes';

export interface ThemeProps {
  theme: any;
}

const defaultPrimary = '#0d6efd';
const defaultSecondary = '#6c757d';
const defaultSuccess = '#198754';
const defaultInfo = '#0dcaf0';
const defaultWarning = '#ffc107';
const defaultDanger = '#dc3545';
const defaultLight = '#f8f9fa';
const defaultDark = '#212529';

const GlobalCSSVariables = createGlobalStyle<ThemeProps>`
  body {
    ${({ theme }: ThemeProps) => css`
      --bs-primary: ${theme.primaryColor || defaultPrimary};
      --bs-secondary: ${theme.secondaryColor || defaultSecondary};
      --bs-success: ${theme.successColor || defaultSuccess};
      --bs-info: ${theme.infoColor || defaultInfo};
      --bs-warning: ${theme.warningColor || defaultWarning};
      --bs-danger: ${theme.dangerColor || defaultDanger};
      --bs-light: ${theme.lightColor || defaultLight};
      --bs-dark: ${theme.darkColor || defaultDark};
      --bs-body-font-size: ${theme.fontSize || '1rem'};
      --bs-body-font-weight: 400;
      --bs-body-line-height: 1.5;
      --bs-body-color: ${theme.fontColor};
      --bs-body-bg: ${theme.bodyBackground};
      --bs-border-width: 1px;
      --bs-border-style: solid;
      --bs-border-color: #dee2e6;
      --bs-border-color-translucent: rgba(0, 0, 0, 0.175);
      --bs-border-radius: 0.375rem;
      --bs-border-radius-sm: 0.25rem;
      --bs-border-radius-lg: 0.5rem;
      --bs-border-radius-xl: 1rem;
      --bs-border-radius-2xl: 2rem;
      --bs-border-radius-pill: 50rem;
      --bs-link-color: ${theme.primaryColor || defaultPrimary};
      --bs-link-hover-color: ${lighten(0.2, theme.primaryColor) || defaultPrimary};
      --bs-code-color: #d63384;
      --bs-highlight-bg: #fff3cd;
      /* base */
      --border-radius: ${theme.borderRadius};

      /* components */
      --primary-color: ${theme.primaryColor || defaultPrimary};
      --secondary-color: ${theme.secondaryColor || defaultSecondary};
      --success-color: ${theme.successColor || defaultSuccess};
      --info-color: ${theme.infoColor || defaultInfo};
      --warning-color: ${theme.warningColor || defaultWarning};
      --danger-color: ${theme.dangerColor || defaultDanger};
      --light-color: ${theme.lightColor || defaultLight};
      --dark-color: ${theme.darkColor || defaultDark};
      --background-color: ${theme.bodyBackground};
      --font-color: ${theme.fontColor};
      --gray-color: ${theme.grayColor};
      --gray-color-hover: ${theme.grayColorHover};
      --border-color: ${theme.borderColor};
      --box-shadow: ${theme.boxShadow};
      --background-image: ${theme.bodyBackgroundImage};

      /* card */
      --card-padding-x: ${theme.card.paddingX};
      --card-padding-y: ${theme.card.paddingY};
      --card-body-bg: ${theme.card.bodyBackground};
      --card-header-bg: ${theme.card.headerBackground};

      /* modal */
      --modal-body-bg: ${theme.modal.bodyBackground};
      --modal-header-bg: ${theme.modal.headerBackground};

      /* menu */
      --menu-active-bg: ${theme.menu.activeBackgroundColor};
      --menu-active-color: ${theme.menu.activeColor};

      /* button */
      --button-padding-y: ${theme.button.paddingY};
      --button-padding-x: ${theme.button.paddingX};

      /* form */
      --form-inset-bg: ${theme.form.insetColor};
    `}
  }
`;

GlobalCSSVariables.defaultProps = {
  theme: themes['github-light'],
};

export default GlobalCSSVariables;
