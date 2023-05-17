import React, { Fragment } from 'react';
import { Menu, Transition } from '@headlessui/react';

interface MenuItemProps {
  title: React.ReactNode;
  key: string;
  onClick?: () => void;
}

export interface MyMenuProps {
  options: MenuItemProps[];
  children: React.ReactNode;
}

export default function MyMenu({ children, options }: MyMenuProps) {
  return (
    <Menu as="div" className="relative inline-block text-left ml-2">
      <Menu.Button>{children}</Menu.Button>
      <Transition
        as={Fragment}
        enter="transition ease-out duration-100"
        enterFrom="transform opacity-0 scale-95"
        enterTo="transform opacity-100 scale-100"
        leave="transition ease-in duration-75"
        leaveFrom="transform opacity-100 scale-100"
        leaveTo="transform opacity-0 scale-95"
      >
        <Menu.Items className="absolute right-0 mt-2 w-48 origin-top-right divide-y divide-gray-100 rounded-md bg-[var(--menu-overlay-bg)] shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
          <div className="px-1 py-1 ">
            {options.map(({ key, title, onClick }) => (
              <Menu.Item key={key}>
                {({ active }) => (
                  <button
                    className={`${
                      active ? 'bg-[var(--menu-active-bg)] text-[var(--menu-text-active-color)]' : ''
                    } group flex w-full items-center rounded-md px-2 py-2 text-sm`}
                    onClick={onClick}
                  >
                    {title}
                  </button>
                )}
              </Menu.Item>
            ))}
          </div>
        </Menu.Items>
      </Transition>
    </Menu>
  );
}
