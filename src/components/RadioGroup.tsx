import type { SVGAttributes } from 'react'
import { RadioGroup } from '@headlessui/react'
import React, { useState } from 'react'

interface RadioOption {
  label: React.ReactNode
  value: string
  content?: React.ReactNode
}

export interface RadioGroupProps {
  value?: string
  options: RadioOption[]
  onChange?: (value: string) => void
  className?: string
}

export default function MyRadioGroup({ value, options, onChange, className }: RadioGroupProps) {
  const [selected, setSelected] = useState(value)

  const handleOnChange = (changedValue: string) => {
    setSelected(changedValue)
    onChange?.(changedValue)
  }

  return (
    <RadioGroup value={selected} onChange={handleOnChange} className={className}>
      <RadioGroup.Label className="sr-only">Server size</RadioGroup.Label>
      <div className="space-y-2">
        {options.map(option => (
          <RadioGroup.Option
            key={option.value}
            value={option.value}
            className={({ active, checked }) =>
              `${active ? 'ring-2 ring-[var(--color-primary)]' : ''}
                  ${checked ? 'bg-color-primary text-white' : 'bg-[var(--card-body-bg)]'}
                    relative flex cursor-pointer rounded-lg px-4 py-3 border border-[var(--border-color)] focus:outline-none`}
          >
            {({ checked }) => (
              <>
                <div className="flex w-full items-center justify-between">
                  <div className="flex items-center">
                    <div className="text-sm">
                      <RadioGroup.Label as="p" className={`font-medium  ${checked ? 'text-white' : ''}`}>
                        {option.label}
                      </RadioGroup.Label>
                      <RadioGroup.Description as="span" className={`inline ${checked ? 'text-white/90' : ''}`}>
                        {option.content}
                      </RadioGroup.Description>
                    </div>
                  </div>
                  {checked && (
                    <div className="shrink-0 text-white">
                      <CheckIcon className="h-6 w-6" />
                    </div>
                  )}
                </div>
              </>
            )}
          </RadioGroup.Option>
        ))}
      </div>
    </RadioGroup>
  )
}

function CheckIcon(props: SVGAttributes<HTMLOrSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" {...props}>
      <circle cx={12} cy={12} r={12} fill="#fff" opacity="0.2" />
      <path d="M7 13l3 3 7-7" stroke="#fff" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}
