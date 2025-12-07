import type { TabGroupProps } from '@headlessui/react'
import { Tab } from '@headlessui/react'
import classNames from 'classnames'
import React from 'react'

interface TabItem {
  key: string
  title: string
  content: React.ReactNode
}

export interface MyTabsProps extends TabGroupProps<any> {
  items: TabItem[]
}

export default function MyTabs({ items = [], ...props }: MyTabsProps) {
  return (
    <Tab.Group {...props}>
      <Tab.List className="flex space-x-1 rounded-lg bg-[var(--tab-bg)] p-1">
        {items.map(item => (
          <Tab
            key={item.key}
            className={classNames(
              'w-full rounded-lg py-2 px-4 text-sm font-medium leading-5 text-[var(--tab-text-color)]',
              'ring-opacity-60 ring-offset-2 ring-color-primary-400 focus:outline-none',
              'aria-selected:bg-[var(--tab-active)] aria-selected:shadow aria-selected:text-[var(--tab-text-active-color)]',
              'aria-[selected=false]:hover:bg-[var(--tab-hover)]',
            )}
          >
            {item.title}
          </Tab>
        ))}
      </Tab.List>
      <Tab.Panels className="mt-4">
        {items.map((item, idx) => (
          <Tab.Panel
            key={idx}
            className={classNames('ring-opacity-60 ring-offset-2 ring-offset-blue-400 focus:outline-none')}
          >
            {item.content}
          </Tab.Panel>
        ))}
      </Tab.Panels>
    </Tab.Group>
  )
}
