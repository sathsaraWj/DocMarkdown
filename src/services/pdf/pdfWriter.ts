import type { jsPDF } from 'jspdf'

import type { RgbTuple } from '@/utils/color'
import type { CellAlign, ContentBlock, ListItemBlock, TextRun } from './blocks'

export type PdfFontFamily =
  | 'helvetica'
  | 'times'
  | 'courier'
  | 'Carlito'
  | 'Caladea'
  | 'Arimo'
  | 'Tinos'
  | 'Cousine'

export interface PdfTheme {
  bodyFont: PdfFontFamily
  headingFont: PdfFontFamily
  monoFont: PdfFontFamily
  bodyFontSize: number
  headingScale: number
  lineHeight: number
  paragraphSpacingMm: number
  codeFontSize: number
  accentColor: RgbTuple
  headingColor: RgbTuple
  bodyColor: RgbTuple
  mutedColor: RgbTuple
  borderColor: RgbTuple
  codeBackground: RgbTuple
  tableHeaderBackground: RgbTuple
  codeBlockBackgrounds: boolean
  styleLinksForPrint: boolean
  preserveChecklistSymbols: boolean
}

export interface PageBox {
  width: number
  height: number
  orientation: 'p' | 'l'
  marginTop: number
  marginRight: number
  marginBottom: number
  marginLeft: number
}

const PT_TO_MM = 0.352778
const ASCENT_RATIO = 0.75

interface RunStyleFlags {
  bold: boolean
  italic: boolean
  strike: boolean
  code: boolean
  href: string | null
  superscript: boolean
}

interface Token {
  text: string
  style: RunStyleFlags
  isBreak: boolean
}

function tokenize(runs: TextRun[]): Token[] {
  const tokens: Token[] = []
  for (const run of runs) {
    if (run.text === '\n') {
      tokens.push({ text: '', style: run, isBreak: true })
      continue
    }
    const normalized = run.text.replace(/\s+/g, ' ')
    for (const part of normalized.split(/( )/).filter((p) => p.length > 0)) {
      tokens.push({ text: part, style: run, isBreak: false })
    }
  }
  return tokens
}

export class PdfWriter {
  readonly doc: jsPDF
  readonly theme: PdfTheme
  readonly page: PageBox
  readonly format: number[]
  cursorY: number
  private readonly contentTop: number
  private readonly contentBottom: number
  private contentLeft: number
  private contentWidth: number

  constructor(doc: jsPDF, theme: PdfTheme, page: PageBox) {
    this.doc = doc
    this.theme = theme
    this.page = page
    this.format = [page.width, page.height]
    this.contentTop = page.marginTop
    this.contentBottom = page.height - page.marginBottom
    this.contentLeft = page.marginLeft
    this.contentWidth = page.width - page.marginLeft - page.marginRight
    this.cursorY = this.contentTop
    this.setFont(theme.bodyFont, false, false)
    this.doc.setFontSize(theme.bodyFontSize)
  }

  get left(): number {
    return this.contentLeft
  }

  get width(): number {
    return this.contentWidth
  }

  newPage(): void {
    this.doc.addPage(this.format, this.page.orientation)
    this.cursorY = this.contentTop
  }

  ensureSpace(height: number): void {
    if (this.cursorY + height > this.contentBottom) {
      this.newPage()
    }
  }

  addVerticalSpace(mm: number): void {
    this.cursorY += mm
  }

  private setFont(family: PdfFontFamily, bold: boolean, italic: boolean): void {
    const style = bold && italic ? 'bolditalic' : bold ? 'bold' : italic ? 'italic' : 'normal'
    this.doc.setFont(family, style)
  }

  private applyRunStyle(style: RunStyleFlags, baseSize: number, font: PdfFontFamily): void {
    if (style.code) {
      this.setFont(this.theme.monoFont, style.bold, style.italic)
      this.doc.setFontSize(this.theme.codeFontSize)
    } else {
      this.setFont(font, style.bold, style.italic)
      this.doc.setFontSize(style.superscript ? baseSize * 0.7 : baseSize)
    }
    if (style.href && this.theme.styleLinksForPrint) {
      this.doc.setTextColor(...this.theme.accentColor)
    } else {
      this.doc.setTextColor(...this.theme.bodyColor)
    }
  }

  private lineHeightFor(fontSizePt: number): number {
    return fontSizePt * PT_TO_MM * this.theme.lineHeight
  }

