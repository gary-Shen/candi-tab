import { Switch } from '@headlessui/react'
import { Check } from 'lucide-react'
import classNames from 'classnames'

export interface CheckboxProps {
  checked: boolean
  onChange: (checked: boolean) => void
  label?: React.ReactNode
  description?: React.ReactNode
  disabled?: boolean
  className?: string
}

export default function Checkbox({
  checked,
  onChange,
  label,
  description,
  disabled = false,
  className,
}: CheckboxProps) {
  return (
    <Switch.Group>
      <div className={classNames('flex items-center gap-3', className)}>
        <Switch
          checked={checked}
          onChange={onChange}
          disabled={disabled}
          className={classNames(
            'relative inline-flex h-5 w-5 items-center justify-center rounded border-2 transition-colors focus:outline-none focus:ring-2 focus:ring-color-primary focus:ring-offset-2',
            {
              'bg-color-primary border-color-primary': checked,
              'bg-form-inset border-default': !checked,
              'opacity-50 cursor-not-allowed': disabled,
              'cursor-pointer': !disabled,
            },
          )}
        >
          {checked && <Check size={14} className="text-white" strokeWidth={3} />}
        </Switch>
        {(label || description) && (
          <div className="flex flex-col">
            {label && (
              <Switch.Label
                className={classNames('text-sm cursor-pointer text-font-color', {
                  'opacity-50': disabled,
                })}
              >
                {label}
              </Switch.Label>
            )}
            {description && (
              <Switch.Description className="text-xs text-gray-color">
                {description}
              </Switch.Description>
            )}
          </div>
        )}
      </div>
    </Switch.Group>
  )
}
