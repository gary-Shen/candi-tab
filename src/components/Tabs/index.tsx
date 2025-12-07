import type { TabListProps, TabProps } from '@reach/tabs'
import {
  Tab as RTab,
  TabList as RTabList,
  TabPanel as RTabPanel,
  TabPanels as RTabPanels,
  Tabs as RTabs,
} from '@reach/tabs'
import classNames from 'classnames'

import React from 'react'

export const Tab = React.forwardRef<any, TabProps & { className?: string }>(({ className, ...props }, ref) => (
  <RTab
    ref={ref}
    className={classNames(
      'px-6 py-1 border-0 border-b-2 border-transparent text-[var(--tab-text-color)] bg-transparent data-[selected]:font-bold data-[selected]:border-[var(--tab-active)] data-[selected]:text-[var(--tab-text-active-color)] hover:text-[var(--tab-text-active-color)]',
      className,
    )}
    {...props}
  />
))

export const TabList = React.forwardRef<any, TabListProps & { className?: string }>(({ className, ...props }, ref) => (
  <RTabList ref={ref} className={classNames('bg-transparent', className)} {...props} />
))

export const TabPanel = RTabPanel
export const TabPanels = RTabPanels
export const Tabs = RTabs
