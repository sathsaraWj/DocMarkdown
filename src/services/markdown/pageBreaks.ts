/**
 * A standalone `\pagebreak` line is DocMarkdown's Markdown syntax for an
 * explicit forced page break — converted to the same `<hr class=
 * "docx-page-break">` marker the Word-to-PDF converter already produces for
 * an explicit Word page break, so the PDF layout engine
 * (services/pdf/htmlToBlocks.ts / pdfWriter.ts) and the print/HTML export
 * CSS honor it identically regardless of which converter produced it.
 */
const PAGE_BREAK_LINE = /^\\pagebreak[ \t]*$/gm

export function extractPageBreaks(markdown: string): string {
  return markdown.replace(PAGE_BREAK_LINE, '<hr class="docx-page-break">')
}
