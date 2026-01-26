import { Popover, Transition } from '@headlessui/react'
import classNames from 'classnames'
import React, { Fragment, useCallback, useRef, useState } from 'react'

export interface TooltipProps {
  content: React.ReactNode
  className?: string
  placement?: 'top' | 'bottom'
  delay?: number
  closeDelay?: number
}

export default function Tooltip({
  content,
  children,
  className,
  placement = 'top',
  delay = 300,
  closeDelay = 200,
}: React.PropsWithChildren<TooltipProps>) {
  const [isOpen, setIsOpen] = useState(false)
  const openTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const closeTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const clearOpenTimer = useCallback(() => {
    if (openTimeoutRef.current) {
      clearTimeout(openTimeoutRef.current)
      openTimeoutRef.current = null
    }
  }, [])

  const clearCloseTimer = useCallback(() => {
    if (closeTimeoutRef.current) {
      clearTimeout(closeTimeoutRef.current)
      closeTimeoutRef.current = null
    }
  }, [])

  const handleMouseEnter = useCallback(() => {
    clearCloseTimer()
    clearOpenTimer()
    openTimeoutRef.current = setTimeout(() => {
      setIsOpen(true)
    }, delay)
  }, [clearCloseTimer, clearOpenTimer, delay])

  const handleMouseLeave = useCallback(() => {
    clearOpenTimer()
    clearCloseTimer()
    closeTimeoutRef.current = setTimeout(() => {
      setIsOpen(false)
    }, closeDelay)
  }, [clearOpenTimer, clearCloseTimer, closeDelay])

  if (!content) {
    return <>{children}</>
  }

  const placementClasses = {
    top: 'bottom-full mb-2',
    bottom: 'top-full mt-2',
  }

  return (
    <Popover className={classNames('relative inline-block', className)}>
      <div
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        <Popover.Button as="div" className="cursor-pointer">
          {children}
        </Popover.Button>
        <Transition
          show={isOpen}
          as={Fragment}
          enter="transition ease-out duration-150"
          enterFrom="opacity-0 scale-95"
          enterTo="opacity-100 scale-100"
          leave="transition ease-in duration-100"
          leaveFrom="opacity-100 scale-100"
          leaveTo="opacity-0 scale-95"
        >
          <Popover.Panel
            static
            className={classNames(
              'absolute left-1/2 -translate-x-1/2 z-50 px-3 py-2 text-sm rounded-lg shadow-lg',
              'bg-gray-900 text-white dark:bg-gray-700',
              'max-w-xs whitespace-normal break-words',
              placementClasses[placement],
            )}
            onMouseEnter={clearCloseTimer}
            onMouseLeave={handleMouseLeave}
          >
            {/* Arrow */}
            <div
              className={classNames(
                'absolute left-1/2 -translate-x-1/2 w-2 h-2 rotate-45 bg-gray-900 dark:bg-gray-700',
                {
                  'top-full -mt-1': placement === 'top',
                  'bottom-full -mb-1': placement === 'bottom',
                },
              )}
            />
            {content}
          </Popover.Panel>
        </Transition>
      </div>
    </Popover>
  )
}
