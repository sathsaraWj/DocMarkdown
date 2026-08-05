import { useEffect, useRef, useState } from 'react'

import { CheckIcon, CopyIcon } from '@/components/common/icons'
import { renderMarkdown } from '@/services/markdown'
import { hydrateMermaidDiagrams } from '@/services/markdown/mermaid'

interface GuideEntryProps {
  title: string
  description: string
  example: string
}

export function GuideEntry({ title, description, example }: GuideEntryProps) {
  const [copied, setCopied] = useState(false)
  const { html } = renderMarkdown(example)
  const previewRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const node = previewRef.current
    if (!node) return
    void hydrateMermaidDiagrams(node)
  }, [html])

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(example)
      setCopied(true)
      setTimeout(() => setCopied(false), 1600)
    } catch {
      setCopied(false)
    }
  }

  return (
    <section
      id={title.toLowerCase().replace(/\s+/g, '-')}
      className="rounded-xl border border-neutral-200 bg-white p-5 dark:border-neutral-800 dark:bg-neutral-900"
    >
      <h2 className="text-lg font-semibold text-neutral-900 dark:text-white">{title}</h2>
      <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-300">{description}</p>

      <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="relative rounded-lg border border-neutral-200 bg-neutral-50 dark:border-neutral-700 dark:bg-neutral-950">
          <div className="flex items-center justify-between border-b border-neutral-200 px-3 py-1.5 dark:border-neutral-700">
            <span className="text-xs font-medium text-neutral-500 dark:text-neutral-400">
              Markdown
            </span>
            <button
              type="button"
              onClick={() => void handleCopy()}
              aria-label={`Copy ${title} example`}
              className="flex items-center gap-1 rounded px-1.5 py-0.5 text-xs text-neutral-500 hover:bg-neutral-200 dark:text-neutral-400 dark:hover:bg-neutral-800"
            >
              {copied ? (
                <CheckIcon className="h-3.5 w-3.5" />
              ) : (
                <CopyIcon className="h-3.5 w-3.5" />
              )}
              {copied ? 'Copied' : 'Copy'}
            </button>
          </div>
          <pre className="overflow-x-auto p-3 font-mono text-xs text-neutral-700 dark:text-neutral-300">
            <code>{example}</code>
          </pre>
        </div>

        <div className="rounded-lg border border-neutral-200 bg-white p-3 dark:border-neutral-700 dark:bg-neutral-900">
          <span className="mb-2 block text-xs font-medium text-neutral-500 dark:text-neutral-400">
            Rendered output
          </span>
          <div
            ref={previewRef}
            className="doc-content text-sm"
            dangerouslySetInnerHTML={{ __html: html }}
          />
        </div>
      </div>
    </section>
  )
}
