import classNames from 'classnames'
import React from 'react'

const IconButton = React.forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement>
>((props, ref) => {
  const { className, children, ...rest } = props
  return (
    <button
      type="button"
      ref={ref}
      className={classNames(
        'box-content border-0 flex p-1 items-center justify-center text-2xl text-[var(--gray-color)] w-6 h-6 cursor-pointer transition-all duration-200 rounded-[3px] bg-transparent hover:text-[var(--gray-color-hover)] hover:bg-black/10',
        className,
      )}
      {...rest}
    >
      {children}
    </button>
  )
})

export default IconButton
