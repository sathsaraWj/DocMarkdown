import { useDocument } from '@/app/DocumentContext'
import type { ThemePreference } from '@/types/settings'
import { MoonIcon, SunIcon, SystemIcon } from '@/components/common/icons'

const OPTIONS: { value: ThemePreference; label: string; icon: typeof SunIcon }[] = [
  { value: 'light', label: 'Light theme', icon: SunIcon },
  { value: 'dark', label: 'Dark theme', icon: MoonIcon },
  { value: 'system', label: 'Match system theme', icon: SystemIcon },
]

export function ThemeSwitcher() {
  const { theme, setTheme } = useDocument()

  return (
    <div
      role="radiogroup"
      aria-label="Theme"
      className="inline-flex items-center gap-0.5 rounded-full border border-neutral-200 bg-neutral-100 p-0.5 dark:border-neutral-700 dark:bg-neutral-800"
    >
      {OPTIONS.map(({ value, label, icon: IconComponent }) => {
        const active = theme === value
        return (
          <button
            key={value}
            type="button"
            role="radio"
            aria-checked={active}
            aria-label={label}
            title={label}
            onClick={() => setTheme(value)}
            className={`flex h-7 w-7 items-center justify-center rounded-full transition-colors ${
              active
                ? 'bg-white text-accent-600 shadow-sm dark:bg-neutral-900 dark:text-accent-400'
                : 'text-neutral-500 hover:text-neutral-800 dark:text-neutral-400 dark:hover:text-neutral-100'
            }`}
          >
            <IconComponent className="h-4 w-4" />
          </button>
        )
      })}
    </div>
  )
}