  drawRuns(
    runs: TextRun[],
    opts: {
      x: number
      maxWidth: number
      fontSize: number
      font: PdfFontFamily
      align?: 'left' | 'center' | 'right'
      color?: RgbTuple
    },
  ): void {
    const tokens = tokenize(runs)
    const lineHeight = this.lineHeightFor(opts.fontSize)
    const ascent = opts.fontSize * PT_TO_MM * ASCENT_RATIO
    const align = opts.align ?? 'left'

    let line: { token: Token; width: number }[] = []
    let lineWidth = 0

    const measure = (token: Token): number => {
      this.applyRunStyle(token.style, opts.fontSize, opts.font)
      return this.doc.getTextWidth(token.text)
    }

    const flush = (): void => {
      if (line.length === 0) return
      this.ensureSpace(lineHeight)
      let cursorX = opts.x
      if (align === 'center') cursorX = opts.x + (opts.maxWidth - lineWidth) / 2
      if (align === 'right') cursorX = opts.x + opts.maxWidth - lineWidth

      for (const { token, width } of line) {
        this.applyRunStyle(token.style, opts.fontSize, opts.font)
        if (opts.color && !token.style.href) this.doc.setTextColor(...opts.color)
        const baseline = this.cursorY + ascent
        if (token.style.code) {
          this.doc.setFillColor(...this.theme.codeBackground)
          this.doc.rect(cursorX, this.cursorY + ascent * 0.15, width, lineHeight * 0.8, 'F')
          this.applyRunStyle(token.style, opts.fontSize, opts.font)
          if (opts.color) this.doc.setTextColor(...opts.color)
        }
        this.doc.text(token.text, cursorX, baseline)
        if (token.style.strike) {
          this.doc.setDrawColor(...this.theme.bodyColor)
          this.doc.line(cursorX, baseline - ascent * 0.3, cursorX + width, baseline - ascent * 0.3)
        }
        if (token.style.href) {
          if (this.theme.styleLinksForPrint) {
            this.doc.setDrawColor(...this.theme.accentColor)
            this.doc.line(cursorX, baseline + 0.5, cursorX + width, baseline + 0.5)
          }
          if (/^(https?:|mailto:)/i.test(token.style.href)) {
            this.doc.link(cursorX, this.cursorY, width, lineHeight, { url: token.style.href })
          }
        }
        cursorX += width
      }
      this.cursorY += lineHeight
      line = []
      lineWidth = 0
    }

    for (const token of tokens) {
      if (token.isBreak) {
        flush()
        continue
      }
      if (token.text === ' ' && line.length === 0) continue
      const width = measure(token)
      if (lineWidth + width > opts.maxWidth && line.length > 0) {
        flush()
        if (token.text === ' ') continue
      }
      line.push({ token, width })
      lineWidth += width
    }
    flush()
  }

  drawHeading(runs: TextRun[], level: 1 | 2 | 3 | 4 | 5 | 6): void {
    const scale = Math.pow(this.theme.headingScale, 6 - level + 1)
    const fontSize = Math.min(this.theme.bodyFontSize * scale, this.theme.bodyFontSize * 2.6)
    const leadingSpace = level <= 2 ? 4 : 3
    const ruleSpace = level === 1 ? 6 : 0
    // A heading followed by nothing but a page break reads as broken — reserve
    // room for the heading itself PLUS at least one line of whatever comes
    // next before committing to draw it on the current page, so a heading
    // never ends up alone as the last line on a page.
    const orphanGuardHeight =
      leadingSpace +
      this.lineHeightFor(fontSize) +
      2 +
      ruleSpace +
      this.lineHeightFor(this.theme.bodyFontSize)
    if (this.cursorY + orphanGuardHeight > this.contentBottom && this.cursorY > this.contentTop) {
      this.newPage()
    }
    this.addVerticalSpace(leadingSpace)
    this.drawRuns(runs, {
      x: this.contentLeft,
      maxWidth: this.contentWidth,
      fontSize,
      font: this.theme.headingFont,
      color: this.theme.headingColor,
    })
    this.addVerticalSpace(2)
    if (level === 1) {
      this.ensureSpace(3)
      this.doc.setDrawColor(...this.theme.borderColor)
      this.doc.setLineWidth(0.4)
      this.doc.line(
        this.contentLeft,
        this.cursorY,
        this.contentLeft + this.contentWidth,
        this.cursorY,
      )
      this.addVerticalSpace(3)
    }
  }

  drawParagraph(runs: TextRun[]): void {
    this.drawRuns(runs, {
      x: this.contentLeft,
      maxWidth: this.contentWidth,
      fontSize: this.theme.bodyFontSize,
      font: this.theme.bodyFont,
    })
    this.addVerticalSpace(this.theme.paragraphSpacingMm)
  }

  drawHr(): void {
    this.ensureSpace(6)
    this.addVerticalSpace(2)
    this.doc.setDrawColor(...this.theme.borderColor)
    this.doc.setLineWidth(0.3)
    this.doc.line(
      this.contentLeft,
      this.cursorY,
      this.contentLeft + this.contentWidth,
      this.cursorY,
    )
    this.addVerticalSpace(4)
  }

