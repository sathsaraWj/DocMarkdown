import { htmlToBlocks } from '@/services/pdf/htmlToBlocks'
import type { ContentBlock, TextRun } from '@/services/pdf/blocks'

function runsToText(runs: TextRun[]): string {
  return runs.map((run) => run.text).join('')
}

function blockToLines(block: ContentBlock, depth = 0): string[] {
  switch (block.type) {
    case 'heading':
    case 'paragraph':
      return [runsToText(block.runs), '']
    case 'blockquote': {
      const inner = block.blocks.flatMap((child) => blockToLines(child)).join('\n').trim()
      return [...inner.split('\n').map((line) => (line ? `> ${line}` : '>')), '']
    }
    case 'code':
      return [...block.lines, '']
    case 'list': {
      const lines: string[] = []
      block.items.forEach((item, index) => {
        const marker = item.task
          ? `[${item.checked ? 'x' : ' '}]`
          : block.ordered
            ? `${block.start + index}.`
            : '-'
        const indent = '  '.repeat(depth)
        lines.push(`${indent}${marker} ${runsToText(item.runs)}`)
        for (const child of item.children) lines.push(...blockToLines(child, depth + 1))
      })
      lines.push('')
      return lines
    }
    case 'table': {
      const lines: string[] = []
      lines.push(block.header.map(runsToText).join(' | '))
      lines.push(block.header.map(() => '---').join(' | '))
      for (const row of block.rows) lines.push(row.map(runsToText).join(' | '))
      lines.push('')
      return lines
    }
    case 'hr':
      return ['---', '']
    case 'image':
      return [`[Image: ${block.alt || 'untitled'}]`, '']
    case 'page-break':
      return ['']
  }
}

/**
 * Extracts readable plain text from sanitized Word-derived HTML. Reuses the
 * same HTML-to-block-model walker as the PDF export pipeline
 * (services/pdf/htmlToBlocks.ts) rather than a second bespoke parser.
 */
export function wordHtmlToPlainText(html: string): string {
  if (!html.trim()) return ''
  const blocks = htmlToBlocks(html)
  const text = blocks.flatMap((block) => blockToLines(block)).join('\n')
  return `${text.replace(/\n{3,}/g, '\n\n').trim()}\n`
}
