import {
  AlignmentType,
  BorderStyle,
  ExternalHyperlink,
  HeadingLevel,
  ImageRun,
  PageBreak,
  Paragraph,
  ShadingType,
  Table,
  TableCell,
  TableRow,
  TextRun,
  WidthType,
  type ParagraphChild,
} from 'docx'

import type {
  CellAlign,
  ContentBlock,
  ListItemBlock,
  TextRun as RunModel,
} from '@/services/pdf/blocks'
import type { DocxTheme } from './docxTheme'

const HEADING_LEVELS = [
  HeadingLevel.HEADING_1,
  HeadingLevel.HEADING_2,
  HeadingLevel.HEADING_3,
  HeadingLevel.HEADING_4,
  HeadingLevel.HEADING_5,
  HeadingLevel.HEADING_6,
] as const

const EXTERNAL_LINK_RE = /^(https?:|mailto:)/i
/** A generous ceiling on embedded image height (96dpi px) to keep pathological aspect ratios sane. */
const MAX_IMAGE_HEIGHT_PX = 700
const QUOTE_INDENT_TWIPS = 360

interface RunStyleOverride {
  color?: string
  size?: number
  bold?: boolean
  allCaps?: boolean
}

function alignmentFor(align: CellAlign): (typeof AlignmentType)[keyof typeof AlignmentType] {
  if (align === 'center') return AlignmentType.CENTER
  if (align === 'right') return AlignmentType.RIGHT
  return AlignmentType.LEFT
}

function decodeDataUrl(
  dataUrl: string,
): { data: Uint8Array; type: 'png' | 'jpg' | 'gif' | 'bmp' } | null {
  const match = /^data:image\/(png|jpe?g|gif|bmp);base64,(.+)$/i.exec(dataUrl)
  if (!match) return null
  const mime = match[1]?.toLowerCase()
  const base64 = match[2]
  if (!mime || !base64) return null
  const type = mime === 'jpeg' ? 'jpg' : (mime as 'png' | 'jpg' | 'gif' | 'bmp')
  const binary = atob(base64)
  const bytes = new Uint8Array(binary.length)
  for (let i = 0; i < binary.length; i += 1) bytes[i] = binary.charCodeAt(i)
  return { data: bytes, type }
}

/** Builds styled docx run children from the shared TextRun model. `override` lets headings/blockquotes apply their own color/size/weight without a second, destructive pass over already-built docx objects (which can't be introspected once constructed). */
function runsToDocx(
  runs: RunModel[],
  theme: DocxTheme,
  override?: RunStyleOverride,
): ParagraphChild[] {
  const children: ParagraphChild[] = []
  for (const run of runs) {
    if (run.text === '\n') {
      children.push(new TextRun({ text: '', break: 1 }))
      continue
    }
    const isExternalLink = Boolean(run.href && EXTERNAL_LINK_RE.test(run.href))
    const textRun = new TextRun({
      text: run.text,
      bold: run.code ? run.bold : (override?.bold ?? run.bold),
      italics: run.italic,
      strike: run.strike,
      superScript: run.superscript,
      allCaps: run.code ? false : override?.allCaps,
      font: run.code ? theme.monoFont : theme.bodyFont,
      size: run.code ? theme.codeFontSizeHalfPt : (override?.size ?? theme.bodyFontSizeHalfPt),
      color: run.code
        ? theme.bodyColor
        : isExternalLink && theme.styleLinksForPrint
          ? theme.accentColor
          : (override?.color ?? theme.bodyColor),
      shading: run.code ? { type: ShadingType.SOLID, fill: theme.codeBackground } : undefined,
      underline: isExternalLink && theme.styleLinksForPrint ? {} : undefined,
    })
    if (isExternalLink && run.href) {
      children.push(new ExternalHyperlink({ link: run.href, children: [textRun] }))
    } else {
      children.push(textRun)
    }
  }
  return children.length > 0 ? children : [new TextRun({ text: '' })]
}

