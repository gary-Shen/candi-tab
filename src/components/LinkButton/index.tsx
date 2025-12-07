import type { SVGAttributes } from 'react'
import classNames from 'classnames'
import React from 'react'

export type ButtonType
  = | 'primary'
  | 'success'
  | 'info'
  | 'secondary'
  | 'warning'
  | 'danger'
  | 'link'
  | 'light'
  | 'dark'

export interface ButtonProps {
  className?: string
  children?: React.ReactNode
  as?: 'a' | 'button'
  autoFocus?: boolean
  type?: ButtonType
  onClick?: React.MouseEventHandler<HTMLButtonElement | HTMLAnchorElement>
  disabled?: boolean
  loading?: boolean
  style?: React.CSSProperties
  title?: string
}

function LoadingSvg({ className, ...rest }: SVGAttributes<HTMLOrSVGElement>) {
  return (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" {...rest}>
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      />
    </svg>
  )
}

const VARIANT_CLASSES: Record<ButtonType, string> = {
  primary: 'bg-color-primary border-transparent text-white',
  success: 'bg-color-success border-transparent text-white',
  info: 'bg-color-info border-transparent text-white',
  secondary: 'bg-color-secondary border-transparent text-white',
  warning: 'bg-color-warning border-transparent text-white',
  danger: 'bg-color-danger border-transparent text-white',
  light: 'bg-color-light border-default text-font-color',
  dark: 'bg-color-dark border-transparent text-white',
  link: 'text-color-primary underline bg-transparent border-transparent',
}

const Button = React.forwardRef<HTMLButtonElement | HTMLAnchorElement, ButtonProps>(
  ({ className, type = 'primary', autoFocus, children, as = 'button', onClick, disabled, loading, ...rest }, ref) => {
    // Common classes
    const baseClasses = 'text-center align-middle border rounded-[var(--border-radius)] transition-all duration-200 px-button-x py-button-y leading-[1.5] no-underline cursor-pointer'
    const stateClasses = !disabled
      ? 'hover:brightness-90 focus:brightness-75 active:brightness-75'
      : 'opacity-65 cursor-not-allowed'

    const variantClass = VARIANT_CLASSES[type] || VARIANT_CLASSES.primary

    if (type === 'link') {
      return (
        <a
          className={classNames('link', baseClasses, variantClass, stateClasses, className)}
          ref={ref as any}
          {...rest}
          onClick={onClick as any}
        >
          {children}
        </a>
      )
    }

    const Component = as

    return (
      <Component
        autoFocus={autoFocus}
        className={classNames('flex items-center justify-center', baseClasses, variantClass, stateClasses, className)}
        ref={ref as any}
        onClick={onClick}
        disabled={disabled || loading}
        {...rest}
      >
        {loading && <LoadingSvg className="animate-spin w-4 h-4 mr-2" />}
        {children}
      </Component>
    )
  },
)

export default Button
