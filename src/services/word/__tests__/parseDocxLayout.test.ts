import JSZip from 'jszip'
import { describe, expect, it } from 'vitest'

import { extractDocxLayoutHints } from '@/services/word/parseDocxLayout'

const DOCUMENT_XML_TEMPLATE = (sectPr: string) => `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
  <w:body>
    <w:p><w:r><w:t>Hello world</w:t></w:r></w:p>
    ${sectPr}
  </w:body>
</w:document>`

const LETTER_SECT_PR = `<w:sectPr>
  <w:pgSz w:w="12240" w:h="15840"/>
  <w:pgMar w:top="1440" w:right="1800" w:bottom="1440" w:left="1800" w:header="720" w:footer="720"/>
</w:sectPr>`

const LANDSCAPE_A4_SECT_PR = `<w:sectPr>
  <w:pgSz w:w="16838" w:h="11906" w:orient="landscape"/>
  <w:pgMar w:top="720" w:right="720" w:bottom="720" w:left="720"/>
</w:sectPr>`

function stylesXml({
  normalFont,
  normalSizeHalfPoints,
  defaultFont,
}: {
  normalFont?: string
  normalSizeHalfPoints?: number
  defaultFont?: string
}) {
  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:styles xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
  <w:docDefaults>
    <w:rPrDefault>
      <w:rPr>
        ${defaultFont ? `<w:rFonts w:ascii="${defaultFont}" w:hAnsi="${defaultFont}"/>` : ''}
        <w:sz w:val="22"/>
      </w:rPr>
    </w:rPrDefault>
  </w:docDefaults>
  <w:style w:type="paragraph" w:default="1" w:styleId="Normal">
    <w:name w:val="Normal"/>
    <w:rPr>
      ${normalFont ? `<w:rFonts w:ascii="${normalFont}" w:hAnsi="${normalFont}"/>` : ''}
      ${normalSizeHalfPoints ? `<w:sz w:val="${normalSizeHalfPoints}"/>` : ''}
    </w:rPr>
  </w:style>
</w:styles>`
}

async function buildDocxBuffer(documentXml: string, stylesXmlContent: string): Promise<ArrayBuffer> {
  const zip = new JSZip()
  zip.file('word/document.xml', documentXml)
  zip.file('word/styles.xml', stylesXmlContent)
  const bytes = await zip.generateAsync({ type: 'uint8array' })
  return bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength) as ArrayBuffer
}

describe('extractDocxLayoutHints', () => {
  it('extracts Letter page size and exact margins from pgSz/pgMar', async () => {
    const buffer = await buildDocxBuffer(
      DOCUMENT_XML_TEMPLATE(LETTER_SECT_PR),
      stylesXml({ normalFont: 'Arial', normalSizeHalfPoints: 24 }),
    )
    const hints = await extractDocxLayoutHints(buffer)

    expect(hints?.page).toEqual({
      size: 'Letter',
      orientation: 'portrait',
      margins: { top: 25.4, right: 31.7, bottom: 25.4, left: 31.7 },
    })
  })

  it('extracts a landscape A4 page and detects the orientation', async () => {
    const buffer = await buildDocxBuffer(
      DOCUMENT_XML_TEMPLATE(LANDSCAPE_A4_SECT_PR),
      stylesXml({ normalFont: 'Calibri', normalSizeHalfPoints: 22 }),
    )
    const hints = await extractDocxLayoutHints(buffer)

    expect(hints?.page?.size).toBe('A4')
    expect(hints?.page?.orientation).toBe('landscape')
  })

  it('extracts the dominant font and size from the Normal style', async () => {
    const buffer = await buildDocxBuffer(
      DOCUMENT_XML_TEMPLATE(LETTER_SECT_PR),
      stylesXml({ normalFont: 'Arial', normalSizeHalfPoints: 24 }),
    )
    const hints = await extractDocxLayoutHints(buffer)

    expect(hints?.font).toEqual({ fontId: 'arimo', sourceName: 'Arial', sizePt: 12 })
  })

  it('falls back to docDefaults when the Normal style has no font of its own', async () => {
    const buffer = await buildDocxBuffer(
      DOCUMENT_XML_TEMPLATE(LETTER_SECT_PR),
      stylesXml({ defaultFont: 'Calibri' }),
    )
    const hints = await extractDocxLayoutHints(buffer)

    expect(hints?.font?.fontId).toBe('carlito')
    expect(hints?.font?.sourceName).toBe('Calibri')
  })

  it('returns null when the page size does not resemble any standard preset', async () => {
    const weirdSectPr = `<w:sectPr><w:pgSz w:w="3000" w:h="3000"/></w:sectPr>`
    const buffer = await buildDocxBuffer(
      DOCUMENT_XML_TEMPLATE(weirdSectPr),
      stylesXml({ normalFont: 'Arial', normalSizeHalfPoints: 24 }),
    )
    const hints = await extractDocxLayoutHints(buffer)
    expect(hints?.page).toBeNull()
  })

  it('never throws and returns null for a completely invalid archive', async () => {
    const garbage = new TextEncoder().encode('not a zip file at all').buffer
    await expect(extractDocxLayoutHints(garbage as ArrayBuffer)).resolves.toBeNull()
  })

  it('returns null when neither document.xml nor styles.xml contain usable hints', async () => {
    const buffer = await buildDocxBuffer(
      `<?xml version="1.0"?><w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"><w:body><w:p/></w:body></w:document>`,
      `<?xml version="1.0"?><w:styles xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"/>`,
    )
    const hints = await extractDocxLayoutHints(buffer)
    expect(hints).toBeNull()
  })
})
