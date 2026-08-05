import { renderMarkdown } from '@/services/markdown'
import type { DocumentSettings } from '@/types/settings'
import type { DocumentTemplate } from '@/types/template'
import { buildContentCss } from '@/styles/documentContentCss'
import { escapeHtml } from '@/utils/text'
import { buildFilename } from '@/utils/filename'
import { buildPrintPageCss } from './printPageCss'

export interface HtmlExportResult {
  html: string
  filename: string
}

function buildTocMarkup(toc: { id: string; text: string; depth: number }[]): string {
  if (toc.length === 0) return ''
  const items = toc
    .map(
      (item) =>
        `<li style="margin-left:${(item.depth - 1) * 1}em"><a href="#${item.id}">${escapeHtml(item.text)}</a></li>`,
    )
    .join('\n')
  return `<nav class="doc-toc" aria-label="Table of contents"><h2>Contents</h2><ul>${items}</ul></nav>`
}

function buildMetaHeader(settings: DocumentSettings): string {
  const { headerFooter, metadata } = settings
  if (!headerFooter.headerEnabled) return ''
  const parts: string[] = []
  if (headerFooter.headerText) parts.push(escapeHtml(headerFooter.headerText))
  if (headerFooter.showDocTitle) parts.push(escapeHtml(metadata.title))
  if (headerFooter.showExportDate) parts.push(new Date().toLocaleDateString())
  if (parts.length === 0) return ''
  return `<header class="doc-meta-bar">${parts.join(' &middot; ')}</header>`
}

function buildMetaFooter(settings: DocumentSettings): string {
  const { headerFooter, metadata } = settings
  if (!headerFooter.footerEnabled) return ''
  const parts: string[] = []
  if (headerFooter.footerText) parts.push(escapeHtml(headerFooter.footerText))
  if (headerFooter.showDocTitle) parts.push(escapeHtml(metadata.title))
  if (headerFooter.showExportDate) parts.push(new Date().toLocaleDateString())
  if (parts.length === 0) return ''
  return `<footer class="doc-meta-bar">${parts.join(' &middot; ')}</footer>`
}

/**
 * Builds a fully self-contained HTML file: sanitized content, embedded CSS,
 * and no script or external dependency of any kind.
 */
export function buildStandaloneHtml(
  markdown: string,
  settings: DocumentSettings,
  template: DocumentTemplate,
): HtmlExportResult {
  const { html, toc } = renderMarkdown(markdown, {
    headingNumbering: settings.content.headingNumbering,
    generateToc: settings.content.generateToc,
  })

  const title = settings.metadata.title || 'Untitled Document'
  const description = settings.metadata.subject || 'Document exported from DocMarkdown'
  const contentCss = buildContentCss(settings, template)
  const printCss = buildPrintPageCss(settings.page)

  const document = `<!doctype html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>${escapeHtml(title)}</title>
<meta name="description" content="${escapeHtml(description)}" />
${settings.metadata.author ? `<meta name="author" content="${escapeHtml(settings.metadata.author)}" />` : ''}
${settings.metadata.keywords ? `<meta name="keywords" content="${escapeHtml(settings.metadata.keywords)}" />` : ''}
<style>
  :root { color-scheme: light; }
  * { box-sizing: border-box; }
  body {
    margin: 0;
    padding: 2.5rem 1rem;
    background: #f3f4f6;
    display: flex;
    justify-content: center;
  }
  .doc-page-frame {
    width: 100%;
    max-width: 850px;
    background: #fff;
    padding: 2.5rem 3rem;
    border-radius: 8px;
    box-shadow: 0 1px 3px rgba(0,0,0,0.1), 0 1px 2px rgba(0,0,0,0.06);
  }
  .doc-meta-bar {
    font-size: 0.8rem;
    color: #6b7280;
    padding-bottom: 0.75rem;
    margin-bottom: 1.5rem;
    border-bottom: 1px solid #e5e7eb;
  }
  .doc-toc {
    margin-bottom: 2rem;
    padding: 1rem 1.25rem;
    background: #f9fafb;
    border-radius: 6px;
    font-size: 0.9rem;
  }
  .doc-toc h2 { margin: 0 0 0.5rem; font-size: 1rem; }
  .doc-toc ul { list-style: none; margin: 0; padding: 0; }
  ${contentCss}
  ${printCss}
</style>
</head>
<body>
<div class="doc-page-frame">
${buildMetaHeader(settings)}
${buildTocMarkup(toc)}
<div class="doc-content">
${html}
</div>
${buildMetaFooter(settings)}
</div>
</body>
</html>
`

  return { html: document, filename: buildFilename(title, 'html') }
}
