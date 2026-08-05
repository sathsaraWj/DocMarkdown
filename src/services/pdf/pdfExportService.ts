import { jsPDF } from 'jspdf'

import { renderMarkdown } from '@/services/markdown'
import { getPageDimensionsMm } from '@/types/page'
import type { DocumentSettings } from '@/types/settings'
import type { DocumentTemplate } from '@/types/template'
import type { ExportProgress } from '@/types/export'
import { buildFilename } from '@/utils/filename'
import { htmlToBlocks } from './htmlToBlocks'
import { resolveImageDimensions } from './resolveImages'
import { buildAutoText, resolvePlaceholders } from './headerFooter'
import { PdfWriter } from './pdfWriter'
import { buildPdfTheme } from './theme'

export interface PdfExportInput {
  markdown: string
  settings: DocumentSettings
  template: DocumentTemplate
  onProgress?: (progress: ExportProgress) => void
}

export interface PdfExportResult {
  blob: Blob
  filename: string
}

function report(
  onProgress: ((p: ExportProgress) => void) | undefined,
  progress: ExportProgress,
): void {
  onProgress?.(progress)
}

/**
 * Renders the current document to a PDF using a controlled, measurement-based
 * layout pipeline (not jsPDF's HTML renderer, which cannot reliably respect
 * custom page/margin/typography settings or paginate mixed content).
 */
export async function generatePdf({
  markdown,
  settings,
  template,
  onProgress,
}: PdfExportInput): Promise<PdfExportResult> {
  report(onProgress, { status: 'preparing', message: 'Rendering Markdown…', percent: 10 })

  const { html } = renderMarkdown(markdown, {
    headingNumbering: settings.content.headingNumbering,
    generateToc: false,
  })

  let blocks = htmlToBlocks(html)

  report(onProgress, { status: 'preparing', message: 'Resolving images…', percent: 25 })
  blocks = await resolveImageDimensions(blocks)

  report(onProgress, { status: 'rendering', message: 'Laying out pages…', percent: 45 })

  const { width, height } = getPageDimensionsMm(settings.page)
  const orientation: 'p' | 'l' = settings.page.orientation === 'landscape' ? 'l' : 'p'
  const doc = new jsPDF({
    orientation,
    unit: 'mm',
    format: [width, height],
    compress: true,
  })

  const theme = buildPdfTheme(settings, template)
  const { margins } = settings.page
  const headerReserve = settings.headerFooter.headerEnabled ? 10 : 0
  const footerReserve = settings.headerFooter.footerEnabled ? 10 : 0

  const writer = new PdfWriter(doc, theme, {
    width,
    height,
    orientation,
    marginTop: margins.top + headerReserve,
    marginRight: margins.right,
    marginBottom: margins.bottom + footerReserve,
    marginLeft: margins.left,
  })

  writer.drawBlocks(blocks)

  report(onProgress, { status: 'rendering', message: 'Drawing headers and footers…', percent: 75 })

  const totalPages = doc.getNumberOfPages()
  const { headerFooter, metadata } = settings
  const exportDate = new Date().toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })

  for (let page = 1; page <= totalPages; page += 1) {
    doc.setPage(page)
    const ctx = { page, pages: totalPages, title: metadata.title, date: exportDate }

    if (headerFooter.headerEnabled) {
      const text = headerFooter.headerText
        ? resolvePlaceholders(headerFooter.headerText, ctx)
        : buildAutoText(ctx, headerFooter.showDocTitle, headerFooter.showExportDate, false)
      if (text) {
        doc.setFont(theme.bodyFont, 'normal')
        doc.setFontSize(9)
        doc.setTextColor(...theme.mutedColor)
        doc.text(text, margins.left, margins.top - 3)
      }
    }

    if (headerFooter.footerEnabled) {
      const text = headerFooter.footerText
        ? resolvePlaceholders(headerFooter.footerText, ctx)
        : buildAutoText(
            ctx,
            headerFooter.showDocTitle,
            headerFooter.showExportDate,
            headerFooter.showPageNumber,
          )
      if (text) {
        doc.setFont(theme.bodyFont, 'normal')
        doc.setFontSize(9)
        doc.setTextColor(...theme.mutedColor)
        doc.text(text, width / 2, height - margins.bottom + 6, { align: 'center' })
      }
    }
  }

  doc.setProperties({
    title: metadata.title || 'Untitled Document',
    author: metadata.author,
    subject: metadata.subject,
    keywords: metadata.keywords,
    creator: 'DocMarkdown',
  })

  report(onProgress, { status: 'saving', message: 'Preparing download…', percent: 95 })

  const blob = doc.output('blob')
  const filename = buildFilename(metadata.title, 'pdf')

  report(onProgress, { status: 'success', message: 'PDF ready.', percent: 100 })

  return { blob, filename }
}
