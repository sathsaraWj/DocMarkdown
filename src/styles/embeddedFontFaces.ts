// Same metric-compatible fonts used for PDF embedding (see
// services/pdf/fontMetrics.ts), declared here as @font-face rules so the
// Word converter's live preview measures/wraps text using the exact same
// font files as the exported PDF — not just a similar-looking system font.
// Vite resolves these `?url` imports to hashed static asset URLs; the
// browser only actually fetches a given woff2 file if a glyph from it is
// rendered, so listing all four styles up front costs nothing until used.
import carlitoNormal from '@fontsource/carlito/files/carlito-latin-400-normal.woff2?url'
import carlitoItalic from '@fontsource/carlito/files/carlito-latin-400-italic.woff2?url'
import carlitoBold from '@fontsource/carlito/files/carlito-latin-700-normal.woff2?url'
import carlitoBoldItalic from '@fontsource/carlito/files/carlito-latin-700-italic.woff2?url'
import caladeaNormal from '@fontsource/caladea/files/caladea-latin-400-normal.woff2?url'
import caladeaItalic from '@fontsource/caladea/files/caladea-latin-400-italic.woff2?url'
import caladeaBold from '@fontsource/caladea/files/caladea-latin-700-normal.woff2?url'
import caladeaBoldItalic from '@fontsource/caladea/files/caladea-latin-700-italic.woff2?url'
import arimoNormal from '@fontsource/arimo/files/arimo-latin-400-normal.woff2?url'
import arimoItalic from '@fontsource/arimo/files/arimo-latin-400-italic.woff2?url'
import arimoBold from '@fontsource/arimo/files/arimo-latin-700-normal.woff2?url'
import arimoBoldItalic from '@fontsource/arimo/files/arimo-latin-700-italic.woff2?url'
import tinosNormal from '@fontsource/tinos/files/tinos-latin-400-normal.woff2?url'
import tinosItalic from '@fontsource/tinos/files/tinos-latin-400-italic.woff2?url'
import tinosBold from '@fontsource/tinos/files/tinos-latin-700-normal.woff2?url'
import tinosBoldItalic from '@fontsource/tinos/files/tinos-latin-700-italic.woff2?url'
import cousineNormal from '@fontsource/cousine/files/cousine-latin-400-normal.woff2?url'
import cousineItalic from '@fontsource/cousine/files/cousine-latin-400-italic.woff2?url'
import cousineBold from '@fontsource/cousine/files/cousine-latin-700-normal.woff2?url'
import cousineBoldItalic from '@fontsource/cousine/files/cousine-latin-700-italic.woff2?url'

function fontFace(family: string, url: string, weight: number, style: 'normal' | 'italic'): string {
  return `@font-face { font-family: '${family}'; src: url('${url}') format('woff2'); font-weight: ${weight}; font-style: ${style}; font-display: swap; }`
}

export const EMBEDDED_FONT_FACES_CSS = [
  fontFace('Carlito', carlitoNormal, 400, 'normal'),
  fontFace('Carlito', carlitoItalic, 400, 'italic'),
  fontFace('Carlito', carlitoBold, 700, 'normal'),
  fontFace('Carlito', carlitoBoldItalic, 700, 'italic'),
  fontFace('Caladea', caladeaNormal, 400, 'normal'),
  fontFace('Caladea', caladeaItalic, 400, 'italic'),
  fontFace('Caladea', caladeaBold, 700, 'normal'),
  fontFace('Caladea', caladeaBoldItalic, 700, 'italic'),
  fontFace('Arimo', arimoNormal, 400, 'normal'),
  fontFace('Arimo', arimoItalic, 400, 'italic'),
  fontFace('Arimo', arimoBold, 700, 'normal'),
  fontFace('Arimo', arimoBoldItalic, 700, 'italic'),
  fontFace('Tinos', tinosNormal, 400, 'normal'),
  fontFace('Tinos', tinosItalic, 400, 'italic'),
  fontFace('Tinos', tinosBold, 700, 'normal'),
  fontFace('Tinos', tinosBoldItalic, 700, 'italic'),
  fontFace('Cousine', cousineNormal, 400, 'normal'),
  fontFace('Cousine', cousineItalic, 400, 'italic'),
  fontFace('Cousine', cousineBold, 700, 'normal'),
  fontFace('Cousine', cousineBoldItalic, 700, 'italic'),
].join('\n')
