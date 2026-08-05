import { Document, Packer } from 'docx'

import { renderMarkdown } from '@/services/markdown'
import { rasterizeMermaidDiagrams } from '@/services/markdown/mermaidRaster'
import { htmlToBlocks } from '@/services/pdf/htmlToBlocks'
import { resolveImageDimensions } from '@/services/pdf/resolveImages'
import type { ExportProgress } from '@/types/export'
import { getPageDimensionsMm } from '@/types/page'
import type { DocumentSettings } from '@/types/settings'
import type { DocumentTemplate } from '@/types/template'
import { buildFilename } from '@/utils/filename'
import { blocksToDocx } from './blocksToDocx'
import { buildDocxTheme, mmToTwips } from './docxTheme'

export interface DocxExportInput {
  markdown: string
  settings: DocumentSettings
  template: DocumentTemplate
  onProgress?: (progress: ExportProgress) => void
}

export interface DocxExportResult {
  blob: Blob
  filename: string
}

/**
 * Renders the current Markdown document to a .docx file, reusing the exact
 * same sanitized-HTML -> content-block pipeline as the PDF exporter
 * (htmlToBlocks.ts / resolveImages.ts) so the two export formats never
 * diverge on how a document's structure is interpreted - only the final
 * writer (jsPDF vs. docx) differs.
 */
export async function generateDocx({
  markdown,
  settings,
  template,
  onProgress,
}: DocxExportInput): Promise<DocxExportResult> {
  onProgress?.({ status: 'preparing', message: 'Rendering Markdown…', percent: 10 })

  const { html } = renderMarkdown(markdown, {
    headingNumbering: settings.content.headingNumbering,
    generateToc: false,
  })

  onProgress?.({ status: 'preparing', message: 'Rendering diagrams…', percent: 25 })
  const withRasterizedDiagrams = await rasterizeMermaidDiagrams(html)

  let blocks = htmlToBlocks(withRasterizedDiagrams)

  onProgress?.({ status: 'preparing', message: 'Resolving images…', percent: 40 })
  blocks = await resolveImageDimensions(blocks)

  onProgress?.({ status: 'rendering', message: 'Building document…', percent: 60 })

  const theme = buildDocxTheme(settings, template)
  const { width, height } = getPageDimensionsMm(settings.page)
  const { margins } = settings.page

  const doc = new Document({
    title: settings.metadata.title || 'Untitled Document',
    subject: settings.metadata.subject,
    creator: settings.metadata.author || 'DocMarkdown',
    keywords: settings.metadata.keywords,
    styles: {
      default: {
        document: {
          run: { font: theme.bodyFont, size: theme.bodyFontSizeHalfPt },
          paragraph: { spacing: { line: theme.lineSpacing } },
        },
      },
    },
    sections: [
      {
        properties: {
          page: {
            size: { width: mmToTwips(width), height: mmToTwips(height) },
            margin: {
              top: mmToTwips(margins.top),
              right: mmToTwips(margins.right),
              bottom: mmToTwips(margins.bottom),
              left: mmToTwips(margins.left),
            },
          },
        },
        children: blocksToDocx(blocks, theme),
      },
    ],
  })

  onProgress?.({ status: 'saving', message: 'Preparing download…', percent: 90 })

  const blob = await Packer.toBlob(doc)
  const filename = buildFilename(settings.metadata.title, 'docx')

  onProgress?.({ status: 'success', message: 'DOCX ready.', percent: 100 })

  return { blob, filename }
}