function headingParagraph(
  runs: RunModel[],
  level: 1 | 2 | 3 | 4 | 5 | 6,
  theme: DocxTheme,
  quoteDepth: number,
): Paragraph {
  const scale = Math.pow(theme.headingScale, 6 - level + 1)
  const size = Math.round(theme.bodyFontSizeHalfPt * Math.min(scale, 2.6))

  return new Paragraph({
    heading: HEADING_LEVELS[level - 1],
    spacing: { before: level === 1 ? 0 : 280, after: 160 },
    indent: quoteDepth > 0 ? { left: QUOTE_INDENT_TWIPS * quoteDepth } : undefined,
    border:
      level === 1 && theme.ruleAfterH1
        ? { bottom: { style: BorderStyle.SINGLE, size: 6, color: theme.borderColor, space: 4 } }
        : undefined,
    children: runsToDocx(runs, theme, {
      color: theme.headingColor,
      size,
      bold: theme.headingWeight >= 600,
      allCaps: theme.headingUppercase,
    }),
  })
}

function paragraphBlock(runs: RunModel[], theme: DocxTheme, quoteDepth: number): Paragraph {
  return new Paragraph({
    spacing: { after: theme.paragraphSpacingTwips, line: theme.lineSpacing },
    indent: quoteDepth > 0 ? { left: QUOTE_INDENT_TWIPS * quoteDepth } : undefined,
    border:
      quoteDepth > 0
        ? { left: { style: BorderStyle.SINGLE, size: 12, color: theme.accentColor, space: 8 } }
        : undefined,
    children: runsToDocx(runs, theme),
  })
}

function checklistMarker(item: ListItemBlock, theme: DocxTheme): string {
  if (theme.preserveChecklistSymbols) return item.checked ? '☑ ' : '☐ '
  return item.checked ? '[x] ' : '[ ] '
}

function listItemParagraphs(
  item: ListItemBlock,
  ordered: boolean,
  index: number,
  start: number,
  depth: number,
  theme: DocxTheme,
  quoteDepth: number,
): (Paragraph | Table)[] {
  const marker = item.task ? checklistMarker(item, theme) : ordered ? `${start + index}. ` : '• '
  const indent = QUOTE_INDENT_TWIPS + depth * 360 + quoteDepth * QUOTE_INDENT_TWIPS

  const paragraph = new Paragraph({
    spacing: { after: theme.paragraphSpacingTwips / 2, line: theme.lineSpacing },
    indent: { left: indent, hanging: 360 },
    children: [
      new TextRun({
        text: marker,
        color: theme.bodyColor,
        font: theme.bodyFont,
        size: theme.bodyFontSizeHalfPt,
      }),
      ...runsToDocx(item.runs, theme),
    ],
  })

  const children = blocksToDocx(item.children, theme, depth + 1, quoteDepth)
  return [paragraph, ...children]
}

function listBlock(
  items: ListItemBlock[],
  ordered: boolean,
  start: number,
  depth: number,
  theme: DocxTheme,
  quoteDepth: number,
): (Paragraph | Table)[] {
  return items.flatMap((item, index) =>
    listItemParagraphs(item, ordered, index, start, depth, theme, quoteDepth),
  )
}

function codeBlock(
  lines: string[],
  language: string | null,
  theme: DocxTheme,
  quoteDepth: number,
): Paragraph[] {
  const indent = quoteDepth > 0 ? { left: QUOTE_INDENT_TWIPS * quoteDepth } : undefined
  const paragraphs: Paragraph[] = []
  if (language) {
    paragraphs.push(
      new Paragraph({
        spacing: { after: 40 },
        indent,
        children: [
          new TextRun({
            text: language,
            italics: true,
            size: Math.round(theme.bodyFontSizeHalfPt * 0.8),
            color: theme.mutedColor,
          }),
        ],
      }),
    )
  }
  for (const line of lines) {
    paragraphs.push(
      new Paragraph({
        spacing: { after: 0, line: theme.lineSpacing },
        indent,
        shading: theme.codeBlockBackgrounds
          ? { type: ShadingType.SOLID, fill: theme.codeBackground }
          : undefined,
        children: [
          new TextRun({
            text: line.length > 0 ? line : ' ',
            font: theme.monoFont,
            size: theme.codeFontSizeHalfPt,
            color: theme.bodyColor,
          }),
        ],
      }),
    )
  }
  paragraphs.push(new Paragraph({ spacing: { after: theme.paragraphSpacingTwips } }))
  return paragraphs
}

