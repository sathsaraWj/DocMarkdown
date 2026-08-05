import { buildContentCss } from '@/styles/documentContentCss'
import { WORD_EXTRA_CONTENT_CSS } from '@/styles/wordContentCss'
import type { DocumentSettings } from '@/types/settings'
import type { DocumentTemplate } from '@/types/template'
import { escapeHtml } from '@/utils/text'
import { buildFilename } from '@/utils/filename'
import { buildPrintPageCss } from './printPageCss'

export interface WordHtmlExportResult {
  html: string
  filename: string
}

/**
 * Builds a fully self-contained HTML file from converted Word content:
 * sanitized markup, embedded CSS, no dependency on DocMarkdown itself.
 * Mirrors services/export/htmlExport.ts (the Markdown converter's version)
 * but takes already-sanitized HTML instead of Markdown source.
 */
export function buildWordStandaloneHtml(
  contentHtml: string,
  settings: DocumentSettings,
  template: DocumentTemplate,
): WordHtmlExportResult {
  const title = settings.metadata.title || 'Untitled Document'
  const contentCss = buildContentCss(settings, template)
  const printCss = buildPrintPageCss(settings.page)

  const document = `<!doctype html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>${escapeHtml(title)}</title>
${settings.metadata.author ? `<meta name="author" content="${escapeHtml(settings.metadata.author)}" />` : ''}
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
  ${WORD_EXTRA_CONTENT_CSS}
  ${contentCss}
  ${printCss}
</style>
</head>
<body>
<div class="doc-page-frame">
<div class="doc-content">
${contentHtml}
</div>
</div>
</body>
</html>
`

  return { html: document, filename: buildFilename(title, 'html') }
}
