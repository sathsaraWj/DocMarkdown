import {
  type CellAlign,
  type ContentBlock,
  type ListItemBlock,
  type TextRun,
  plainRun,
} from './blocks'

interface RunStyle {
  bold: boolean
  italic: boolean
  strike: boolean
  code: boolean
  href: string | null
  superscript: boolean
}

const EMPTY_STYLE: RunStyle = {
  bold: false,
  italic: false,
  strike: false,
  code: false,
  href: null,
  superscript: false,
}

function collectRuns(node: Node, style: RunStyle, out: TextRun[]): void {
  if (node.nodeType === Node.TEXT_NODE) {
    const text = node.textContent ?? ''
    if (text.length > 0) out.push({ text, ...style })
    return
  }
  if (node.nodeType !== Node.ELEMENT_NODE) return

  const el = node as Element
  const tag = el.tagName.toLowerCase()

  if (tag === 'br') {
    out.push({ ...plainRun('\n'), ...style })
    return
  }
  if (tag === 'input') return
  if (tag === 'img') {
    const alt = el.getAttribute('alt') ?? 'image'
    out.push({ ...plainRun(`[Image: ${alt}]`), ...style, italic: true })
    return
  }

  const nextStyle: RunStyle = { ...style }
  if (tag === 'strong' || tag === 'b') nextStyle.bold = true
  if (tag === 'em' || tag === 'i') nextStyle.italic = true
  if (tag === 'del' || tag === 's') nextStyle.strike = true
  if (tag === 'code') nextStyle.code = true
  if (tag === 'sup') nextStyle.superscript = true
  if (tag === 'a') nextStyle.href = el.getAttribute('href')

  for (const child of Array.from(el.childNodes)) {
    collectRuns(child, nextStyle, out)
  }
}

function extractRuns(el: Element): TextRun[] {
  const runs: TextRun[] = []
  for (const child of Array.from(el.childNodes)) {
    collectRuns(child, EMPTY_STYLE, runs)
  }
  return runs
}

function isBlockLevel(el: Element): boolean {
  return ['UL', 'OL', 'BLOCKQUOTE', 'PRE', 'TABLE', 'HR', 'DIV', 'P'].includes(el.tagName)
}

function parseListItem(li: Element): ListItemBlock {
  const checkbox = li.querySelector(':scope > input[type="checkbox"]')
  const runs: TextRun[] = []
  const children: ContentBlock[] = []

  for (const node of Array.from(li.childNodes)) {
    if (node.nodeType === Node.ELEMENT_NODE) {
      const el = node as Element
      if (el.tagName === 'INPUT') continue
      if (el.tagName === 'UL' || el.tagName === 'OL') {
        children.push(parseList(el))
        continue
      }
      if (el.tagName === 'P') {
        runs.push(...extractRuns(el))
        continue
      }
      if (isBlockLevel(el)) {
        children.push(...parseChildren(el))
        continue
      }
    }
    collectRuns(node, EMPTY_STYLE, runs)
  }

  return {
    runs,
    task: checkbox !== null,
    checked: checkbox?.hasAttribute('checked') ?? false,
    children,
  }
}

function parseList(el: Element): ContentBlock {
  const ordered = el.tagName === 'OL'
  const start = ordered ? Number(el.getAttribute('start') ?? '1') || 1 : 1
  const items = Array.from(el.children)
    .filter((child) => child.tagName === 'LI')
    .map(parseListItem)
  return { type: 'list', ordered, start, items }
}

function parseTable(el: Element): ContentBlock {
  const rows = Array.from(el.querySelectorAll('tr'))
  const headerRow = el.querySelector('thead tr') ?? rows[0]
  const header: TextRun[][] = []
  const align: CellAlign[] = []

  if (headerRow) {
    for (const cell of Array.from(headerRow.children)) {
      header.push(extractRuns(cell))
      align.push((cell.getAttribute('align') as CellAlign) ?? null)
    }
  }

  const bodyRows = el.querySelector('tbody')
    ? Array.from(el.querySelectorAll('tbody tr'))
    : rows.slice(headerRow === rows[0] ? 1 : 0)

  const dataRows: TextRun[][][] = bodyRows.map((row) =>
    Array.from(row.children).map((cell) => extractRuns(cell)),
  )

  return { type: 'table', header, align, rows: dataRows }
}

