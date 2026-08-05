import { renderMarkdown } from '@/services/markdown'
import type { DocumentSettings } from '@/types/settings'
import type { DocumentTemplate } from '@/types/template'
import type { ExportProgress } from '@/types/export'
import { renderHtmlToPdf, type RenderHtmlToPdfResult } from './renderHtmlToPdf'

export interface PdfExportInput {
  markdown: string
  settings: DocumentSettings
  template: DocumentTemplate
  onProgress?: (progress: ExportProgress) => void
}

export type PdfExportResult = RenderHtmlToPdfResult

/**
 * Renders the current Markdown document to a PDF. Markdown-specific: parses
 * and sanitizes the source, then hands off to the shared HTML->PDF core
 * (renderHtmlToPdf.ts), which also backs the Word-to-PDF converter.
 */
export async function generatePdf({
  markdown,
  settings,
  template,
  onProgress,
}: PdfExportInput): Promise<PdfExportResult> {
  onProgress?.({ status: 'preparing', message: 'Rendering Markdown…', percent: 5 })

  const { html } = renderMarkdown(markdown, {
    headingNumbering: settings.content.headingNumbering,
    generateToc: false,
  })

  return renderHtmlToPdf({ html, settings, template, onProgress })
}
