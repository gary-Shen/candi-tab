import React from 'react';
import { Tab } from '@headlessui/react';
import classNames from 'classnames';

interface TabItem {
  key: string;
  title: string;
  content: React.ReactNode;
}

export interface MyTabsProps {
  items: TabItem[];
}

export default function MyTabs({ items = [] }: MyTabsProps) {
  return (
    <Tab.Group>
      <Tab.List className="flex space-x-1 rounded-lg bg-[var(--tab-bg)] p-1">
        {items.map((item) => (
          <Tab
            key={item.key}
            className={({ selected }) =>
              classNames(
                'w-full rounded-lg py-2 text-sm font-medium leading-5 text-[var(--tab-text-color)]',
                'ring-opacity-60 ring-offset-2 ring-color-primary-400 focus:outline-none',
                selected
                  ? 'bg-[var(--tab-active)] shadow text-[var(--tab-text-active-color)]'
                  : 'hover:bg-[var(--tab-hover)]',
              )
            }
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
  );
}
