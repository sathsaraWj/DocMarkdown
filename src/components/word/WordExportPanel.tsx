import { DownloadIcon } from '@/components/common/icons'
import { SectionHeading } from '@/components/settings/fields'
import { useWordExport } from '@/hooks/useWordExport'
import type { PdfThemeFontOverride } from '@/services/pdf/theme'
import { getTemplate } from '@/templates'
import type { DocumentSettings } from '@/types/settings'
import type { WordExportFormat, WordImageOptions } from '@/types/word'

interface WordExportPanelProps {
  html: string
  ready: boolean
  images: WordImageOptions
  settings: DocumentSettings
  /** The source .docx's detected font, applied to the PDF export unless "normalize styling" is on. */
  fontOverride?: PdfThemeFontOverride
}

const FORMATS: { id: WordExportFormat; label: string; description: string }[] = [
  { id: 'pdf', label: 'Export PDF', description: 'Formatted, print-ready document' },
  { id: 'html', label: 'Download HTML', description: 'Standalone web page' },
  { id: 'text', label: 'Download plain text', description: 'Readable .txt extract' },
]

export function WordExportPanel({ html, ready, images, settings, fontOverride }: WordExportPanelProps) {
  const { startExport, isExporting, progress, error, clearError } = useWordExport()

  const handleExport = (format: WordExportFormat) => {
    const template = getTemplate(settings.templateId)
    void startExport(format, html, images, settings, template, fontOverride)
  }

  return (
    <div className="flex flex-col gap-3">
      <SectionHeading>Export</SectionHeading>
      <div className="flex flex-col gap-2">
        {FORMATS.map((format) => (
          <button
            key={format.id}
            type="button"
            disabled={!ready || isExporting}
            onClick={() => handleExport(format.id)}
            className="flex items-center justify-between gap-2 rounded-md border border-neutral-200 px-3 py-2.5 text-left text-sm hover:bg-neutral-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-neutral-700 dark:hover:bg-neutral-800"
          >
            <span>
              <span className="block font-medium text-neutral-800 dark:text-neutral-100">
                {format.label}
              </span>
              <span className="block text-xs text-neutral-500 dark:text-neutral-400">
                {format.description}
              </span>
            </span>
            <DownloadIcon className="h-4 w-4 shrink-0 text-neutral-400" />
          </button>
        ))}
      </div>

      <div role="status" aria-live="polite" className="min-h-[1.25rem] text-xs text-neutral-500 dark:text-neutral-400">
        {isExporting && (progress?.message ?? 'Exporting…')}
        {!isExporting && progress?.status === 'success' && 'Export complete.'}
      </div>

      {error && (
        <div
          role="alert"
          className="flex items-start justify-between gap-2 rounded-md border border-red-200 bg-red-50 p-3 text-xs text-red-700 dark:border-red-900 dark:bg-red-950/50 dark:text-red-300"
        >
          <span>{error}</span>
          <button type="button" onClick={clearError} className="shrink-0 font-medium underline">
            Dismiss
          </button>
        </div>
      )}

      {!ready && (
        <p className="text-xs text-neutral-400 dark:text-neutral-500">
          Upload and convert a document to enable exporting.
        </p>
      )}
    </div>
  )
}
