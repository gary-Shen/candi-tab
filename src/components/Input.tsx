import React from 'react';
import type { TextareaHTMLAttributes } from 'react';

export type InputProps = TextareaHTMLAttributes<HTMLInputElement>;

export default React.forwardRef<HTMLInputElement, InputProps>(function TextArea({ value, className, ...rest }, ref) {
  return (
    <input
      type="text"
      value={value}
      {...rest}
      ref={ref}
      className={`rounded pt-2 pb-2 pl-3 pr-3 bg-form-inset border border-default w-full ${className}`}
    />
  );
});
