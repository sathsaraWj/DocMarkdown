import { jsPDF } from 'jspdf'
import { describe, expect, it } from 'vitest'

import { plainRun } from '@/services/pdf/blocks'
import { registerEmbeddedFonts } from '@/services/pdf/embeddedFonts'
import { PdfWriter, type PageBox, type PdfTheme } from '@/services/pdf/pdfWriter'

const THEME: PdfTheme = {
  bodyFont: 'Arimo',
  headingFont: 'Arimo',
  monoFont: 'Cousine',
  bodyFontSize: 11,
  headingScale: 1.25,
  lineHeight: 1.5,
  paragraphSpacingMm: 4,
  codeFontSize: 9.5,
  accentColor: [30, 64, 175],
  headingColor: [17, 24, 39],
  bodyColor: [17, 24, 39],
  mutedColor: [107, 114, 128],
  borderColor: [209, 213, 219],
  codeBackground: [243, 244, 246],
  tableHeaderBackground: [243, 244, 246],
  codeBlockBackgrounds: true,
  styleLinksForPrint: true,
  preserveChecklistSymbols: true,
}

const PAGE: PageBox = {
  width: 210,
  height: 297,
  orientation: 'p',
  marginTop: 25,
  marginRight: 20,
  marginBottom: 25,
  marginLeft: 20,
}

async function makeWriter(): Promise<{ doc: jsPDF; writer: PdfWriter }> {
  const doc = new jsPDF({ unit: 'mm', format: [PAGE.width, PAGE.height] })
  await registerEmbeddedFonts(doc)
  return { doc, writer: new PdfWriter(doc, THEME, PAGE) }
}

describe('PdfWriter explicit page breaks', () => {
  it('starts a new page when a page-break block is drawn', async () => {
    const { doc, writer } = await makeWriter()
    writer.drawBlocks([
      { type: 'paragraph', runs: [plainRun('Page one content')] },
      { type: 'page-break' },
      { type: 'paragraph', runs: [plainRun('Page two content')] },
    ])
    expect(doc.getNumberOfPages()).toBe(2)
  })

  it('does not add an extra page for content that already fits on one page', async () => {
    const { doc, writer } = await makeWriter()
    writer.drawBlocks([{ type: 'paragraph', runs: [plainRun('Just one short paragraph.')] }])
    expect(doc.getNumberOfPages()).toBe(1)
  })
})

describe('PdfWriter heading-orphan protection', () => {
  it('pushes a heading to a fresh page when only a sliver of space remains', async () => {
    const { doc, writer } = await makeWriter()

    // Contrive the cursor to sit just above the bottom margin — room for a
    // heading's own text, but not for a followup line of body text too.
    writer.cursorY = PAGE.height - PAGE.marginBottom - 2

    writer.drawBlocks([
      { type: 'heading', level: 2, runs: [plainRun('A heading near the bottom')], id: 'h' },
      { type: 'paragraph', runs: [plainRun('Body text right after the heading.')] },
    ])

    expect(doc.getNumberOfPages()).toBe(2)
    // The heading must land well above where we contrived the cursor to be
    // on the (now abandoned) first page, proving it moved to a fresh page
    // rather than being drawn right at the bottom margin.
    expect(writer.cursorY).toBeLessThan(PAGE.height - PAGE.marginBottom - 100)
  })

  it('draws the heading in place when there is already room for it and a following line', async () => {
    const { doc, writer } = await makeWriter()
    writer.cursorY = PAGE.marginTop + 10

    writer.drawBlocks([
      { type: 'heading', level: 2, runs: [plainRun('A heading with plenty of room')], id: 'h' },
      { type: 'paragraph', runs: [plainRun('Body text right after the heading.')] },
    ])

    expect(doc.getNumberOfPages()).toBe(1)
  })

  it('never inserts a blank page before the very first heading of a document', async () => {
    const { doc, writer } = await makeWriter()
    writer.drawBlocks([{ type: 'heading', level: 1, runs: [plainRun('Title')], id: 'title' }])
    expect(doc.getNumberOfPages()).toBe(1)
  })
})
