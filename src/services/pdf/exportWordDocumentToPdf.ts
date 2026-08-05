import { applyWordImageOptions } from '@/services/word/wordImageProcessing'
import type { DocumentSettings } from '@/types/settings'
import type { DocumentTemplate } from '@/types/template'
import type { ExportProgress } from '@/types/export'
import type { WordImageOptions } from '@/types/word'
import { renderHtmlToPdf, type RenderHtmlToPdfResult } from './renderHtmlToPdf'
import type { PdfThemeFontOverride } from './theme'

export interface WordPdfExportInput {
  /** Already-sanitized HTML produced by services/word/parseDocx.ts. */
  html: string
  images: WordImageOptions
  settings: DocumentSettings
  template: DocumentTemplate
  /** The source .docx's detected dominant font, applied unless the user opted into "normalize styling." */
  fontOverride?: PdfThemeFontOverride
  onProgress?: (progress: ExportProgress) => void
}

export type WordPdfExportResult = RenderHtmlToPdfResult

/**
 * Renders a converted Word document to a PDF. Word-specific: applies the
 * include/compress image settings, then hands off to the same HTML->PDF
 * core (renderHtmlToPdf.ts) the Markdown converter uses, so page size,
 * margins, headers/footers, and pagination behave identically either way.
 */
export async function exportWordDocumentToPdf({
  html,
  images,
  settings,
  template,
  fontOverride,
  onProgress,
}: WordPdfExportInput): Promise<WordPdfExportResult> {
  onProgress?.({ status: 'preparing', message: 'Preparing images…', percent: 5 })
  const processedHtml = await applyWordImageOptions(html, images)

  return renderHtmlToPdf({ html: processedHtml, settings, template, fontOverride, onProgress })
}
