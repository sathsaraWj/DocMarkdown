import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'

import { useDocument } from '@/app/DocumentContext'
import { ConfirmDialog } from '@/components/common/ConfirmDialog'
import { usePageMeta } from '@/hooks/usePageMeta'
import { renderMarkdown } from '@/services/markdown'
import { buildContentCss } from '@/styles/documentContentCss'
import { TEMPLATE_LIST } from '@/templates'
import { DEFAULT_DOCUMENT_SETTINGS } from '@/types/settings'
import type { DocumentTemplate } from '@/types/template'

/**
 * A miniature, non-interactive render of the template's starter content,
 * scaled down and clipped to act as a visual preview. Each instance gets its
 * own CSS scope class (see buildContentCss) because several of these render
 * on the page at once, each with different template colors.
 */
function TemplatePreview({ template }: { template: DocumentTemplate }) {
  const scopeClass = `doc-preview-${template.id}`
  const html = useMemo(() => renderMarkdown(template.starterContent).html, [template])
  const contentCss = useMemo(
    () => buildContentCss(DEFAULT_DOCUMENT_SETTINGS, template, scopeClass),
    [template, scopeClass],
  )

  return (
    <div
      className="relative h-44 overflow-hidden border-b border-neutral-200 bg-white dark:border-neutral-800"
      aria-hidden="true"
    >
      <style>{contentCss}</style>
      <div className="origin-top-left" style={{ transform: 'scale(0.42)', width: '238%' }}>
        <div className={`${scopeClass} px-5 py-4`} dangerouslySetInnerHTML={{ __html: html }} />
      </div>
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-12 bg-gradient-to-t from-white to-transparent" />
    </div>
  )
}

function TemplateCard({ template, onUse }: { template: DocumentTemplate; onUse: () => void }) {
  return (
    <article className="flex flex-col overflow-hidden rounded-xl border border-neutral-200 bg-white shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
      <TemplatePreview template={template} />
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
