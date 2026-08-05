import { resolveTemplateColors } from '@/types/colors'
import { hexToRgb } from '@/utils/color'
import type { DocumentSettings } from '@/types/settings'
import type { DocumentTemplate } from '@/types/template'
import type { FontFamilyId } from '@/types/typography'
import { pdfFontNameFor } from './embeddedFonts'
import type { EmbeddedFontId } from './fontMetrics'
import type { PdfFontFamily, PdfTheme } from './pdfWriter'

/**
 * Maps DocMarkdown's four generic font buckets to the metric-compatible
 * embedded fonts (see fontMetrics.ts) rather than jsPDF's raw core fonts —
 * these are strictly closer substitutes for what "sans/serif/mono" mean in
 * a printed document (Arial/Times New Roman/Courier New) than jsPDF's
 * Helvetica/Times/Courier AFM metrics are, so this benefits the Markdown
 * converter's PDF export too, not just Word.
 */
const FONT_MAP: Record<FontFamilyId, PdfFontFamily> = {
  sans: 'Arimo',
  serif: 'Tinos',
  mono: 'Cousine',
  system: 'Arimo',
}

/**
 * Optional override used by the Word converter: when the source .docx's
 * dominant font is detected (see parseDocxLayout.ts) and the user hasn't
 * opted into "normalize styling," the detected font takes priority over the
 * generic sans/serif/mono/system bucket for body and heading text.
 */
export interface PdfThemeFontOverride {
  bodyFontId: EmbeddedFontId
  headingFontId?: EmbeddedFontId
}

export function buildPdfTheme(
  settings: DocumentSettings,
  template: DocumentTemplate,
  fontOverride?: PdfThemeFontOverride,
): PdfTheme {
  const { typography, content } = settings
  const style = resolveTemplateColors(template.style, settings.colors)
  const bucketFont = FONT_MAP[typography.fontFamily]
  const bodyFont = fontOverride ? pdfFontNameFor(fontOverride.bodyFontId) : bucketFont
  const headingFont = fontOverride?.headingFontId
    ? pdfFontNameFor(fontOverride.headingFontId)
    : bodyFont

  return {
    bodyFont: bodyFont as PdfFontFamily,
    headingFont: headingFont as PdfFontFamily,
    monoFont: 'Cousine',
    bodyFontSize: typography.bodyFontSize,
    headingScale: typography.headingScale,
    lineHeight: typography.lineHeight,
    paragraphSpacingMm: typography.paragraphSpacing * 5,
    codeFontSize: typography.codeFontSize,
    accentColor: hexToRgb(style.accentColor),
    headingColor: hexToRgb(style.headingColor),
    bodyColor: hexToRgb(style.bodyColor),
    mutedColor: hexToRgb(style.mutedColor),
    borderColor: hexToRgb(style.borderColor),
    codeBackground: hexToRgb(style.codeBackground),
    tableHeaderBackground: hexToRgb(style.tableHeaderBackground),
    codeBlockBackgrounds: content.codeBlockBackgrounds,
    styleLinksForPrint: content.styleLinksForPrint,
    preserveChecklistSymbols: content.preserveChecklistSymbols,
  }
}
