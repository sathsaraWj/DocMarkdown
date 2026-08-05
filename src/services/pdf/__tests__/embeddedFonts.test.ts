import { jsPDF } from 'jspdf'
import { describe, expect, it } from 'vitest'

import { EMBEDDED_FONT_DATA } from '@/services/pdf/embeddedFonts.generated'
import { registerEmbeddedFonts } from '@/services/pdf/embeddedFonts'
import { EMBEDDED_FONTS } from '@/services/pdf/fontMetrics'

function base64ToBytes(base64: string): Uint8Array {
  const binary = atob(base64)
  const bytes = new Uint8Array(binary.length)
  for (let i = 0; i < binary.length; i += 1) bytes[i] = binary.charCodeAt(i)
  return bytes
}

describe('embedded font data', () => {
  it('has all four styles present for every embedded font', () => {
    for (const id of Object.keys(EMBEDDED_FONTS)) {
      const styles = EMBEDDED_FONT_DATA[id]
      expect(styles, `missing font data for ${id}`).toBeDefined()
      expect(styles?.normal.length).toBeGreaterThan(1000)
      expect(styles?.bold.length).toBeGreaterThan(1000)
      expect(styles?.italic.length).toBeGreaterThan(1000)
      expect(styles?.boldItalic.length).toBeGreaterThan(1000)
    }
  })

  it('decodes to valid TrueType (sfnt) font data for every style', () => {
    for (const [id, styles] of Object.entries(EMBEDDED_FONT_DATA)) {
      for (const [styleName, base64] of Object.entries(styles)) {
        const bytes = base64ToBytes(base64)
        // TrueType sfnt version tag: 0x00010000
        expect(
          [bytes[0], bytes[1], bytes[2], bytes[3]],
          `${id} ${styleName} should start with the TrueType sfnt signature`,
        ).toEqual([0, 1, 0, 0])
      }
    }
  })
})

describe('registerEmbeddedFonts', () => {
  it('registers every font into a jsPDF document without throwing', async () => {
    const doc = new jsPDF()
    await expect(registerEmbeddedFonts(doc)).resolves.toBeUndefined()
  })

  it('makes the fonts usable for text measurement afterward', async () => {
    const doc = new jsPDF()
    await registerEmbeddedFonts(doc)
    doc.setFont('Carlito', 'normal')
    doc.setFontSize(11)
    const width = doc.getTextWidth('Lorem ipsum dolor sit amet')
    expect(width).toBeGreaterThan(0)
  })
})
