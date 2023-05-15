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
      --color-primary: ${theme.primaryColor || defaultPrimary};
      --color-secondary: ${theme.secondaryColor || defaultSecondary};
      --color-success: ${theme.successColor || defaultSuccess};
      --color-info: ${theme.infoColor || defaultInfo};
      --color-warning: ${theme.warningColor || defaultWarning};
      --color-danger: ${theme.dangerColor || defaultDanger};
      --color-light: ${theme.lightColor || defaultLight};
      --color-dark: ${theme.darkColor || defaultDark};
      --body-font-size: ${theme.fontSize || '1rem'};
      --body-font-weight: 400;
      --body-line-height: 1.5;
      --body-color: ${theme.fontColor};
      --body-bg: ${theme.bodyBackground};
      --border-width: 1px;
      --border-style: solid;
      --border-color: #dee2e6;
      --border-color-translucent: rgba(0, 0, 0, 0.175);
      --border-radius: 0.375rem;
      --border-radius-sm: 0.25rem;
      --border-radius-lg: 0.5rem;
      --border-radius-xl: 1rem;
      --border-radius-2xl: 2rem;
      --border-radius-pill: 50rem;
      --link-color: ${theme.primaryColor || defaultPrimary};
      --link-hover-color: ${lighten(0.2, theme.primaryColor) || defaultPrimary};
      --code-color: #d63384;
      --highlight-bg: #fff3cd;
      /* base */
      --border-radius: ${theme.borderRadius};

      /* components */
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
      --modal-footer-bg: ${theme.modal.footerBackground};

      /* menu */
      --menu-active-bg: ${theme.menu.activeBackgroundColor};
      --menu-active-color: ${theme.menu.activeColor};

      /* button */
      --button-padding-y: ${theme.button.paddingY};
      --button-padding-x: ${theme.button.paddingX};

      /* form */
      --form-inset-bg: ${theme.form.insetColor};
      --default-color: ${defaultDark};
    `}
  }
`;

GlobalCSSVariables.defaultProps = {
  theme: themes['github-light'],
};

export default GlobalCSSVariables;