/**
 * Returns the paragraph's sole element child (ignoring whitespace-only
 * text), if there's exactly one. Only meaningful for phrasing content like
 * `<img>` — a block-level element such as `<hr>` can never actually end up
 * nested inside a parsed `<p>` in the first place, since the HTML5 parsing
 * algorithm auto-closes an open `<p>` before it (see the top-level `HR`
 * handling in parseChildren, which is where a Word page break is actually
 * caught after that auto-close hoists it back out to be a sibling).
 */
function isImageOnlyParagraph(el: Element): Element | null {
  const children = Array.from(el.childNodes).filter(
    (n) => !(n.nodeType === Node.TEXT_NODE && !(n.textContent ?? '').trim()),
  )
  if (children.length === 1 && children[0]?.nodeType === Node.ELEMENT_NODE) {
    const only = children[0] as Element
    if (only.tagName === 'IMG') return only
  }
  return null
}

function parseChildren(container: Element): ContentBlock[] {
  const blocks: ContentBlock[] = []

  for (const el of Array.from(container.children)) {
    const tag = el.tagName

    if (/^H[1-6]$/.test(tag)) {
      const level = Number(tag[1]) as 1 | 2 | 3 | 4 | 5 | 6
      blocks.push({ type: 'heading', level, runs: extractRuns(el), id: el.id })
      continue
    }
    if (tag === 'P') {
      const image = isImageOnlyParagraph(el)
      if (image) {
        blocks.push({
          type: 'image',
          src: image.getAttribute('src') ?? '',
          alt: image.getAttribute('alt') ?? '',
        })
        continue
      }
      blocks.push({ type: 'paragraph', runs: extractRuns(el) })
      continue
    }
    if (tag === 'UL' || tag === 'OL') {
      blocks.push(parseList(el))
      continue
    }
    if (tag === 'BLOCKQUOTE') {
      blocks.push({ type: 'blockquote', blocks: parseChildren(el) })
      continue
    }
    if (tag === 'HR') {
      blocks.push(el.classList.contains('docx-page-break') ? { type: 'page-break' } : { type: 'hr' })
      continue
    }
    if (tag === 'TABLE') {
      blocks.push(parseTable(el))
      continue
    }
    if (tag === 'DIV' && el.classList.contains('code-block')) {
      const codeEl = el.querySelector('code')
      const language = el.querySelector('.code-block-lang')?.textContent?.trim() || null
      const text = codeEl?.textContent ?? ''
      blocks.push({ type: 'code', lines: text.replace(/\n$/, '').split('\n'), language })
      continue
    }
    if (tag === 'PRE') {
      const codeEl = el.querySelector('code')
      const text = codeEl?.textContent ?? el.textContent ?? ''
      blocks.push({ type: 'code', lines: text.replace(/\n$/, '').split('\n'), language: null })
      continue
    }
    if (tag === 'SECTION' && el.classList.contains('footnotes')) {
      blocks.push({ type: 'hr' })
      const heading = el.querySelector('h2')
      if (heading)
        blocks.push({ type: 'heading', level: 6, runs: extractRuns(heading), id: heading.id })
      const list = el.querySelector('ol')
      if (list) blocks.push(parseList(list))
      continue
    }
    // Unknown block-level container: recurse into its children.
    blocks.push(...parseChildren(el))
  }

  return blocks
}

/** Parses sanitized document HTML (already produced by the markdown service) into a flat block tree for PDF layout. */
export function htmlToBlocks(html: string): ContentBlock[] {
  const doc = new DOMParser().parseFromString(html, 'text/html')
  return parseChildren(doc.body)
}
