import React, { Fragment } from 'react';
import { Menu, Transition } from '@headlessui/react';
import classNames from 'classnames';
import styled from 'styled-components';

interface MenuItemProps {
  title: React.ReactNode;
  key: string;
  as?: React.ElementType;
  onClick?: () => void;
  className?: string;
}

export interface MyMenuProps {
  options: MenuItemProps[];
  children: React.ReactNode;
  className?: string;
  buttonClassName?: string;
}

const MenuButton = styled.button``;

export default function MyMenu({ children, options, className, buttonClassName }: MyMenuProps) {
  return (
    <Menu as="div" className={classNames('relative inline-block text-left', className)}>
      <Menu.Button className={buttonClassName}>{children}</Menu.Button>
      <Transition
        as={Fragment}
        enter="transition ease-out duration-100"
        enterFrom="transform opacity-0 scale-95"
        enterTo="transform opacity-100 scale-100"
        leave="transition ease-in duration-75"
        leaveFrom="transform opacity-100 scale-100"
        leaveTo="transform opacity-0 scale-95"
      >
        <Menu.Items className="absolute z-[1999] right-0 mt-2 w-48 origin-top-right divide-y divide-gray-100 rounded-md bg-[var(--menu-overlay-bg)] shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
          <div className="px-1 py-1 ">
            {options.map(({ key, title, as, className: itemClassName, ...props }) => (
              <Menu.Item key={key}>
                {({ active }) => (
                  <MenuButton
                    as={as}
                    className={classNames(
                      itemClassName,
                      'group flex w-full items-center rounded-md px-2 py-2 text-sm',
                      {
                        'bg-[var(--menu-active-bg)] text-[var(--menu-text-active-color)]': active,
                      },
                    )}
                    {...props}
                  >
                    {title}
                  </MenuButton>
                )}
              </Menu.Item>
            ))}
          </div>
        </Menu.Items>
      </Transition>
    </Menu>
  );
}
