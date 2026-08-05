import type { PdfThemeFontOverride } from '@/services/pdf/theme'
import type { DocumentSettings } from '@/types/settings'
import type { DocumentTemplate } from '@/types/template'
import type { ExportProgress, ExportResult } from '@/types/export'
import type { WordExportFormat, WordImageOptions } from '@/types/word'
import { downloadBlob, downloadText } from '@/utils/download'
import { buildWordStandaloneHtml } from './wordHtmlExport'
import { buildWordTextExport } from './wordTextExport'

export interface RunWordExportInput {
  format: WordExportFormat
  html: string
  images: WordImageOptions
  settings: DocumentSettings
  template: DocumentTemplate
  fontOverride?: PdfThemeFontOverride
  onProgress?: (progress: ExportProgress) => void
}

/**
 * Single entry point for every Word-to-PDF export format. Mirrors
 * services/export/exportService.ts (the Markdown converter's version) and
 * always resolves rather than throwing, so callers render a consistent
 * success/error UI state.
 */
export async function runWordExport({
  format,
  html,
  images,
  settings,
  template,
  fontOverride,
  onProgress,
}: RunWordExportInput): Promise<ExportResult> {
  try {
    if (format === 'text') {
      const { content, filename } = buildWordTextExport(html, settings.metadata.title)
      downloadText(content, filename, 'text/plain')
      return { success: true, format, filename }
    }

    if (format === 'html') {
      const { html: exportedHtml, filename } = buildWordStandaloneHtml(html, settings, template)
      downloadText(exportedHtml, filename, 'text/html')
      return { success: true, format, filename }
    }

    const { exportWordDocumentToPdf } = await import('@/services/pdf/exportWordDocumentToPdf')
    const { blob, filename } = await exportWordDocumentToPdf({
      html,
      images,
      settings,
      template,
      fontOverride,
      onProgress,
    })
    downloadBlob(blob, filename)
    return { success: true, format, filename }
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Export failed for an unknown reason.'
    onProgress?.({ status: 'error', message, percent: 0 })
    return { success: false, format, error: message }
  }
}
