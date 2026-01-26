import type { MenuLink } from '@/types/setting.type'
import { Menu, Transition } from '@headlessui/react'
import classNames from 'classnames'
import { ChevronRight } from 'lucide-react'
import React, { Fragment, useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'

// 延迟关闭时间（毫秒）
const CLOSE_DELAY = 300

interface NestedMenuItemProps {
  item: MenuLink
  buttonStyle?: React.CSSProperties
  depth?: number
}

function NestedMenuItem({ item, buttonStyle, depth = 0 }: NestedMenuItemProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [position, setPosition] = useState({ top: 0, left: 0 })
  const itemRef = useRef<HTMLDivElement>(null)
  const submenuRef = useRef<HTMLDivElement>(null)
  const closeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const hasChildren = item.children && item.children.length > 0

  // 清除关闭定时器
  const clearCloseTimer = useCallback(() => {
    if (closeTimerRef.current) {
      clearTimeout(closeTimerRef.current)
      closeTimerRef.current = null
    }
  }, [])

  // 鼠标进入 - 立即打开，清除关闭定时器
  const handleMouseEnter = useCallback(() => {
    clearCloseTimer()
    setIsOpen(true)
  }, [clearCloseTimer])

  // 鼠标离开 - 延迟关闭
  const handleMouseLeave = useCallback(() => {
    clearCloseTimer()
    closeTimerRef.current = setTimeout(() => {
      setIsOpen(false)
    }, CLOSE_DELAY)
  }, [clearCloseTimer])

  // 组件卸载时清除定时器
  useEffect(() => {
    return () => clearCloseTimer()
  }, [clearCloseTimer])

  useLayoutEffect(() => {
    if (isOpen && itemRef.current) {
      const rect = itemRef.current.getBoundingClientRect()
      let top = rect.top
      let left = rect.right + 4 // 4px gap

      // 检查右侧是否有足够空间
      if (submenuRef.current) {
        const submenuWidth = submenuRef.current.offsetWidth
        if (left + submenuWidth > window.innerWidth) {
          left = rect.left - submenuWidth - 4
        }

        // 检查底部是否有足够空间
        const submenuHeight = submenuRef.current.offsetHeight
        if (top + submenuHeight > window.innerHeight) {
          top = window.innerHeight - submenuHeight - 8
        }
      }

      setPosition({ top, left })
    }
  }, [isOpen])

  if (hasChildren) {
    return (
      <div
        ref={itemRef}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        <div
          className={classNames(
            'group flex w-full items-center justify-between rounded-md pl-2 pr-2 py-1 cursor-pointer',
            'hover:bg-[var(--menu-active-bg)] hover:text-[var(--menu-text-active-color)]',
            { 'max-w-[400px]': depth > 0 },
          )}
        >
          <span className={depth > 0 ? 'truncate' : ''}>{item.title}</span>
          <ChevronRight size={14} className="ml-2 opacity-50 flex-shrink-0" />
        </div>

        {/* 子菜单 - 使用 Portal 渲染到 body */}
        {isOpen && createPortal(
          <div
            ref={submenuRef}
            style={{ top: position.top, left: position.left }}
            className="fixed min-w-[160px] max-w-[400px] max-h-[60vh] overflow-y-auto border border-[var(--menu-border-color)] rounded-[var(--border-radius)] bg-[var(--menu-overlay-bg)] shadow-lg ring-1 ring-black ring-opacity-5 z-[2000]"
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
          >
            <div className="px-1 py-1">
              {item.children!.map(child => (
                <NestedMenuItem
                  key={child.id}
                  item={child}
                  buttonStyle={buttonStyle}
                  depth={depth + 1}
                />
              ))}
            </div>
          </div>,
          document.body,
        )}
      </div>
    )
  }

  // 叶子节点 - 普通链接
  return (
    <a
      href={item.url || '#'}
      title={depth > 0 ? item.title : undefined}
      className={classNames(
        'group flex w-full items-center rounded-md pl-2 pr-4 py-1',
        'hover:bg-[var(--menu-active-bg)] hover:text-[var(--menu-text-active-color)]',
        'border-transparent text-inherit',
        { 'max-w-[400px]': depth > 0 },
      )}
    >
      <span className={depth > 0 ? 'truncate' : ''}>{item.title}</span>
    </a>
  )
}

export interface NestedMenuProps {
  options: MenuLink[]
  children: React.ReactNode
  className?: string
  buttonClassName?: string
  buttonStyle?: React.CSSProperties
}

const Items = React.forwardRef<HTMLDivElement, { options: MenuLink[], buttonStyle?: React.CSSProperties }>(
  ({ options, buttonStyle }, ref) => {
    const itemsRef = useRef<HTMLDivElement>(null)

    React.useImperativeHandle(ref, () => itemsRef.current!, [])

    useLayoutEffect(() => {
      if (!itemsRef.current) return
      const itemsRect = itemsRef.current.getBoundingClientRect()
      const distanceToBottom = window.innerHeight - itemsRect.top - itemsRect.height

      if (distanceToBottom < 0) {
        itemsRef.current.classList.remove('mt-2')
        itemsRef.current.classList.add('mb-2')
        itemsRef.current.style.bottom = '100%'
      }
    }, [])

    return (
      <Menu.Items
        static
        ref={itemsRef}
        className="absolute z-[1999] right-0 mt-2 min-w-full max-h-[70vh] overflow-y-auto divide-y border border-[var(--menu-border-color)] divide-gray-100 rounded-[var(--border-radius)] bg-[var(--menu-overlay-bg)] shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none"
      >
        <div className="px-1 py-1">
          {options.map(item => (
            <NestedMenuItem key={item.id} item={item} buttonStyle={buttonStyle} />
          ))}
        </div>
      </Menu.Items>
    )
  },
)

export default function NestedMenu({ children, options, className, buttonClassName, buttonStyle }: NestedMenuProps) {
  return (
    <Menu as="div" className={classNames('relative inline-block text-left', className)}>
      {({ open }) => (
        <>
          <Menu.Button className={buttonClassName}>{children}</Menu.Button>
          <Transition
            show={open}
            as={Fragment}
            enter="transition ease-out duration-150"
            enterFrom="transform opacity-0 scale-95"
            enterTo="transform opacity-100 scale-100"
            leave="transition ease-in duration-75"
            leaveFrom="transform opacity-100 scale-100"
            leaveTo="transform opacity-0 scale-95"
          >
            <Items buttonStyle={buttonStyle} options={options} />
          </Transition>
        </>
      )}
    </Menu>
  )
}
