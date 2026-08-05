export type FontFamilyId = 'sans' | 'serif' | 'mono' | 'system'

export interface FontFamilyOption {
  id: FontFamilyId
  label: string
  bodyStack: string
  headingStack: string
}

/**
 * Bundled/web-safe stacks only — no remote font loading, so exports render
 * identically without a network connection.
 */
export const FONT_FAMILY_OPTIONS: FontFamilyOption[] = [
  {
    id: 'sans',
    label: 'Sans-serif (Inter / system)',
    bodyStack:
      "'Inter', ui-sans-serif, system-ui, -apple-system, 'Segoe UI', Roboto, Arial, sans-serif",
    headingStack:
      "'Inter', ui-sans-serif, system-ui, -apple-system, 'Segoe UI', Roboto, Arial, sans-serif",
  },
  {
    id: 'serif',
    label: 'Serif (Source Serif / Georgia)',
    bodyStack: "'Source Serif 4', ui-serif, Georgia, 'Times New Roman', serif",
    headingStack: "'Source Serif 4', ui-serif, Georgia, 'Times New Roman', serif",
  },
  {
    id: 'mono',
    label: 'Monospace (JetBrains Mono)',
    bodyStack: "'JetBrains Mono', ui-monospace, 'Cascadia Code', Menlo, Consolas, monospace",
    headingStack: "'JetBrains Mono', ui-monospace, 'Cascadia Code', Menlo, Consolas, monospace",
  },
  {
    id: 'system',
    label: 'System default',
    bodyStack: 'system-ui, -apple-system, "Segoe UI", Roboto, Arial, sans-serif',
    headingStack: 'system-ui, -apple-system, "Segoe UI", Roboto, Arial, sans-serif',
  },
]

export interface TypographySettings {
  fontFamily: FontFamilyId
  bodyFontSize: number
  headingScale: number
  lineHeight: number
  paragraphSpacing: number
  codeFontSize: number
}

export const DEFAULT_TYPOGRAPHY: TypographySettings = {
  fontFamily: 'sans',
  bodyFontSize: 11,
  headingScale: 1.25,
  lineHeight: 1.6,
  paragraphSpacing: 0.75,
  codeFontSize: 9.5,
}

export const TYPOGRAPHY_LIMITS = {
  bodyFontSize: { min: 8, max: 18 },
  headingScale: { min: 1.05, max: 1.6 },
  lineHeight: { min: 1.1, max: 2.2 },
  paragraphSpacing: { min: 0, max: 2.5 },
  codeFontSize: { min: 7, max: 16 },
} as const
