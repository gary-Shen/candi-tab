import React, { Fragment, useEffect, useMemo, useState } from 'react';
import { Listbox, Transition } from '@headlessui/react';
import { BiCheck } from '@react-icons/all-files/bi/BiCheck';
import { BiChevronDown } from '@react-icons/all-files/bi/BiChevronDown';

interface SelectOption {
  label: React.ReactNode;
  value: string;
}

export interface SelectProps {
  value?: string;
  options: SelectOption[];
  onChange?: (value: string) => void;
}

export default function Select({ options, value, onChange }: SelectProps) {
  const [selectedValue, setSelected] = useState(value);

  useEffect(() => {
    setSelected(value);
  }, [value]);

  const handleChange = (changedValue: string) => {
    setSelected(changedValue);
    onChange?.(changedValue);
  };

  const selectedOption = useMemo(
    () => options.find((option) => option.value === selectedValue),
    [options, selectedValue],
  );

  return (
    <Listbox value={selectedValue} onChange={handleChange}>
      <div className="relative mt-1">
        <Listbox.Button className="relative w-full cursor-default rounded-lg py-2 pl-3 pr-10 text-left border border-[var(--border-color)] focus:outline-none focus-visible:border-[var(--color-primary-500)] focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-opacity-75 focus-visible:ring-offset-2 focus-visible:ring-offset-orange-300 sm:text-sm focus:border-color-primary focus:ring-1 focus:ring-color-primary">
          <span className="block truncate">{selectedOption?.label ?? 'none'}</span>
          <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
            <BiChevronDown className="h-5 w-5 text-gray-400" aria-hidden="true" />
          </span>
        </Listbox.Button>
        <Transition as={Fragment} leave="transition ease-in duration-100" leaveFrom="opacity-100" leaveTo="opacity-0">
          <Listbox.Options className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-[var(--select-overlay-bg)] py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
            {options.map((option) => (
              <Listbox.Option
                key={option.value}
                className={({ active }) =>
                  `relative cursor-default select-none py-2 pl-10 pr-4 ${
                    active ? 'bg-[var(--color-primary-100)] text-color-primary' : ''
                  }`
                }
                value={option.value}
              >
                {({ selected }) => (
                  <>
                    <span className={`block truncate ${selected ? 'font-medium' : 'font-normal'}`}>{option.label}</span>
                    {selected ? (
                      <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-color-primary">
                        <BiCheck className="h-5 w-5" aria-hidden="true" />
                      </span>
                    ) : null}
                  </>
                )}
              </Listbox.Option>
            ))}
          </Listbox.Options>
        </Transition>
      </div>
    </Listbox>
  );
}
