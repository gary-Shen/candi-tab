import React, { Fragment, useImperativeHandle, useLayoutEffect, useRef } from 'react';
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
  buttonStyle?: React.CSSProperties;
}

const MenuButton = styled.button``;

const Items = React.forwardRef(({ options, buttonStyle }: Pick<MyMenuProps, 'options' | 'buttonStyle'>, ref) => {
  const itemsRef = useRef<any>(null);

  useImperativeHandle(ref, () => itemsRef.current, []);

  useLayoutEffect(() => {
    const itemsRect = itemsRef.current.getBoundingClientRect();
    const distanceToBottom = window.innerHeight - itemsRect.top - itemsRect.height;

    if (distanceToBottom < 0) {
      itemsRef.current.classList.remove('mt-2');
      itemsRef.current.classList.add('mb-2');
      itemsRef.current.style.bottom = '100%';
    }
  }, []);

  return (
    <Menu.Items
      static
      ref={itemsRef}
      className="absolute z-[1999] right-0 mt-2 min-w-full divide-y border border-[var(--menu-border-color)] divide-gray-100 rounded-[var(--border-radius)] bg-[var(--menu-overlay-bg)] shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none"
    >
      <div className="px-1 py-1 ">
        {options.map(({ key, title, as, className: itemClassName, ...props }) => (
          <Menu.Item key={key}>
            {({ active }) => (
              <MenuButton
                as={as}
                style={active ? buttonStyle : undefined}
                className={classNames(
                  itemClassName,
                  'group flex w-full items-center rounded-md pl-2 pr-4 py-1 whitespace-nowrap',
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
  );
});

export default function MyMenu({ children, options, className, buttonClassName, buttonStyle }: MyMenuProps) {
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
  );
}
