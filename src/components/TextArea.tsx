import React from 'react';
import type { TextareaHTMLAttributes } from 'react';

export type TextAreaProps = TextareaHTMLAttributes<HTMLTextAreaElement>;

export default React.forwardRef<HTMLTextAreaElement, TextAreaProps>(function TextArea({ value, ...rest }, ref) {
  return (
    <textarea value={value} {...rest} ref={ref} className="rounded pt-2 pb-2 pl-3 pr-3 bg-form-inset border w-full" />
  );
});
