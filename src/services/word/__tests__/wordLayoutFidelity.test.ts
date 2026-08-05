import { readFileSync } from 'node:fs'
import path from 'node:path'
import { PDFDocument } from 'pdf-lib'
import { describe, expect, it } from 'vitest'

import { htmlToBlocks } from '@/services/pdf/htmlToBlocks'
import { exportWordDocumentToPdf } from '@/services/pdf/exportWordDocumentToPdf'
import { getWordPdfFontOverride } from '@/services/word/wordFontOverride'
import { parseDocx } from '@/services/word/parseDocx'
import { getTemplate } from '@/templates'
import { DEFAULT_DOCUMENT_SETTINGS } from '@/types/settings'
import { DEFAULT_WORD_IMAGE_OPTIONS, type WordConversionSettings } from '@/types/word'

const FIXTURES_DIR = path.resolve(__dirname, '../../../../e2e/fixtures')

function loadFixture(name: string): File {
  const bytes = readFileSync(path.join(FIXTURES_DIR, name))
  return new File([bytes], name)
}

/**
 * End-to-end structural regression coverage for Word-to-PDF layout fidelity.
 * True pixel-level comparison against Word's own rendering isn't practical
 * without Word itself (documented as a known limitation), so this asserts
 * the structural properties that are meant to be preserved: page geometry
 * detected from the source docx, heading/table/image counts surviving the
 * conversion, explicit page breaks actually splitting pages, and the
 * exported PDF being valid and non-empty. Run this after any change to the
 * DOCX parsing or PDF layout pipeline to catch fidelity regressions.
 */
describe('Word-to-PDF layout fidelity (multi-page.docx fixture)', () => {
  it('detects the source document\'s exact page size and margins', async () => {
    const result = await parseDocx(loadFixture('multi-page.docx'))
    expect(result.layoutHints?.page).toEqual({
      size: 'Letter',
      orientation: 'portrait',
      margins: { top: 25.4, right: 31.7, bottom: 25.4, left: 31.7 },
    })
  })

  it('detects the source document\'s dominant font and size', async () => {
    const result = await parseDocx(loadFixture('multi-page.docx'))
    expect(result.layoutHints?.font).toEqual({ fontId: 'carlito', sourceName: 'Calibri', sizePt: 11 })
  })

  it('preserves heading, table, and image counts through the block model', async () => {
    const result = await parseDocx(loadFixture('multi-page.docx'))
    const blocks = htmlToBlocks(result.html)

    const headingCount = blocks.filter((b) => b.type === 'heading').length
    const tableCount = blocks.filter((b) => b.type === 'table').length
    const imageCount = blocks.filter((b) => b.type === 'image').length
    const pageBreakCount = blocks.filter((b) => b.type === 'page-break').length

    expect(headingCount).toBe(4) // title + Section One/Two/Three
    expect(tableCount).toBe(1)
    expect(imageCount).toBe(1)
    expect(pageBreakCount).toBe(1)
  })

  it(
    'respects the explicit page break when exported, producing a valid multi-page PDF',
    async () => {
      const parsed = await parseDocx(loadFixture('multi-page.docx'))

      const settings: WordConversionSettings = {
        document: {
          ...DEFAULT_DOCUMENT_SETTINGS,
          page: parsed.layoutHints?.page
            ? {
                size: parsed.layoutHints.page.size,
                orientation: parsed.layoutHints.page.orientation,
                marginPreset: 'custom',
                margins: parsed.layoutHints.page.margins,
              }
            : DEFAULT_DOCUMENT_SETTINGS.page,
        },
        normalizeStyling: false,
        images: DEFAULT_WORD_IMAGE_OPTIONS,
        detectedFont: parsed.layoutHints?.font?.fontId ?? null,
      }

      const template = getTemplate(settings.document.templateId)
      const fontOverride = getWordPdfFontOverride(settings)

      const { blob } = await exportWordDocumentToPdf({
        html: parsed.html,
        images: settings.images,
        settings: settings.document,
        template,
        fontOverride,
      })

      expect(blob.size).toBeGreaterThan(0)
      const bytes = new Uint8Array(await blob.arrayBuffer())
      const pdf = await PDFDocument.load(bytes)

      // The explicit page break must have actually split the document — at
      // least 2 pages, since "Section Two" onward is forced onto a new page.
      expect(pdf.getPageCount()).toBeGreaterThanOrEqual(2)

      // The detected Letter page size must have been honored (points, not mm
      // — pdf-lib reports page size in PDF points: 1pt = 1/72in).
      const firstPage = pdf.getPage(0)
      const { width, height } = firstPage.getSize()
      expect(Math.round(width)).toBe(Math.round(8.5 * 72))
      expect(Math.round(height)).toBe(Math.round(11 * 72))
    },
    15_000,
  )
})
