import { jsPDF } from 'jspdf'

import { getPageDimensionsMm } from '@/types/page'
import type { DocumentSettings } from '@/types/settings'
import type { DocumentTemplate } from '@/types/template'
import type { ExportProgress } from '@/types/export'
import { buildFilename } from '@/utils/filename'
import { registerEmbeddedFonts } from './embeddedFonts'
import { htmlToBlocks } from './htmlToBlocks'
import { resolveImageDimensions } from './resolveImages'
import { buildAutoText, resolvePlaceholders } from './headerFooter'
import { PdfWriter } from './pdfWriter'
import { buildPdfTheme, type PdfThemeFontOverride } from './theme'

export interface RenderHtmlToPdfInput {
  /** Already-sanitized HTML — callers are responsible for rendering/sanitizing their own source format first. */
  html: string
  settings: DocumentSettings
  template: DocumentTemplate
  /** Word-only: renders body/heading text in the source document's detected font instead of the generic template font. */
  fontOverride?: PdfThemeFontOverride
  onProgress?: (progress: ExportProgress) => void
}

export interface RenderHtmlToPdfResult {
  blob: Blob
  filename: string
}

function report(onProgress: ((p: ExportProgress) => void) | undefined, progress: ExportProgress): void {
  onProgress?.(progress)
}

/**
 * The shared PDF layout core: sanitized HTML -> block model -> jsPDF, driven
 * by a measurement-based layout pipeline (not jsPDF's HTML renderer or
 * html2canvas, neither of which can reliably respect custom page/margin/
 * typography settings or paginate mixed content).
 *
 * Both the Markdown converter (pdfExportService.ts, which renders Markdown
 * to HTML first) and the Word converter (exportWordDocumentToPdf.ts, whose
 * HTML already comes from mammoth) funnel through this single function so
 * page layout, header/footer, and metadata handling never diverge between
 * the two.
 */
export async function renderHtmlToPdf({
  html,
  settings,
  template,
  fontOverride,
  onProgress,
}: RenderHtmlToPdfInput): Promise<RenderHtmlToPdfResult> {
  report(onProgress, { status: 'preparing', message: 'Preparing document…', percent: 15 })

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

  await registerEmbeddedFonts(doc)

  const theme = buildPdfTheme(settings, template, fontOverride)
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
