import React from 'react';
import type { TextareaHTMLAttributes } from 'react';
import classNames from 'classnames';

import { InputWrapper } from './Input';

export type TextAreaProps = TextareaHTMLAttributes<HTMLTextAreaElement>;

export default React.forwardRef<HTMLTextAreaElement, TextAreaProps>(function TextArea(
  { value, className, ...rest },
  ref,
) {
  return (
    <InputWrapper
      as="textarea"
      value={value}
      ref={ref}
      className={classNames(
        'rounded-[var(--border-radius)] pt-2 pb-2 resize-y pl-3 pr-3 bg-form-inset border border-default focus:outline-none w-full',
        className,
      )}
      {...rest}
    />
  );
});