  private drawListItems(
    items: ListItemBlock[],
    ordered: boolean,
    start: number,
    depth: number,
  ): void {
    const indent = depth * 6
    items.forEach((item, index) => {
      const marker = item.task
        ? this.theme.preserveChecklistSymbols
          ? item.checked
            ? '☑'
            : '☐'
          : item.checked
            ? '[x]'
            : '[ ]'
        : ordered
          ? `${start + index}.`
          : '•'
      this.ensureSpace(this.lineHeightFor(this.theme.bodyFontSize))
      this.doc.setFont(this.theme.bodyFont, 'normal')
      this.doc.setFontSize(this.theme.bodyFontSize)
      this.doc.setTextColor(...this.theme.bodyColor)
      this.doc.text(
        marker,
        this.contentLeft + indent,
        this.cursorY + this.theme.bodyFontSize * PT_TO_MM * ASCENT_RATIO,
      )
      const markerWidth = this.doc.getTextWidth(`${marker} `)
      const textX = this.contentLeft + indent + markerWidth
      this.drawRuns(item.runs, {
        x: textX,
        maxWidth: this.contentWidth - indent - markerWidth,
        fontSize: this.theme.bodyFontSize,
        font: this.theme.bodyFont,
      })
      if (item.children.length > 0) {
        this.drawBlocks(item.children, depth + 1)
      }
    })
    this.addVerticalSpace(this.theme.paragraphSpacingMm * 0.5)
  }

  drawBlockquote(blocks: ContentBlock[]): void {
    const startY = this.cursorY
    const savedLeft = this.contentLeft
    // Indent content and draw a left rule after measuring extent.
    this.drawBlocksIndented(blocks, 6)
    this.doc.setDrawColor(...this.theme.accentColor)
    this.doc.setLineWidth(1)
    this.doc.line(savedLeft + 1, startY, savedLeft + 1, this.cursorY - 2)
  }

  private drawBlocksIndented(blocks: ContentBlock[], indent: number): void {
    const originalLeft = this.contentLeft
    const originalWidth = this.contentWidth
    this.contentLeft += indent
    this.contentWidth -= indent
    this.drawBlocks(blocks, 0)
    this.contentLeft = originalLeft
    this.contentWidth = originalWidth
  }

  drawCode(lines: string[], language: string | null): void {
    const fontSize = this.theme.codeFontSize
    const lineHeight = this.lineHeightFor(fontSize)
    this.doc.setFont(this.theme.monoFont, 'normal')
    this.doc.setFontSize(fontSize)
    const wrapped: string[] = []
    for (const line of lines) {
      const chunks = this.doc.splitTextToSize(
        line.length === 0 ? ' ' : line,
        this.contentWidth - 4,
      ) as string[]
      wrapped.push(...chunks)
    }
    const blockHeight = wrapped.length * lineHeight + 4 + (language ? 4 : 0)
    this.ensureSpace(Math.min(blockHeight, this.contentBottom - this.contentTop))

    const blockStartY = this.cursorY
    if (this.theme.codeBlockBackgrounds) {
      this.doc.setFillColor(...this.theme.codeBackground)
    }
    this.addVerticalSpace(2)
    if (language) {
      this.doc.setFont(this.theme.bodyFont, 'italic')
      this.doc.setFontSize(this.theme.bodyFontSize * 0.7)
      this.doc.setTextColor(...this.theme.mutedColor)
      this.doc.text(language, this.contentLeft + 2, this.cursorY + 2.5)
      this.addVerticalSpace(4)
    }
    for (const chunk of wrapped) {
      this.ensureSpace(lineHeight)
      this.doc.setFont(this.theme.monoFont, 'normal')
      this.doc.setFontSize(fontSize)
      this.doc.setTextColor(...this.theme.bodyColor)
      this.doc.text(chunk, this.contentLeft + 2, this.cursorY + fontSize * PT_TO_MM * ASCENT_RATIO)
      this.cursorY += lineHeight
    }
    this.addVerticalSpace(2)
    if (this.theme.codeBlockBackgrounds) {
      this.doc.setFillColor(...this.theme.codeBackground)
      this.doc.rect(
        this.contentLeft,
        blockStartY,
        this.contentWidth,
        this.cursorY - blockStartY,
        'S',
      )
    }
    this.addVerticalSpace(this.theme.paragraphSpacingMm)
  }

