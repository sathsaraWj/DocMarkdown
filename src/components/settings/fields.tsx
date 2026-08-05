import { useId } from 'react'
import type { ReactNode } from 'react'

interface SelectFieldProps<T extends string> {
  label: string
  value: T
  options: { value: T; label: string }[]
  onChange: (value: T) => void
}

export function SelectField<T extends string>({
  label,
  value,
  options,
  onChange,
}: SelectFieldProps<T>) {
  const id = useId()
  return (
    <div className="flex flex-col gap-1">
      <label htmlFor={id} className="text-xs font-medium text-neutral-600 dark:text-neutral-300">
        {label}
      </label>
      <select
        id={id}
        value={value}
        onChange={(event) => onChange(event.target.value as T)}
        className="rounded-md border border-neutral-300 bg-white px-2 py-1.5 text-sm text-neutral-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-500 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-100"
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  )
}

interface NumberFieldProps {
  label: string
  value: number
  min: number
  max: number
  step?: number
  onChange: (value: number) => void
  suffix?: string
}

export function NumberField({
  label,
  value,
  min,
  max,
  step = 1,
  onChange,
  suffix,
}: NumberFieldProps) {
  const id = useId()
  return (
    <div className="flex flex-col gap-1">
      <label htmlFor={id} className="text-xs font-medium text-neutral-600 dark:text-neutral-300">
        {label} {suffix ? <span className="text-neutral-400">({suffix})</span> : null}
      </label>
      <input
        id={id}
        type="number"
        value={value}
        min={min}
        max={max}
        step={step}
        onChange={(event) => {
          const next = Number(event.target.value)
          if (Number.isFinite(next)) onChange(Math.min(max, Math.max(min, next)))
        }}
        className="rounded-md border border-neutral-300 bg-white px-2 py-1.5 text-sm text-neutral-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-500 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-100"
      />
    </div>
  )
}

interface TextFieldProps {
  label: string
  value: string
  onChange: (value: string) => void
  placeholder?: string
  multiline?: boolean
}

export function TextField({ label, value, onChange, placeholder, multiline }: TextFieldProps) {
  const id = useId()
  return (
    <div className="flex flex-col gap-1">
      <label htmlFor={id} className="text-xs font-medium text-neutral-600 dark:text-neutral-300">
        {label}
      </label>
      {multiline ? (
        <textarea
          id={id}
          value={value}
          placeholder={placeholder}
          onChange={(event) => onChange(event.target.value)}
          rows={2}
          className="rounded-md border border-neutral-300 bg-white px-2 py-1.5 text-sm text-neutral-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-500 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-100"
        />
      ) : (
        <input
          id={id}
          type="text"
          value={value}
          placeholder={placeholder}
          onChange={(event) => onChange(event.target.value)}
          className="rounded-md border border-neutral-300 bg-white px-2 py-1.5 text-sm text-neutral-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-500 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-100"
        />
      )}
    </div>
  )
}

interface ToggleFieldProps {
  label: string
  checked: boolean
  onChange: (checked: boolean) => void
  description?: string
}

export function ToggleField({ label, checked, onChange, description }: ToggleFieldProps) {
  const id = useId()
  return (
    <div className="flex items-center justify-between gap-3 py-1">
      <div className="flex flex-col">
        <label htmlFor={id} className="text-sm font-medium text-neutral-700 dark:text-neutral-200">
          {label}
        </label>
        {description && (
          <span className="text-[11px] text-neutral-400 dark:text-neutral-500">{description}</span>
        )}
      </div>
      <button
        id={id}
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={`relative h-6 w-11 shrink-0 rounded-full transition-colors ${
          checked ? 'bg-accent-600' : 'bg-neutral-300 dark:bg-neutral-700'
        }`}
      >
        <span
          className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${
            checked ? 'translate-x-5' : 'translate-x-0.5'
          }`}
        />
      </button>
    </div>
  )
}

export function SectionHeading({ children }: { children: ReactNode }) {
  return (
    <h3 className="text-sm font-semibold text-neutral-800 dark:text-neutral-100">{children}</h3>
  )
}
