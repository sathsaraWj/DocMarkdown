import katex from 'katex'

import { escapeHtml } from '@/utils/text'

const BLOCK_MATH = /\$\$([\s\S]+?)\$\$/g
/**
 * Inline math delimiters, using the same disambiguation heuristic Pandoc
 * uses: the opening $ must not be followed by whitespace, the closing $
 * must not be preceded by whitespace, and the closing $ must not be
 * immediately followed by a digit. Without these guards, prose like
 * "It costs $5 and $10" would have its two unrelated currency signs
 * incorrectly paired up and swallowed as a single math span.
 */
const INLINE_MATH = /\$(?!\s)([^\n$]+?)(?<!\s)\$(?!\d)/g
/** A run of only digits/punctuation/operators - almost certainly a price or a plain number, not LaTeX, so it is left as literal text rather than misrendered as math. */
const LOOKS_LIKE_PLAIN_NUMBER = /^[\d.,\s+\-*/()=<>%]*$/

/** Private Use Area code points used as token delimiters, guaranteed not to occur in real user-authored text. */
function makeToken(id: number): string {
  return `${String.fromCodePoint(0xe000)}${id}${String.fromCodePoint(0xe001)}`
}

function renderKatex(source: string, displayMode: boolean): string {
  try {
    return katex.renderToString(source, {
      throwOnError: false,
      displayMode,
      output: 'htmlAndMathml',
    })
  } catch {
    return `<code>${escapeHtml(source)}</code>`
  }
}

export interface MathExtractionResult {
  /** Markdown with math spans replaced by inert placeholder tokens, safe to hand to the Markdown parser. */
  content: string
  /** token -> already-rendered, sanitizer-safe KaTeX HTML. */
  blocks: Map<string, string>
}

/**
 * Extracts block math ($$...$$) and inline math ($...$) and renders each
 * with KaTeX up front, replacing them with inert placeholder tokens before
 * the Markdown parser ever sees the source - LaTeX is full of underscores,
 * asterisks, and backslashes that would otherwise be mangled by Markdown's
 * own emphasis/escaping rules. Mirrors services/markdown/footnotes.ts's
 * extract-before-parse, restore-after-parse pattern.
 */
export function extractMath(markdown: string): MathExtractionResult {
  const blocks = new Map<string, string>()
  let counter = 0

  const withBlockMath = markdown.replace(BLOCK_MATH, (_match, expr: string) => {
    const token = makeToken(counter++)
    blocks.set(token, renderKatex(expr.trim(), true))
    return token
  })

  const withInlineMath = withBlockMath.replace(INLINE_MATH, (match, expr: string) => {
    if (LOOKS_LIKE_PLAIN_NUMBER.test(expr)) return match
    const token = makeToken(counter++)
    blocks.set(token, renderKatex(expr.trim(), false))
    return token
  })

  return { content: withInlineMath, blocks }
}

/** Substitutes rendered KaTeX HTML back in for the placeholder tokens, after Markdown parsing has produced HTML. */
export function restoreMath(html: string, blocks: Map<string, string>): string {
  if (blocks.size === 0) return html
  let result = html
  for (const [token, rendered] of blocks) {
    result = result.split(token).join(rendered)
  }
  return result
}
