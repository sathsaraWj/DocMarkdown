// Regenerates src/services/pdf/embeddedFonts.generated.ts — base64-encoded
// TrueType font data for jsPDF to embed directly into exported PDFs.
//
// Why: jsPDF's built-in "core" fonts (Helvetica/Times/Courier) use Adobe's
// standard AFM metrics, which do not match the metrics of the fonts Word
// documents actually use (Calibri, Arial, Times New Roman, ...). That
// mismatch is the single biggest cause of line-wrap and page-count drift
// between a DOCX and its exported PDF. The fonts below are free,
// metric-compatible replacements commissioned specifically to solve this
// problem (Carlito<->Calibri, Caladea<->Cambria, Arimo<->Arial,
// Tinos<->Times New Roman, Cousine<->Courier New), all OFL-1.1 licensed and
// safe to embed. See src/services/pdf/fontMetrics.ts for the DOCX font-name
// mapping and src/services/pdf/embeddedFonts.ts for how jsPDF loads them.
//
// @fontsource ships these as .woff2 (for the browser preview's @font-face);
// jsPDF's font parser only understands raw TrueType, so this script
// decompresses each .woff2 back to .ttf with wawoff2 (the reference converter)
// and inlines the result as base64. Run with:
//   node scripts/generate-embedded-pdf-fonts.mjs
import { writeFileSync } from 'node:fs'
import path from 'node:path'
import { decompress } from 'wawoff2'

const FONTS = [
  { id: 'carlito', pkg: '@fontsource/carlito', file: 'carlito' },
  { id: 'caladea', pkg: '@fontsource/caladea', file: 'caladea' },
  { id: 'arimo', pkg: '@fontsource/arimo', file: 'arimo' },
  { id: 'tinos', pkg: '@fontsource/tinos', file: 'tinos' },
  { id: 'cousine', pkg: '@fontsource/cousine', file: 'cousine' },
]

const STYLES = [
  { key: 'normal', weight: 400, style: 'normal' },
  { key: 'bold', weight: 700, style: 'normal' },
  { key: 'italic', weight: 400, style: 'italic' },
  { key: 'boldItalic', weight: 700, style: 'italic' },
]

const OUTPUT_PATH = path.resolve(
  import.meta.dirname,
  '../src/services/pdf/embeddedFonts.generated.ts',
)

async function loadTtfBase64(pkg, file, weight, style) {
  const woff2Path = path.resolve(
    import.meta.dirname,
    `../node_modules/${pkg}/files/${file}-latin-${weight}-${style}.woff2`,
  )
  const woff2 = await import('node:fs').then((fs) => fs.readFileSync(woff2Path))
  const ttf = await decompress(woff2)
  return Buffer.from(ttf).toString('base64')
}

async function main() {
  const entries = []

  for (const font of FONTS) {
    const styleEntries = []
    for (const s of STYLES) {
      const base64 = await loadTtfBase64(font.pkg, font.file, s.weight, s.style)
      styleEntries.push(`    ${s.key}: '${base64}',`)
    }
    entries.push(`  ${font.id}: {\n${styleEntries.join('\n')}\n  },`)
  }

  const output = `// GENERATED FILE — do not edit by hand.
// Regenerate with: node scripts/generate-embedded-pdf-fonts.mjs
// Source: @fontsource/{carlito,caladea,arimo,tinos,cousine} (OFL-1.1),
// converted from .woff2 to base64-encoded TrueType via wawoff2.

export interface EmbeddedFontStyles {
  normal: string
  bold: string
  italic: string
  boldItalic: string
}

export const EMBEDDED_FONT_DATA: Record<string, EmbeddedFontStyles> = {
${entries.join('\n')}
}
`

  writeFileSync(OUTPUT_PATH, output)
  console.log('Wrote', OUTPUT_PATH)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
