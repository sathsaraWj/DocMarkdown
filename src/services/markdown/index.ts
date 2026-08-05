import { escapeHtml } from '@/utils/text'
import { extractFootnotes, renderFootnotesSection } from './footnotes'
import { renderMarkdownToHtml, type TocItem } from './parser'
import { sanitizeHtml } from './sanitize'

export type { TocItem } from './parser'
export { markdownToPlainText } from './plainText'
export { sanitizeHtml } from './sanitize'

export interface RenderMarkdownOptions {
  headingNumbering?: boolean
  generateToc?: boolean
}

export interface RenderMarkdownResult {
  html: string
  toc: TocItem[]
}

function renderFootnoteInline(text: string): string {
  try {
    // Footnote bodies are short inline snippets; parse them as inline markdown
    // and drop the wrapping <p> the block renderer always produces.
    return renderMarkdownToHtml(text).html.replace(/^<p>([\s\S]*)<\/p>\s*$/, '$1')
  } catch {
    return escapeHtml(text)
  }
}

/**
 * Full markdown-to-safe-HTML pipeline: footnote preprocessing, marked
 * rendering (headings/TOC/numbering/highlighting), then DOMPurify
 * sanitization. This is the single entry point the preview and every export
 * format should use so behavior never diverges between them.
 */
export function renderMarkdown(
  source: string,
  options: RenderMarkdownOptions = {},
): RenderMarkdownResult {
  const { content, definitions } = extractFootnotes(source)
  const { html, toc } = renderMarkdownToHtml(content, {
    headingNumbering: options.headingNumbering,
  })
  const footnotesHtml = renderFootnotesSection(definitions, renderFootnoteInline)
  const combined = footnotesHtml ? `${html}${footnotesHtml}` : html
  return {
    html: sanitizeHtml(combined),
    toc: options.generateToc === false ? [] : toc,
  }
}
