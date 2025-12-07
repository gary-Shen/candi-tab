import type { SVGAttributes } from 'react'
import classNames from 'classnames'
import React from 'react'

export interface SpinProps {
  spinning?: boolean
  className?: string
  children?: React.ReactNode
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

export default function Spin({ spinning, className, children }: SpinProps) {
  const spinner = (
    <div className={classNames('w-full spinner flex justify-center py-4', className)}>
      <div className="h-5 w-5">
        <LoadingSvg className="animate-spin" />
      </div>
    </div>
  )

  return (
    <>
      {spinning && spinner}
      <div className={classNames('spin-content w-full', className, { hidden: spinning })}>{children}</div>
    </>
  )
}
