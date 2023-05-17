import classNames from 'classnames';
import React from 'react';
import type { TextareaHTMLAttributes } from 'react';
import styled from 'styled-components';

export type InputProps = TextareaHTMLAttributes<HTMLInputElement>;

export const InputWrapper = styled.input`
  &:focus {
    border: 1px solid var(--color-primary);
    box-shadow: 0 0 0 1px var(--color-primary);
  }
`;

const Input = React.forwardRef<HTMLInputElement, InputProps>(function InnerInput({ value, className, ...rest }, ref) {
  return (
    <InputWrapper
      type="text"
      value={value}
      {...rest}
      ref={ref}
      className={`rounded pt-2 pb-2 text-base pl-3 pr-3 bg-form-inset border border-default focus:outline-none w-full ${className}`}
    />
  );
});

const InputGroupWrapper = styled.div`
  & > * {
    white-space: nowrap;
  }

  & > * + * {
    margin-left: 0.5rem;
  }

  &.nospace > :first-child {
    border-top-right-radius: 0;
    border-bottom-right-radius: 0;
  }

  &.nospace > :last-child {
    border-top-left-radius: 0;
    border-bottom-left-radius: 0;
  }

  &.nospace > :not(:first-child):not(:last-child) {
    border-radius: 0;
  }
`;

export function InputGroup({
  children,
  nospace,
}: React.PropsWithChildren<{
  nospace?: boolean;
}>) {
  return (
    <InputGroupWrapper
      className={classNames('flex flex-row items-center', {
        nospace,
      })}
    >
      {children}
    </InputGroupWrapper>
  );
}

export default Input;
