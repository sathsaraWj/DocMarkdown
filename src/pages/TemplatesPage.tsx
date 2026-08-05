import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

import { useDocument } from '@/app/DocumentContext'
import { ConfirmDialog } from '@/components/common/ConfirmDialog'
import { usePageMeta } from '@/hooks/usePageMeta'
import { TEMPLATE_LIST } from '@/templates'
import type { DocumentTemplate } from '@/types/template'

function TemplateCard({ template, onUse }: { template: DocumentTemplate; onUse: () => void }) {
  return (
    <article className="flex flex-col overflow-hidden rounded-xl border border-neutral-200 bg-white shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
      <div
        className="flex h-36 flex-col justify-center gap-2 border-b border-neutral-200 px-5 dark:border-neutral-800"
        style={{ backgroundColor: `${template.style.accentColor}0d` }}
        aria-hidden="true"
      >
        <div
          className="h-2.5 w-2/3 rounded"
          style={{ backgroundColor: template.style.headingColor, opacity: 0.85 }}
        />
        <div className="h-1.5 w-full rounded bg-neutral-300/70 dark:bg-neutral-700/70" />
        <div className="h-1.5 w-5/6 rounded bg-neutral-300/70 dark:bg-neutral-700/70" />
        <div className="h-1.5 w-4/6 rounded bg-neutral-300/70 dark:bg-neutral-700/70" />
      </div>
      <div className="flex flex-1 flex-col gap-2 p-5">
        <h2 className="text-base font-semibold text-neutral-900 dark:text-white">
          {template.name}
        </h2>
        <p className="text-sm text-neutral-600 dark:text-neutral-300">{template.description}</p>
        <p className="text-xs font-medium text-neutral-500 dark:text-neutral-400">
          Best for: {template.bestFor}
        </p>
        <button
          type="button"
          onClick={onUse}
          className="mt-auto self-start rounded-md bg-accent-600 px-3.5 py-1.5 text-sm font-semibold text-white hover:bg-accent-700"
        >
          Use template
        </button>
      </div>
    </article>
  )
}

export default function TemplatesPage() {
  usePageMeta({
    title: 'Templates',
    description:
      'Five professionally designed Markdown templates for reports, technical docs, resumes, and more.',
    path: '/templates',
  })

  const { markdown, setMarkdown, setSettings } = useDocument()
  const navigate = useNavigate()
  const [pending, setPending] = useState<DocumentTemplate | null>(null)

  const applyTemplate = (template: DocumentTemplate) => {
    setSettings((prev) => ({ ...prev, templateId: template.id }))
    setMarkdown(template.starterContent)
    navigate('/')
  }

  const handleUse = (template: DocumentTemplate) => {
    if (markdown.trim().length > 0) {
      setPending(template)
    } else {
      applyTemplate(template)
    }
  }

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
      <header className="mb-8 max-w-2xl">
        <h1 className="text-2xl font-bold text-neutral-900 dark:text-white sm:text-3xl">
          Templates
        </h1>
        <p className="mt-2 text-neutral-600 dark:text-neutral-300">
          Start from a template tuned for the kind of document you're writing. Applying a template
          sets its styling and loads starter Markdown you can edit freely.
        </p>
      </header>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {TEMPLATE_LIST.map((template) => (
          <TemplateCard key={template.id} template={template} onUse={() => handleUse(template)} />
        ))}
      </div>

      <ConfirmDialog
        open={pending !== null}
        title={`Replace current Markdown with the ${pending?.name ?? ''} template?`}
        description="Your current editor content will be replaced with this template's starter Markdown. This cannot be undone."
        confirmLabel="Use template"
        destructive={false}
        onConfirm={() => {
          if (pending) applyTemplate(pending)
          setPending(null)
        }}
        onCancel={() => setPending(null)}
      />
    </div>
  )
}
