export type CellAlign = 'left' | 'center' | 'right' | null

export interface TextRun {
  text: string
  bold: boolean
  italic: boolean
  strike: boolean
  code: boolean
  href: string | null
  superscript: boolean
}

export interface ListItemBlock {
  runs: TextRun[]
  task: boolean
  checked: boolean
  children: ContentBlock[]
}

export type ContentBlock =
  | { type: 'heading'; level: 1 | 2 | 3 | 4 | 5 | 6; runs: TextRun[]; id: string }
  | { type: 'paragraph'; runs: TextRun[] }
  | { type: 'list'; ordered: boolean; start: number; items: ListItemBlock[] }
  | { type: 'blockquote'; blocks: ContentBlock[] }
  | { type: 'code'; lines: string[]; language: string | null }
  | {
      type: 'table'
      header: TextRun[][]
      align: CellAlign[]
      rows: TextRun[][][]
    }
  | { type: 'hr' }
  | { type: 'image'; src: string; alt: string; aspectRatio?: number }
  /** An explicit forced page break from the source document (e.g. a Word manual page break) — always starts a new page, unlike a plain 'hr'. */
  | { type: 'page-break' }

export function plainRun(text: string): TextRun {
  return {
    text,
    bold: false,
    italic: false,
    strike: false,
    code: false,
    href: null,
    superscript: false,
  }
}
