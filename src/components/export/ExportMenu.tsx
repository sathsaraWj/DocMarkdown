import { useEffect, useRef, useState } from 'react'

import { useDocument } from '@/app/DocumentContext'
import { ChevronDownIcon, DownloadIcon, PrinterIcon } from '@/components/common/icons'
import { useExport } from '@/hooks/useExport'
import { printDocument } from '@/services/export/printService'
import { getTemplate } from '@/templates'
import type { ExportFormat } from '@/types/export'

const FORMATS: { id: ExportFormat; label: string; description: string }[] = [
  { id: 'pdf', label: 'PDF', description: 'Formatted, print-ready document' },
  { id: 'docx', label: 'DOCX', description: 'Editable Word document' },
  { id: 'html', label: 'HTML', description: 'Standalone web page' },
  { id: 'markdown', label: 'Markdown', description: 'Original .md source' },
  { id: 'text', label: 'Plain text', description: 'Readable .txt extract' },
]

interface ExportMenuProps {
  /** Bumping this value opens the menu - used by the page-level Ctrl/Cmd+Shift+P "open export menu" shortcut. */
  openSignal?: number
}

export function ExportMenu({ openSignal }: ExportMenuProps = {}) {
  const { markdown, settings } = useDocument()
  const { startExport, isExporting, progress, error, clearError } = useExport()
  const [open, setOpen] = useState(false)
  const [isPrinting, setIsPrinting] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)
  const busy = isExporting || isPrinting
  const isFirstOpenSignal = useRef(true)

  useEffect(() => {
    if (isFirstOpenSignal.current) {
      isFirstOpenSignal.current = false
      return
    }
    if (openSignal !== undefined) setOpen(true)
  }, [openSignal])

  useEffect(() => {
    function handleClick(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) setOpen(false)
    }
    function handleKey(event: KeyboardEvent) {
      if (event.key === 'Escape') setOpen(false)
    }
    document.addEventListener('mousedown', handleClick)
    document.addEventListener('keydown', handleKey)
    return () => {
      document.removeEventListener('mousedown', handleClick)
      document.removeEventListener('keydown', handleKey)
    }
  }, [])

  const handleExport = (format: ExportFormat) => {
    setOpen(false)
    const template = getTemplate(settings.templateId)
    void startExport(format, markdown, settings, template)
  }

  const triggerLabel = isExporting
    ? (progress?.message ?? 'Exporting…')
    : isPrinting
      ? 'Printing…'
      : 'Export'

  const handlePrint = () => {
    if (busy) return
    setOpen(false)
    setIsPrinting(true)
    const template = getTemplate(settings.templateId)
    void printDocument(markdown, settings, template).finally(() => setIsPrinting(false))
  }

  return (
    <div className="relative" ref={menuRef}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        disabled={busy}
        aria-haspopup="menu"
        aria-expanded={open}
        className="flex items-center gap-1.5 rounded-md bg-accent-600 px-3.5 py-2 text-sm font-semibold text-white shadow-sm hover:bg-accent-700 disabled:cursor-not-allowed disabled:opacity-60"
      >
        <DownloadIcon className="h-4 w-4" />
        {triggerLabel}
        <ChevronDownIcon className="h-3.5 w-3.5" />
      </button>

      {open && (
        <div
          role="menu"
          aria-label="Export format"
          className="absolute right-0 z-20 mt-1 w-56 rounded-lg border border-neutral-200 bg-white p-1 shadow-lg dark:border-neutral-700 dark:bg-neutral-900"
        >
          {FORMATS.map((format) => (
            <button
              key={format.id}
              type="button"
              role="menuitem"
              onClick={() => handleExport(format.id)}
              className="flex w-full flex-col rounded-md px-3 py-2 text-left hover:bg-neutral-100 dark:hover:bg-neutral-800"
            >
              <span className="text-sm font-medium text-neutral-800 dark:text-neutral-100">
                {format.label}
              </span>
              <span className="text-xs text-neutral-500 dark:text-neutral-400">
                {format.description}
              </span>
            </button>
          ))}
          <div className="my-1 border-t border-neutral-200 dark:border-neutral-700" />
          <button
            type="button"
            role="menuitem"
            onClick={handlePrint}
            className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-left hover:bg-neutral-100 dark:hover:bg-neutral-800"
          >
            <PrinterIcon className="h-4 w-4 text-neutral-500 dark:text-neutral-400" />
            <span className="flex flex-col">
              <span className="text-sm font-medium text-neutral-800 dark:text-neutral-100">
                Print
              </span>
              <span className="text-xs text-neutral-500 dark:text-neutral-400">
                Open the system print dialog
              </span>
            </span>
          </button>
        </div>
      )}

      {error && (
        <div
          role="alert"
          className="absolute right-0 top-full z-20 mt-2 w-72 rounded-md border border-red-200 bg-red-50 p-3 text-xs text-red-700 shadow-lg dark:border-red-900 dark:bg-red-950/70 dark:text-red-300"
        >
          <p>{error}</p>
          <button type="button" onClick={clearError} className="mt-1 font-medium underline">
            Dismiss
          </button>
        </div>
      )}
    </div>
  )
}
