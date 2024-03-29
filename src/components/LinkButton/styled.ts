import styled from 'styled-components';

export type ButtonType =
  | 'primary'
  | 'success'
  | 'info'
  | 'secondary'
  | 'warning'
  | 'danger'
  | 'link'
  | 'light'
  | 'dark';

export interface ButtonProps {
  variant: ButtonType;
  as?: string;
}

const whites = ['light', 'default'];

export const StyledButton = styled.button<ButtonProps>`
  text-align: center;
  vertical-align: middle;
  border: 1px solid
    var(--${({ variant }: ButtonProps) => (whites.includes(variant) ? `border-color` : `color-${variant}`)});
  background-color: var(--${({ variant }: ButtonProps) => `color-${variant}`});
  color: ${({ variant }: ButtonProps) => (whites.includes(variant) ? 'var(--body-color)' : '#fff')};
  border-radius: var(--border-radius);
  transition: all 0.2s;
  padding: var(--button-padding-y) var(--button-padding-x);
  line-height: 1.5;
  text-decoration: none;
  cursor: pointer;

  &:not(:disabled):hover {
    color: ${({ variant }: ButtonProps) => (whites.includes(variant) ? 'var(--body-color)' : '#fff')};
    filter: brightness(0.9);
    /* border-bottom: 1px ; */
  }

  &:not(:disabled):focus,
  &:not(:disabled):active {
    filter: brightness(0.7);
  }

  &:disabled {
    opacity: 0.65;
    cursor: not-allowed;
  }

  &.link {
    color: var(--color-primary);
    text-decoration: underline;
  }
`;
