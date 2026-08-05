const FENCE_RE = /^(```|~~~)/
/** A line whose entire content is 3+ repetitions of the same thematic-break character (with optional spacing) - e.g. "***", "- - -". Left untouched so bullet normalization never mistakes it for a list item. */
const THEMATIC_BREAK_RE = /^\s*([*_-])(?:\s*\1){2,}\s*$/

function makeToken(id: number): string {
  return `${String.fromCodePoint(0xe000)}CODE${id}${String.fromCodePoint(0xe001)}`
}

/** Extracts fenced code blocks (``` or ~~~) into placeholder tokens so beautification rules never alter code content, mirroring the extract-before-parse pattern used by footnotes.ts/math.ts. */
function extractCodeFences(source: string): { content: string; blocks: Map<string, string> } {
  const lines = source.split('\n')
  const output: string[] = []
  const blocks = new Map<string, string>()
  let counter = 0
  let fenceMarker: string | null = null
  let currentBlock: string[] = []

  for (const line of lines) {
    const trimmed = line.trim()
    if (fenceMarker === null) {
      const match = FENCE_RE.exec(trimmed)
      if (match) {
        fenceMarker = match[1] ?? null
        currentBlock = [line]
        continue
      }
      output.push(line)
      continue
    }

    currentBlock.push(line)
    if (fenceMarker && trimmed.startsWith(fenceMarker)) {
      const token = makeToken(counter++)
      blocks.set(token, currentBlock.join('\n'))
      output.push(token)
      fenceMarker = null
      currentBlock = []
    }
  }

  // An unterminated fence still needs to survive unchanged rather than be lost.
  if (fenceMarker !== null && currentBlock.length > 0) {
    const token = makeToken(counter++)
    blocks.set(token, currentBlock.join('\n'))
    output.push(token)
  }

  return { content: output.join('\n'), blocks }
}

function restoreCodeFences(content: string, blocks: Map<string, string>): string {
  let result = content
  for (const [token, block] of blocks) {
    result = result.split(token).join(block)
  }
  return result
}

function normalizeHeadingSpacing(line: string): string {
  // Only touches lines that already have a space after the hashes - a
  // heading with NO space (e.g. "#hashtag") isn't a heading at all per
  // CommonMark, and inserting one would silently turn plain text into a
  // heading, which is a content change, not a formatting fix.
  const match = /^(#{1,6})[ \t]+(\S.*)$/.exec(line)
  if (!match) return line
  return `${match[1]} ${match[2]}`
}

function normalizeBullet(line: string): string {
  if (THEMATIC_BREAK_RE.test(line)) return line
  // "**bold**" can't match here: the character class consumes a single
  // */+ then requires whitespace, and a second "*" immediately after isn't whitespace.
  return line.replace(/^(\s*)[*+](\s+)(?!\s)/, '$1-$2')
}

/**
 * Cleans up common Markdown formatting inconsistencies without altering
 * meaning: trims trailing whitespace, collapses excess blank lines, ensures
 * a blank line around headings, normalizes heading and bullet spacing, and
 * ensures the document ends with exactly one trailing newline. Content
 * inside fenced code blocks is never touched.
 */
export function beautifyMarkdown(source: string): string {
  const normalizedLineEndings = source.replace(/\r\n?/g, '\n')
  const { content, blocks } = extractCodeFences(normalizedLineEndings)

  const trimmedLines = content.split('\n').map((line) => line.replace(/[ \t]+$/, ''))
  const spacedLines = trimmedLines.map((line) => normalizeBullet(normalizeHeadingSpacing(line)))

  const withHeadingBlankLines: string[] = []
  spacedLines.forEach((line, index) => {
    const isHeading = /^#{1,6}\s/.test(line)
    const previous = withHeadingBlankLines[withHeadingBlankLines.length - 1]
    if (isHeading && withHeadingBlankLines.length > 0 && previous !== '') {
      withHeadingBlankLines.push('')
    }
    withHeadingBlankLines.push(line)
    const next = spacedLines[index + 1]
    if (isHeading && next !== undefined && next !== '') {
      withHeadingBlankLines.push('')
    }
  })

  let joined = withHeadingBlankLines.join('\n')
  joined = joined.replace(/\n{3,}/g, '\n\n')
  joined = joined.replace(/^\n+/, '')
  joined = joined.replace(/\n*$/, '\n')

  return restoreCodeFences(joined, blocks)
}
