/**
 * Extra CSS for the handful of classes DocMarkdown's Word converter injects
 * that Markdown-derived content never produces (paragraph alignment, manual
 * page breaks, omitted-image placeholders — see services/word/parseDocx.ts
 * and wordImageProcessing.ts). Kept out of styles/documentContentCss.ts so
 * the shared Markdown/Word stylesheet doesn't carry Word-only rules.
 *
 * Used by both the live preview (WordPreview.tsx) and the standalone HTML
 * export (wordHtmlExport.ts) so the two never drift apart.
 */
export const WORD_EXTRA_CONTENT_CSS = `
  .docx-align-center { text-align: center; }
  .docx-align-right { text-align: right; }
  .docx-align-justify { text-align: justify; }
  .docx-page-break {
    border: none;
    border-top: 2px dashed var(--doc-border-color, #cbd5e1);
    margin: 2rem 0;
    break-after: page;
    page-break-after: always;
  }
  .docx-image-omitted { display: inline-block; font-style: italic; color: var(--doc-muted-color, #6b7280); }
`