  drawTable(header: TextRun[][], align: CellAlign[], rows: TextRun[][][]): void {
    const columnCount = header.length || (rows[0]?.length ?? 1)
    const columnWidth = this.contentWidth / Math.max(columnCount, 1)
    const fontSize = this.theme.bodyFontSize * 0.92
    const lineHeight = this.lineHeightFor(fontSize)
    const cellPadding = 2

    const drawRow = (cells: TextRun[][], isHeader: boolean): void => {
      const doc = this.doc
      const measuredLines = cells.map((cell) => {
        doc.setFont(this.theme.bodyFont, isHeader ? 'bold' : 'normal')
        doc.setFontSize(fontSize)
        const text = cell.map((r) => r.text).join('')
        return doc.splitTextToSize(text || ' ', columnWidth - cellPadding * 2) as string[]
      })
      const rowLines = Math.max(1, ...measuredLines.map((l) => l.length))
      const rowHeight = rowLines * lineHeight + cellPadding * 2
      this.ensureSpace(rowHeight)
      const rowTop = this.cursorY

      if (isHeader) {
        this.doc.setFillColor(...this.theme.tableHeaderBackground)
        this.doc.rect(this.contentLeft, rowTop, this.contentWidth, rowHeight, 'F')
      }

      measuredLines.forEach((cellLines, colIndex) => {
        const cellX = this.contentLeft + colIndex * columnWidth
        const cellAlign = align[colIndex] ?? 'left'
        doc.setFont(this.theme.bodyFont, isHeader ? 'bold' : 'normal')
        doc.setFontSize(fontSize)
        doc.setTextColor(...this.theme.bodyColor)
        cellLines.forEach((line, lineIndex) => {
          const textWidth = doc.getTextWidth(line)
          let textX = cellX + cellPadding
          if (cellAlign === 'center') textX = cellX + (columnWidth - textWidth) / 2
          if (cellAlign === 'right') textX = cellX + columnWidth - cellPadding - textWidth
          doc.text(
            line,
            textX,
            rowTop + cellPadding + lineIndex * lineHeight + fontSize * PT_TO_MM * ASCENT_RATIO,
          )
        })
      })

      this.doc.setDrawColor(...this.theme.borderColor)
      this.doc.setLineWidth(0.2)
      for (let c = 0; c <= columnCount; c += 1) {
        const lineX = this.contentLeft + c * columnWidth
        this.doc.line(lineX, rowTop, lineX, rowTop + rowHeight)
      }
      this.doc.line(this.contentLeft, rowTop, this.contentLeft + this.contentWidth, rowTop)
      this.cursorY = rowTop + rowHeight
      this.doc.line(
        this.contentLeft,
        this.cursorY,
        this.contentLeft + this.contentWidth,
        this.cursorY,
      )
    }

    if (header.length > 0) drawRow(header, true)
    for (const row of rows) drawRow(row, false)
    this.addVerticalSpace(this.theme.paragraphSpacingMm)
  }

  drawImagePlaceholder(alt: string): void {
    this.drawParagraph([{ ...emptyRun(), text: `[Image: ${alt || 'untitled'}]`, italic: true }])
  }

  drawImage(dataUrl: string, alt: string, aspectRatio?: number): void {
    try {
      const formatMatch = /data:image\/(png|jpe?g|webp)/i.exec(dataUrl)?.[1]?.toUpperCase()
      const format = formatMatch === 'JPG' ? 'JPEG' : (formatMatch ?? 'PNG')
      const ratio = aspectRatio ?? 0.6
      const maxHeight = 120
      let width = this.contentWidth
      let height = width * ratio
      if (height > maxHeight) {
        height = maxHeight
        width = height / ratio
      }
      this.ensureSpace(height + this.theme.paragraphSpacingMm)
      this.doc.addImage(dataUrl, format, this.contentLeft, this.cursorY, width, height)
      this.addVerticalSpace(height + this.theme.paragraphSpacingMm)
    } catch {
      this.drawImagePlaceholder(alt)
    }
  }

  drawBlocks(blocks: ContentBlock[], listDepth = 0): void {
    for (const block of blocks) {
      switch (block.type) {
        case 'heading':
          this.drawHeading(block.runs, block.level)
          break
        case 'paragraph':
          this.drawParagraph(block.runs)
          break
        case 'list':
          this.drawListItems(block.items, block.ordered, block.start, listDepth)
          break
        case 'blockquote':
          this.drawBlockquote(block.blocks)
          break
        case 'code':
          this.drawCode(block.lines, block.language)
          break
        case 'table':
          this.drawTable(block.header, block.align, block.rows)
          break
        case 'hr':
          this.drawHr()
          break
        case 'page-break':
          this.newPage()
          break
        case 'image':
          if (block.src.startsWith('data:image/')) {
            this.drawImage(block.src, block.alt, block.aspectRatio)
          } else {
            this.drawImagePlaceholder(block.alt)
          }
          break
      }
    }
  }
}

function emptyRun(): TextRun {
  return {
    text: '',
    bold: false,
    italic: false,
    strike: false,
    code: false,
    href: null,
    superscript: false,
  }
}
