import { useDocument } from '@/app/DocumentContext'
import { getTemplate } from '@/templates'
import { COLOR_OVERRIDE_FIELDS } from '@/types/colors'
import { ColorField, SectionHeading } from './fields'

export function ColorSettingsSection() {
  const { settings, setSettings } = useDocument()
  const template = getTemplate(settings.templateId)
  const overrides = settings.colors ?? {}
  const hasOverrides = Object.keys(overrides).length > 0

  const setColor = (key: (typeof COLOR_OVERRIDE_FIELDS)[number]['key'], value: string) => {
    setSettings((prev) => ({ ...prev, colors: { ...prev.colors, [key]: value } }))
  }

  const resetColors = () => {
    setSettings((prev) => ({ ...prev, colors: {} }))
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <SectionHeading>Colors</SectionHeading>
        {hasOverrides && (
          <button
            type="button"
            onClick={resetColors}
            className="text-xs font-medium text-accent-600 hover:underline dark:text-accent-400"
          >
            Reset to template
          </button>
        )}
      </div>
      <p className="text-xs text-neutral-500 dark:text-neutral-400">
        Overrides the {template.name} template's palette for this document. Applies to the preview
        and every export format.
      </p>
      <div className="grid grid-cols-2 gap-3">
        {COLOR_OVERRIDE_FIELDS.map(({ key, label }) => (
          <ColorField
            key={key}
            label={label}
            value={overrides[key] ?? template.style[key]}
            onChange={(value) => setColor(key, value)}
          />
        ))}
      </div>
    </div>
  )
}
