import type { DocumentSettings } from '@/types/settings'
import type { DocumentTemplate } from '@/types/template'
import type { ExportFormat, ExportProgress, ExportResult } from '@/types/export'
import { downloadBlob, downloadText } from '@/utils/download'
import { buildStandaloneHtml } from './htmlExport'
import { buildMarkdownExport } from './markdownExport'
import { buildTextExport } from './textExport'

export interface RunExportInput {
  format: ExportFormat
  markdown: string
  settings: DocumentSettings
  template: DocumentTemplate
  onProgress?: (progress: ExportProgress) => void
}

/**
 * Single entry point for every export format. Always resolves (never
 * throws) so callers can render a consistent success/error UI state.
 */
export async function runExport({
  format,
  markdown,
  settings,
  template,
  onProgress,
}: RunExportInput): Promise<ExportResult> {
  try {
    if (format === 'markdown') {
      const { content, filename } = buildMarkdownExport(markdown, settings.metadata.title)
      downloadText(content, filename, 'text/markdown')
      return { success: true, format, filename }
    }

    if (format === 'text') {
      const { content, filename } = buildTextExport(markdown, settings.metadata.title)
      downloadText(content, filename, 'text/plain')
      return { success: true, format, filename }
    }

    if (format === 'html') {
      const { html, filename } = buildStandaloneHtml(markdown, settings, template)
      downloadText(html, filename, 'text/html')
      return { success: true, format, filename }
    }

    const { generatePdf } = await import('@/services/pdf/pdfExportService')
    const { blob, filename } = await generatePdf({ markdown, settings, template, onProgress })
    downloadBlob(blob, filename)
    return { success: true, format, filename }
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Export failed for an unknown reason.'
    onProgress?.({ status: 'error', message, percent: 0 })
    return { success: false, format, error: message }
  }
}
