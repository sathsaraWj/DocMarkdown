import type { ContentFontOverride } from '@/styles/documentContentCss'
import { EMBEDDED_FONTS, type EmbeddedFontId } from '@/services/pdf/fontMetrics'
import type { PdfThemeFontOverride } from '@/services/pdf/theme'
import type { WordConversionSettings } from '@/types/word'

const GENERIC_FALLBACK: Record<EmbeddedFontId, string> = {
  carlito: 'sans-serif',
  arimo: 'sans-serif',
  caladea: 'serif',
  tinos: 'serif',
  cousine: 'monospace',
}

/** True when the detected source-document font should be used instead of the generic template font bucket. */
function isFontOverrideActive(settings: WordConversionSettings): boolean {
  return !settings.normalizeStyling && settings.detectedFont !== null
}

/** For the PDF export path — see services/pdf/theme.ts. */
export function getWordPdfFontOverride(settings: WordConversionSettings): PdfThemeFontOverride | undefined {
  if (!isFontOverrideActive(settings)) return undefined
  return { bodyFontId: settings.detectedFont as EmbeddedFontId }
}

/** For the live preview — see components/preview/DocumentPaper.tsx. */
export function getWordContentFontOverride(settings: WordConversionSettings): ContentFontOverride | undefined {
  if (!isFontOverrideActive(settings)) return undefined
  const id = settings.detectedFont as EmbeddedFontId
  const stack = `'${EMBEDDED_FONTS[id].cssName}', ${GENERIC_FALLBACK[id]}`
  return { body: stack, heading: stack }
}
