import { useDocument } from '@/app/DocumentContext'
import { TEMPLATE_LIST } from '@/templates'
import { SectionHeading } from './fields'

export function TemplateSelectSection() {
  const { settings, setSettings } = useDocument()

  return (
    <div className="flex flex-col gap-2">
      <SectionHeading>Template</SectionHeading>
      <div className="grid grid-cols-1 gap-2">
        {TEMPLATE_LIST.map((template) => {
          const active = settings.templateId === template.id
          return (
            <button
              key={template.id}
              type="button"
              aria-pressed={active}
              onClick={() => setSettings((prev) => ({ ...prev, templateId: template.id }))}
              className={`flex items-center justify-between rounded-md border px-3 py-2 text-left text-sm transition-colors ${
                active
                  ? 'border-accent-500 bg-accent-50 text-accent-800 dark:bg-accent-950/40 dark:text-accent-200'
                  : 'border-neutral-200 text-neutral-700 hover:bg-neutral-50 dark:border-neutral-700 dark:text-neutral-200 dark:hover:bg-neutral-800'
              }`}
            >
              <span className="font-medium">{template.name}</span>
              <span
                className="h-4 w-4 rounded-full border border-black/10"
                style={{ backgroundColor: template.style.accentColor }}
                aria-hidden="true"
              />
            </button>
          )
        })}
      </div>
    </div>
  )
}
