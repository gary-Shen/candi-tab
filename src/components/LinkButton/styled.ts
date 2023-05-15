import styled from 'styled-components';

export interface ButtonProps {
  variant?: 'primary' | 'success' | 'info' | 'secondary' | 'warning' | 'danger' | 'link' | 'light';
  as?: string;
}

export const StyledButton = styled.button<ButtonProps>`
  text-align: center;
  vertical-align: middle;
  border: 0;
  background-color: var(--${({ variant }: ButtonProps) => `color-${variant}`});
  color: ${({ variant }: ButtonProps) => (variant === 'light' ? '#000' : '#fff')};
  border-radius: var(--border-radius);
  transition: all 0.2s;
  padding: var(--button-padding-y) var(--button-padding-x);
  line-height: 1.5;
  text-decoration: none;
  cursor: pointer;

  &:hover {
    color: ${({ variant }: ButtonProps) => (variant === 'light' ? '#000' : '#fff')};
    filter: brightness(0.9);
  }

  &:focus,
  &:active {
    filter: brightness(0.7);
  }

  &.link {
    color: var(--color-primary);
    text-decoration: underline;
  }
`;
