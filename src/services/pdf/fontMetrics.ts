/**
 * Metric-compatible, freely embeddable replacements for the fonts real Word
 * documents actually use. jsPDF's built-in core fonts (Helvetica/Times/
 * Courier) use Adobe's standard AFM metrics, which do not match Calibri,
 * Arial, Times New Roman, etc. — a major source of line-wrap and
 * page-count drift when converting a DOCX to PDF. These five font families
 * were specifically designed (by Google/Ascender and the LibreOffice
 * project) to be metrically identical to their Microsoft counterparts, so
 * text measured in one reflows the same as text measured in the other, even
 * though the glyph shapes differ slightly.
 */
export type EmbeddedFontId = 'carlito' | 'caladea' | 'arimo' | 'tinos' | 'cousine'

export interface EmbeddedFontInfo {
  id: EmbeddedFontId
  /** The real Word/Office font this is a metric-compatible substitute for. */
  substituteFor: string
  /** jsPDF font name registered via addFont — see embeddedFonts.ts. */
  pdfName: string
  /** CSS font-family name as declared by the @fontsource package, for the browser preview. */
  cssName: string
}

export const EMBEDDED_FONTS: Record<EmbeddedFontId, EmbeddedFontInfo> = {
  carlito: { id: 'carlito', substituteFor: 'Calibri', pdfName: 'Carlito', cssName: 'Carlito' },
  caladea: { id: 'caladea', substituteFor: 'Cambria', pdfName: 'Caladea', cssName: 'Caladea' },
  arimo: { id: 'arimo', substituteFor: 'Arial', pdfName: 'Arimo', cssName: 'Arimo' },
  tinos: { id: 'tinos', substituteFor: 'Times New Roman', pdfName: 'Tinos', cssName: 'Tinos' },
  cousine: { id: 'cousine', substituteFor: 'Courier New', pdfName: 'Cousine', cssName: 'Cousine' },
}

/**
 * Maps a DOCX-declared font name to the closest metric-compatible embedded
 * font. Word's newer default (Aptos) and other common substitutes (Georgia,
 * Verdana, Tahoma, Segoe UI, Candara, Corbel, Consolas, ...) don't have a
 * dedicated free metric clone, so they fall back to the closest available
 * family in the same broad category (humanist sans, transitional serif,
 * monospace) — an approximation, not an exact match, and disclosed as such.
 */
const FONT_NAME_MAP: Record<string, EmbeddedFontId> = {
  calibri: 'carlito',
  aptos: 'carlito',
  candara: 'carlito',
  corbel: 'carlito',
  'segoe ui': 'carlito',
  cambria: 'caladea',
  georgia: 'caladea',
  arial: 'arimo',
  'arial narrow': 'arimo',
  helvetica: 'arimo',
  verdana: 'arimo',
  tahoma: 'arimo',
  'trebuchet ms': 'arimo',
  'times new roman': 'tinos',
  times: 'tinos',
  garamond: 'tinos',
  'book antiqua': 'tinos',
  'courier new': 'cousine',
  courier: 'cousine',
  consolas: 'cousine',
  'lucida console': 'cousine',
}

const DEFAULT_FONT_ID: EmbeddedFontId = 'arimo'

export function mapDocxFontNameToEmbeddedId(fontName: string | null | undefined): EmbeddedFontId {
  if (!fontName) return DEFAULT_FONT_ID
  const normalized = fontName.trim().toLowerCase()
  return FONT_NAME_MAP[normalized] ?? DEFAULT_FONT_ID
}