function tableBlock(
  header: RunModel[][],
  align: CellAlign[],
  rows: RunModel[][][],
  theme: DocxTheme,
): Table {
  const columnCount = header.length || (rows[0]?.length ?? 1)
  const cellBorders = {
    top: { style: BorderStyle.SINGLE, size: 4, color: theme.borderColor },
    bottom: { style: BorderStyle.SINGLE, size: 4, color: theme.borderColor },
    left: { style: BorderStyle.SINGLE, size: 4, color: theme.borderColor },
    right: { style: BorderStyle.SINGLE, size: 4, color: theme.borderColor },
  }

  const buildRow = (cells: RunModel[][], isHeader: boolean): TableRow =>
    new TableRow({
      tableHeader: isHeader,
      children: cells.map(
        (cellRuns, colIndex) =>
          new TableCell({
            width: { size: Math.round(10000 / columnCount), type: WidthType.PERCENTAGE },
            shading: isHeader
              ? { type: ShadingType.SOLID, fill: theme.tableHeaderBackground }
              : undefined,
            borders: cellBorders,
            margins: { top: 60, bottom: 60, left: 100, right: 100 },
            children: [
              new Paragraph({
                alignment: alignmentFor(align[colIndex] ?? null),
                children: runsToDocx(cellRuns, theme, isHeader ? { bold: true } : undefined),
              }),
            ],
          }),
      ),
    })

  const rowElements: TableRow[] = []
  if (header.length > 0) rowElements.push(buildRow(header, true))
  for (const row of rows) rowElements.push(buildRow(row, false))

  return new Table({ rows: rowElements, width: { size: 100, type: WidthType.PERCENTAGE } })
}

function imageBlock(
  src: string,
  alt: string,
  aspectRatio: number | undefined,
  theme: DocxTheme,
): Paragraph {
  const decoded = decodeDataUrl(src)
  if (!decoded) {
    return new Paragraph({
      children: [
        new TextRun({
          text: `[Image: ${alt || 'untitled'}]`,
          italics: true,
          color: theme.mutedColor,
        }),
      ],
    })
  }
  const ratio = aspectRatio ?? 0.6
  const maxWidthPx = 620
  let width = maxWidthPx
  let height = width * ratio
  if (height > MAX_IMAGE_HEIGHT_PX) {
    height = MAX_IMAGE_HEIGHT_PX
    width = height / ratio
  }
  return new Paragraph({
    spacing: { after: theme.paragraphSpacingTwips },
    alignment: AlignmentType.CENTER,
    children: [
      new ImageRun({
        type: decoded.type,
        data: decoded.data,
        transformation: { width: Math.round(width), height: Math.round(height) },
        altText: { title: alt, description: alt, name: alt || 'image' },
      }),
    ],
  })
}

/** Converts the shared PDF/DOCX content-block model into docx `Paragraph`/`Table` elements. */
export function blocksToDocx(
  blocks: ContentBlock[],
  theme: DocxTheme,
  depth = 0,
  quoteDepth = 0,
): (Paragraph | Table)[] {
  const out: (Paragraph | Table)[] = []
  for (const block of blocks) {
    switch (block.type) {
      case 'heading':
        out.push(headingParagraph(block.runs, block.level, theme, quoteDepth))
        break
      case 'paragraph':
        out.push(paragraphBlock(block.runs, theme, quoteDepth))
        break
      case 'list':
        out.push(...listBlock(block.items, block.ordered, block.start, depth, theme, quoteDepth))
        break
      case 'blockquote':
        out.push(...blocksToDocx(block.blocks, theme, depth, quoteDepth + 1))
        break
      case 'code':
        out.push(...codeBlock(block.lines, block.language, theme, quoteDepth))
        break
      case 'table':
        out.push(tableBlock(block.header, block.align, block.rows, theme))
        break
      case 'hr':
        out.push(new Paragraph({ thematicBreak: true, spacing: { before: 120, after: 120 } }))
        break
      case 'page-break':
        out.push(new Paragraph({ children: [new PageBreak()] }))
        break
      case 'image':
        out.push(imageBlock(block.src, block.alt, block.aspectRatio, theme))
        break
    }
  }
  return out
}
