import classNames from 'classnames';
import type { SVGAttributes } from 'react';
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
  loading?: boolean;
}

const LoadingSvg = ({ className, ...rest }: SVGAttributes<HTMLOrSVGElement>) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" {...rest}>
    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
    <path
      className="opacity-75"
      fill="currentColor"
      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
    />
  </svg>
);

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, type = 'primary', autoFocus, children, as = 'button', onClick, disabled, loading, ...rest }, ref) => {
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
        className={classNames('flex items-center justify-center', className)}
        as={as}
        ref={ref}
        variant={type}
        onClick={onClick}
        disabled={disabled || loading}
        {...rest}
      >
        {loading && <LoadingSvg className="animate-spin w-4 h-4 mr-2" />}
        {children}
      </StyledButton>
    );
  },
);

export default Button;
