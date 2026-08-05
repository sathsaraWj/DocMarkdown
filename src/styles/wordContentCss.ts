/**
 * Extra CSS for the classes DocMarkdown's Word converter injects that
 * Markdown-derived content never produces (paragraph alignment,
 * omitted-image placeholders — see services/word/parseDocx.ts and
 * wordImageProcessing.ts). Kept out of styles/documentContentCss.ts so the
 * shared Markdown/Word stylesheet doesn't carry Word-only rules.
 *
 * Note: the explicit page-break marker (`.docx-page-break`) IS shared with
 * Markdown's own `\pagebreak` syntax (see services/markdown/pageBreaks.ts),
 * so its styling lives in documentContentCss.ts instead of here.
 *
 * Used by both the live preview (WordPreview.tsx) and the standalone HTML
 * export (wordHtmlExport.ts) so the two never drift apart.
 */
export const WORD_EXTRA_CONTENT_CSS = `
  .docx-align-center { text-align: center; }
  .docx-align-right { text-align: right; }
  .docx-align-justify { text-align: justify; }
  .docx-image-omitted { display: inline-block; font-style: italic; color: var(--doc-muted-color, #6b7280); }
`
