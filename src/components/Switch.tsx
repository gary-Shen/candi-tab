import { Switch } from '@headlessui/react'
import { useState } from 'react'

export interface ToggleProps {
  value: boolean
  onChange?: (value: boolean) => void
}

export default function Toggle({ value, onChange }: ToggleProps) {
  const [checked, setChecked] = useState(value)

  const handleOnChange = (changedValue: boolean) => {
    setChecked(changedValue)
    if (typeof onChange === 'function') {
      onChange(changedValue)
    }
  }

  return (
    <Switch
      checked={checked}
      onChange={handleOnChange}
      className={`${checked ? 'bg-blue-600' : 'bg-gray-200'} relative inline-flex h-6 w-11 items-center rounded-full`}
    >
      <span className="sr-only">Enable notifications</span>
      <span
        className={`${
          checked ? 'translate-x-6' : 'translate-x-1'
        } inline-block h-4 w-4 transform rounded-full bg-white transition`}
      />
    </Switch>
  )
}
