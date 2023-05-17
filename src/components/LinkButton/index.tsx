import classNames from 'classnames';
import React from 'react';

import { StyledButton } from './styled';

export interface ButtonProps {
  className?: string;
  children: React.ReactNode;
  as?: 'a' | 'button';
  autoFocus?: boolean;
  type?: 'primary' | 'success' | 'info' | 'secondary' | 'warning' | 'danger' | 'link' | 'light';
  onClick?: React.MouseEventHandler<HTMLButtonElement>;
  disabled?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, type = 'primary', autoFocus, children, as = 'button', onClick, ...rest }, ref) => {
    if (type === 'link') {
      return (
        // @ts-ignore
        <StyledButton className={classNames('link', className)} as="a" ref={ref} {...rest} onClick={onClick}>
          {children}
        </StyledButton>
      );
    }
    return (
      <StyledButton
        autoFocus={autoFocus}
        className={className}
        as={as}
        ref={ref}
        variant={type}
        onClick={onClick}
        {...rest}
      >
        {children}
      </StyledButton>
    );
  },
);

export default Button;
