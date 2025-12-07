import classNames from 'classnames'
import React from 'react'

export interface IconTextProps extends React.HTMLAttributes<HTMLSpanElement> {
  children: React.ReactNode
  className?: string
  position?: 'left' | 'right'
  text?: React.ReactNode
}

export default function IconText({ children, className, text, position = 'left', ...props }: IconTextProps) {
  if (position === 'right') {
    return (
      <span className={classNames('flex items-center', className)} {...props}>
        {text && <span className="ml-2">{text}</span>}
        <span className="flex text-lg ml-2">{children}</span>
      </span>
    )
  }

  return (
    <span className={classNames('flex items-center', className)} {...props}>
      <span className="flex text-lg">{children}</span>
      {text && <span className="ml-2">{text}</span>}
    </span>
  )
}
