import type { TemplateStyle } from './template'

export type ColorOverrideKey =
  | 'accentColor'
  | 'headingColor'
  | 'bodyColor'
  | 'mutedColor'
  | 'borderColor'
  | 'codeBackground'
  | 'tableHeaderBackground'

export type ColorOverrides = Partial<Record<ColorOverrideKey, string>>

export const COLOR_OVERRIDE_FIELDS: { key: ColorOverrideKey; label: string }[] = [
  { key: 'accentColor', label: 'Accent' },
  { key: 'headingColor', label: 'Headings' },
  { key: 'bodyColor', label: 'Body text' },
  { key: 'mutedColor', label: 'Muted text' },
  { key: 'borderColor', label: 'Borders' },
  { key: 'codeBackground', label: 'Code background' },
  { key: 'tableHeaderBackground', label: 'Table header' },
]

/**
 * Merges a template's fixed palette with the document's custom color
 * overrides, overrides taking priority. Shared by the live preview, HTML
 * export, PDF export, and DOCX export so all four always render identical
 * colors regardless of which pipeline produced them.
 */
export function resolveTemplateColors(
  style: TemplateStyle,
  overrides: ColorOverrides | undefined,
): TemplateStyle {
  if (!overrides) return style
  return {
    ...style,
    accentColor: overrides.accentColor ?? style.accentColor,
    headingColor: overrides.headingColor ?? style.headingColor,
    bodyColor: overrides.bodyColor ?? style.bodyColor,
    mutedColor: overrides.mutedColor ?? style.mutedColor,
    borderColor: overrides.borderColor ?? style.borderColor,
    codeBackground: overrides.codeBackground ?? style.codeBackground,
    tableHeaderBackground: overrides.tableHeaderBackground ?? style.tableHeaderBackground,
  }
}
