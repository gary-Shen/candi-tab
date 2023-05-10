import type { DialogProps } from '@headlessui/react';
import { Dialog, Transition } from '@headlessui/react';
import { BiX } from '@react-icons/all-files/bi/BiX';
import React, { Fragment, useEffect, useState } from 'react';

import IconButton from './IconButton';

export interface ModalProps {
  children: React.ReactNode;
  visible?: boolean;
  title?: string;
  onClose?: () => void;
  showCloseButton?: boolean;
  width?: number | string;
  initialFocus?: DialogProps<React.FC>['initialFocus'];
}

export default function MyModal({
  children,
  title,
  visible,
  onClose,
  showCloseButton = true,
  width = '28rem',
  initialFocus,
}: ModalProps) {
  const [isOpen, setIsOpen] = useState(visible);

  useEffect(() => {
    setIsOpen(visible);
  }, [visible]);

  function closeModal() {
    setIsOpen(false);
  }

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-10" initialFocus={initialFocus} onClose={onClose || closeModal}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-200"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-150"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black bg-opacity-25" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-200"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-150"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel
                className="w-full transform overflow-hidden rounded bg-white p-6 text-left align-middle shadow-xl transition-all"
                style={{ width }}
              >
                <div className="flex justify-between items-center">
                  <Dialog.Title as="span" className="text-lg font-medium leading-6 text-gray-900">
                    {title}
                  </Dialog.Title>
                  {showCloseButton && (
                    <IconButton onClick={onClose} className="">
                      <BiX />
                    </IconButton>
                  )}
                </div>
                <div className="pt-6">{children}</div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}
