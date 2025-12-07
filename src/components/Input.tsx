import type { TextareaHTMLAttributes } from 'react'
import classNames from 'classnames'
import React from 'react'

export type InputProps = TextareaHTMLAttributes<HTMLInputElement>

const Input = React.forwardRef<HTMLInputElement, InputProps>(({ value, className, ...rest }, ref) => {
  return (
    <input
      type="text"
      value={value}
      {...rest}
      ref={ref}
      className={`rounded-[var(--border-radius)] pt-2 pb-2 text-base pl-3 pr-3 bg-form-inset border border-default focus:outline-none w-full focus:border-color-primary focus:ring-1 focus:ring-color-primary ${className}`}
    />
  )
})

export function InputGroup({
  children,
  nospace = true,
  className,
}: React.PropsWithChildren<{
  nospace?: boolean
  className?: string
}>) {
  return (
    <div
      className={classNames(
        'flex flex-row items-stretch',
        {
          'space-x-2': !nospace,
          '[&>:not(:first-child):not(:last-child)]:rounded-none [&>:not(:first-child):not(:last-child)]:-ml-px [&>:not(:first-child):not(:last-child)]:focus:z-[999] [&>:first-child]:rounded-r-none [&>:last-child]:rounded-l-none':
            nospace,
          '[&>*]:whitespace-nowrap': true,
        },
        className,
      )}
    >
      {children}
    </div>
  )
}

export default Input
