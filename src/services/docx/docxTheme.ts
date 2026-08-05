import { resolveTemplateColors } from '@/types/colors'
import type { DocumentSettings } from '@/types/settings'
import type { DocumentTemplate } from '@/types/template'
import type { FontFamilyId } from '@/types/typography'

/** Real, installed font names for docx (unlike the PDF path, Word can't embed fonts, so generic web-safe stacks map to their closest system equivalent). */
const FONT_MAP: Record<FontFamilyId, string> = {
  sans: 'Arial',
  serif: 'Times New Roman',
  mono: 'Courier New',
  system: 'Calibri',
}

export interface DocxTheme {
  bodyFont: string
  headingFont: string
  monoFont: string
  /** Half-points, as docx's TextRun `size` expects. */
  bodyFontSizeHalfPt: number
  headingScale: number
  /** docx line-spacing units (240 = single spacing). */
  lineSpacing: number
  /** Twips of space after a paragraph. */
  paragraphSpacingTwips: number
  codeFontSizeHalfPt: number
  accentColor: string
  headingColor: string
  bodyColor: string
  mutedColor: string
  borderColor: string
  codeBackground: string
  tableHeaderBackground: string
  headingWeight: number
  headingUppercase: boolean
  ruleAfterH1: boolean
  codeBlockBackgrounds: boolean
  styleLinksForPrint: boolean
  preserveChecklistSymbols: boolean
}

function stripHash(hex: string): string {
  return hex.replace('#', '').toUpperCase()
}

export function buildDocxTheme(settings: DocumentSettings, template: DocumentTemplate): DocxTheme {
  const { typography, content } = settings
  const style = resolveTemplateColors(template.style, settings.colors)
  const font = FONT_MAP[typography.fontFamily]

  return {
    bodyFont: font,
    headingFont: font,
    monoFont: 'Courier New',
    bodyFontSizeHalfPt: Math.round(typography.bodyFontSize * 2),
    headingScale: typography.headingScale,
    lineSpacing: Math.round(typography.lineHeight * 240),
    paragraphSpacingTwips: Math.round(typography.paragraphSpacing * typography.bodyFontSize * 20),
    codeFontSizeHalfPt: Math.round(typography.codeFontSize * 2),
    accentColor: stripHash(style.accentColor),
    headingColor: stripHash(style.headingColor),
    bodyColor: stripHash(style.bodyColor),
    mutedColor: stripHash(style.mutedColor),
    borderColor: stripHash(style.borderColor),
    codeBackground: stripHash(style.codeBackground),
    tableHeaderBackground: stripHash(style.tableHeaderBackground),
    headingWeight: style.headingWeight,
    headingUppercase: style.headingUppercase,
    ruleAfterH1: style.ruleAfterH1,
    codeBlockBackgrounds: content.codeBlockBackgrounds,
    styleLinksForPrint: content.styleLinksForPrint,
    preserveChecklistSymbols: content.preserveChecklistSymbols,
  }
}

/** Converts millimeters to twips (1/20 pt = 1/1440 inch), the unit docx uses for page size and margins. */
export function mmToTwips(mm: number): number {
  return Math.round(mm * 56.6929133858)
}
