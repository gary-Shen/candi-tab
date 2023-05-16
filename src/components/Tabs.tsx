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
      <Tab.List className="flex space-x-1 rounded-lg bg-blue-900/20 p-1">
        {items.map((item) => (
          <Tab
            key={item.key}
            className={({ selected }) =>
              classNames(
                'w-full rounded-lg py-2 text-sm font-medium leading-5',
                'ring-white ring-opacity-60 ring-offset-2 ring-offset-blue-400 focus:outline-none',
                selected ? 'bg-white shadow' : 'hover:bg-white/[0.12]',
              )
            }
          >
            {item.title}
          </Tab>
        ))}
      </Tab.List>
      <Tab.Panels className="mt-2">
        {items.map((item, idx) => (
          <Tab.Panel
            key={idx}
            className={classNames(
              'rounded-xl bg-white',
              'ring-white ring-opacity-60 ring-offset-2 ring-offset-blue-400 focus:outline-none',
            )}
          >
            {item.content}
          </Tab.Panel>
        ))}
      </Tab.Panels>
    </Tab.Group>
  );
}
