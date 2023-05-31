import { Popover, Transition } from '@headlessui/react';
import classNames from 'classnames';
import React, { Fragment } from 'react';

export interface PopoverProps {
  className?: string;
  overlay: React.ReactNode;
  as?: React.ElementType;
  buttonClassName?: string;
}

export default function MyPopover({
  className,
  children,
  as,
  overlay,
  buttonClassName,
}: React.PropsWithChildren<PopoverProps>) {
  return (
    <Popover className={classNames(className, 'relative text-[0]')}>
      {({ open }) => (
        <>
          <Popover.Button
            as={as}
            className={classNames(
              buttonClassName,
              'group inline-flex items-center rounded-md text-base font-medium text-white hover:text-opacity-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-opacity-75',
              {
                'text-opacity-90': !open,
              },
            )}
          >
            {children}
          </Popover.Button>
          <Transition
            as={Fragment}
            enter="transition ease-out duration-200"
            enterFrom="opacity-0 translate-y-1"
            enterTo="opacity-100 translate-y-0"
            leave="transition ease-in duration-150"
            leaveFrom="opacity-100 translate-y-0"
            leaveTo="opacity-0 translate-y-1"
          >
            <Popover.Panel className="absolute left-1/2 z-10 -translate-x-1/2 bg-white p-4 shadow rounded-lg">
              {overlay}
            </Popover.Panel>
          </Transition>
        </>
      )}
    </Popover>
  );
}
