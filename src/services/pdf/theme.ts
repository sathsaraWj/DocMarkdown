import { hexToRgb } from '@/utils/color'
import type { DocumentSettings } from '@/types/settings'
import type { DocumentTemplate } from '@/types/template'
import type { FontFamilyId } from '@/types/typography'
import type { PdfFontFamily, PdfTheme } from './pdfWriter'

const FONT_MAP: Record<FontFamilyId, PdfFontFamily> = {
  sans: 'helvetica',
  serif: 'times',
  mono: 'courier',
  system: 'helvetica',
}

export function buildPdfTheme(settings: DocumentSettings, template: DocumentTemplate): PdfTheme {
  const { typography, content } = settings
  const font = FONT_MAP[typography.fontFamily]

  return {
    bodyFont: font,
    headingFont: font,
    monoFont: 'courier',
    bodyFontSize: typography.bodyFontSize,
    headingScale: typography.headingScale,
    lineHeight: typography.lineHeight,
    paragraphSpacingMm: typography.paragraphSpacing * 5,
    codeFontSize: typography.codeFontSize,
    accentColor: hexToRgb(template.style.accentColor),
    headingColor: hexToRgb(template.style.headingColor),
    bodyColor: hexToRgb(template.style.bodyColor),
    mutedColor: hexToRgb(template.style.mutedColor),
    borderColor: hexToRgb(template.style.borderColor),
    codeBackground: hexToRgb(template.style.codeBackground),
    tableHeaderBackground: hexToRgb(template.style.tableHeaderBackground),
    codeBlockBackgrounds: content.codeBlockBackgrounds,
    styleLinksForPrint: content.styleLinksForPrint,
    preserveChecklistSymbols: content.preserveChecklistSymbols,
  }
}
