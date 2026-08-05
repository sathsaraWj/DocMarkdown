import * as mammoth from 'mammoth'

import type { WordParseMessage, WordParseResult } from '@/types/word'
import { sanitizeWordHtml } from './wordHtmlSanitizer'

/**
 * mammoth's own document-transform API (`mammoth.transforms`) exists at
 * runtime but isn't part of its published TypeScript types, and mammoth's
 * README explicitly calls `transformDocument` "unstable" and subject to
 * change between versions. This narrow interface covers only the paragraph
 * shape we actually read (`alignment`/`styleId`) so a future mammoth upgrade
 * fails to compile loudly instead of silently changing behavior.
 */
interface MammothParagraph {
  type: string
  alignment: string | null
  styleId: string | null
  [key: string]: unknown
}

interface MammothTransforms {
  paragraph: (
    transform: (paragraph: MammothParagraph) => MammothParagraph,
  ) => (document: unknown) => unknown
}

/**
 * mammoth's `.d.ts` declares `Result`/`Message` etc. as module-private
 * interfaces (no `export` keyword) used only to shape the `Mammoth` value's
 * method signatures — they aren't reachable as `MammothConvertResult` from
 * consumers, so we mirror the shape locally instead.
 */
interface MammothConvertResult {
  value: string
  messages: { type: 'warning' | 'error'; message: string }[]
}

function getMammothTransforms(): MammothTransforms | null {
  const transforms = (mammoth as unknown as { transforms?: MammothTransforms }).transforms
  return transforms ?? null
}

const ALIGNMENT_STYLE_IDS: Record<string, string> = {
  center: 'DocxAlignCenter',
  right: 'DocxAlignRight',
  both: 'DocxAlignJustify',
}

function transformParagraphAlignment(paragraph: MammothParagraph): MammothParagraph {
  const alignment = paragraph.alignment
  const styleId = alignment ? ALIGNMENT_STYLE_IDS[alignment] : undefined
  if (styleId && !paragraph.styleId) {
    return { ...paragraph, styleId }
  }
  return paragraph
}

/** Style-map rules beyond mammoth's built-in defaults: quote styles, underline, basic alignment, and page breaks. */
const EXTENDED_STYLE_MAP = [
  "p[style-name='Quote'] => blockquote:fresh",
  "p[style-name='Intense Quote'] => blockquote:fresh",
  "p[style-name='Title'] => h1:fresh",
  "p[style-name='Subtitle'] => h2:fresh",
  'u => u',
  'p.DocxAlignCenter => p.docx-align-center:fresh',
  'p.DocxAlignRight => p.docx-align-right:fresh',
  'p.DocxAlignJustify => p.docx-align-justify:fresh',
  "br[type='page'] => hr.docx-page-break:fresh",
]

/** Minimal, well-documented fallback used if the extended style map or alignment transform ever breaks against a future mammoth version. */
const SAFE_STYLE_MAP = [
  "p[style-name='Quote'] => blockquote:fresh",
  "p[style-name='Intense Quote'] => blockquote:fresh",
  'u => u',
]

async function runMammoth(arrayBuffer: ArrayBuffer): Promise<MammothConvertResult> {
  const transforms = getMammothTransforms()
  try {
    return await mammoth.convertToHtml(
      { arrayBuffer },
      {
        styleMap: EXTENDED_STYLE_MAP,
        transformDocument: transforms?.paragraph(transformParagraphAlignment),
      },
    )
  } catch {
    return mammoth.convertToHtml({ arrayBuffer }, { styleMap: SAFE_STYLE_MAP })
  }
}

function extractTitle(html: string): string | null {
  const doc = new DOMParser().parseFromString(html, 'text/html')
  const heading = doc.querySelector('h1, h2')
  const text = heading?.textContent?.trim()
  return text ? text : null
}

function countImages(html: string): number {
  const doc = new DOMParser().parseFromString(html, 'text/html')
  return doc.querySelectorAll('img').length
}

/**
 * Converts a .docx file to sanitized HTML entirely in-memory in the browser.
 * Callers are expected to have already run {@link validateWordFile} and
 * {@link detectWordFileSignatureIssue}; this function still guards against
 * parse-time failures (corrupt archives, missing document parts) and
 * surfaces them as a single friendly error rather than a raw exception.
 */
export async function parseDocx(file: File): Promise<WordParseResult> {
  let arrayBuffer: ArrayBuffer
  try {
    arrayBuffer = await file.arrayBuffer()
  } catch {
    throw new Error('The document could not be read. It may be corrupted or password-protected.')
  }

  let result: MammothConvertResult
  try {
    result = await runMammoth(arrayBuffer)
  } catch {
    throw new Error('The document could not be read. It may be corrupted or password-protected.')
  }

  const title = extractTitle(result.value)
  const imageCount = countImages(result.value)
  const html = sanitizeWordHtml(result.value)

  const warnings: WordParseMessage[] = result.messages.map((message) => ({
    type: message.type === 'error' ? 'error' : 'warning',
    message: message.message,
  }))

  return { html, warnings, title, imageCount }
}
