export interface PageRangeParseResult {
  ok: boolean
  pages: number[]
  error: string | null
}

const TOKEN_PATTERN = /^(\d+)(?:-(\d+))?$/

/**
 * Parses page-range syntax like "1-3,6,8-10" into a normalized, ascending,
 * deduplicated list of 1-based page numbers, validated against the
 * document's actual page count. Duplicate page numbers (whether from a
 * repeated single page or overlapping ranges) are treated as a validation
 * error rather than silently collapsed, so the user notices and fixes their
 * input instead of getting an unexpected page order.
 */
export function parsePageRange(input: string, totalPages: number): PageRangeParseResult {
  const trimmed = input.trim()
  if (!trimmed) {
    return { ok: false, pages: [], error: 'Enter a page range, or reset to All pages.' }
  }

  const tokens = trimmed
    .split(',')
    .map((token) => token.replace(/\s+/g, ''))
    .filter((token) => token.length > 0)

  if (tokens.length === 0) {
    return { ok: false, pages: [], error: 'Enter a page range, or reset to All pages.' }
  }

  const collected: number[] = []

  for (const token of tokens) {
    const match = TOKEN_PATTERN.exec(token)
    if (!match) {
      return {
        ok: false,
        pages: [],
        error: `"${token}" isn't a valid page or range. Use formats like "1-3", "6", or "8-10".`,
      }
    }

    const start = Number(match[1])
    const end = match[2] !== undefined ? Number(match[2]) : start

    if (start < 1 || end < 1) {
      return { ok: false, pages: [], error: 'Page numbers must be 1 or greater.' }
    }

    if (start > end) {
      return {
        ok: false,
        pages: [],
        error: `"${token}" is a reversed range — the start page must come before the end page.`,
      }
    }

    if (end > totalPages) {
      return {
        ok: false,
        pages: [],
        error: `Page ${end} is beyond this document's last page (${totalPages}).`,
      }
    }

    for (let page = start; page <= end; page += 1) collected.push(page)
  }

  const seen = new Set<number>()
  for (const page of collected) {
    if (seen.has(page)) {
      return { ok: false, pages: [], error: `Page ${page} is listed more than once.` }
    }
    seen.add(page)
  }

  return { ok: true, pages: [...collected].sort((a, b) => a - b), error: null }
}
