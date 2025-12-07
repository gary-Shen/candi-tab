import classNames from 'classnames'
import React from 'react'

export interface CardProps {
  className?: string
  children: React.ReactNode
}

function Card({ className, children }: CardProps) {
  return (
    <div
      className={classNames(
        'bg-card-body border border-default flex flex-col rounded-[var(--border-radius)]',
        className,
      )}
    >
      {children}
    </div>
  )
}

export interface CardHeaderProps {
  className?: string
  children: React.ReactNode
}

const CardHeader = React.forwardRef(
  ({ className, children }: CardHeaderProps, ref: React.ForwardedRef<HTMLDivElement>) => {
    return (
      <div
        ref={ref}
        className={classNames(
          'text-font-color bg-card-header border-b border-default px-card-x py-card-y rounded-t-[calc(var(--border-radius)-1px)]',
          className,
        )}
      >
        {children}
      </div>
    )
  },
)

export interface CardBodyProps {
  className?: string
  children: React.ReactNode
}

function CardBody({ className, children }: CardBodyProps) {
  return (
    <div
      className={classNames(
        'p-card-x rounded-b-[calc(var(--border-radius)-1px)]',
        className,
      )}
    >
      {children}
    </div>
  )
}

export interface CardFooterProps {
  className?: string
  children: React.ReactNode
}
function CardFooter({ className, children }: CardFooterProps) {
  return (
    <div
      className={classNames(
        'bg-card-header px-card-x py-card-y border-t border-default rounded-b-[calc(var(--border-radius)-1px)]',
        className,
      )}
    >
      {children}
    </div>
  )
}

export default Object.assign(Card, {
  Header: CardHeader,
  Body: CardBody,
  Footer: CardFooter,
})
