import type { jsPDF } from 'jspdf'

import { EMBEDDED_FONTS, type EmbeddedFontId } from './fontMetrics'

/**
 * Registers all five metric-compatible font families (four styles each —
 * normal/bold/italic/bold-italic) into a jsPDF document's virtual file
 * system. The font data is dynamically imported so it stays in its own lazy
 * chunk (~1.2MB of base64) rather than bloating the initial app bundle —
 * it's only fetched when a PDF export actually runs.
 */
export async function registerEmbeddedFonts(doc: jsPDF): Promise<void> {
  const { EMBEDDED_FONT_DATA } = await import('./embeddedFonts.generated')

  for (const info of Object.values(EMBEDDED_FONTS)) {
    const styles = EMBEDDED_FONT_DATA[info.id]
    if (!styles) continue

    const add = (styleName: string, base64: string) => {
      const filename = `${info.pdfName}-${styleName}.ttf`
      doc.addFileToVFS(filename, base64)
      doc.addFont(filename, info.pdfName, styleName)
    }

    add('normal', styles.normal)
    add('bold', styles.bold)
    add('italic', styles.italic)
    add('bolditalic', styles.boldItalic)
  }
}

/** The jsPDF font name for a given embedded font id — see fontMetrics.ts for the id mapping. */
export function pdfFontNameFor(id: EmbeddedFontId): string {
  return EMBEDDED_FONTS[id].pdfName
}
