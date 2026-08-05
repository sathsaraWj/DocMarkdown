import JSZip from 'jszip'

import { mapDocxFontNameToEmbeddedId } from '@/services/pdf/fontMetrics'
import type { DocxLayoutHints } from '@/types/word'
import { MARGIN_PRESETS_MM, PAGE_DIMENSIONS_MM } from '@/types/page'
import type { Margins, Orientation, PageSize } from '@/types/page'

const TWIPS_PER_MM = 1440 / 25.4
const SIZE_MATCH_TOLERANCE_MM = 8

function twipsToMm(twips: number): number {
  return twips / TWIPS_PER_MM
}

function halfPointsToPt(halfPoints: number): number {
  return halfPoints / 2
}

function parseXml(text: string): Document | null {
  try {
    const doc = new DOMParser().parseFromString(text, 'application/xml')
    if (doc.querySelector('parsererror')) return null
    return doc
  } catch {
    return null
  }
}

/** Picks whichever standard page size (in either orientation) is closest to the extracted dimensions, within a tolerance — real page sizes vary by fractions of a mm depending on the originating application. */
function matchPageSize(widthMm: number, heightMm: number): { size: PageSize; orientation: Orientation } | null {
  let best: { size: PageSize; orientation: Orientation; distance: number } | null = null

  for (const [size, base] of Object.entries(PAGE_DIMENSIONS_MM) as [PageSize, { width: number; height: number }][]) {
    const candidates: { orientation: Orientation; width: number; height: number }[] = [
      { orientation: 'portrait', width: base.width, height: base.height },
      { orientation: 'landscape', width: base.height, height: base.width },
    ]
    for (const candidate of candidates) {
      const distance = Math.abs(candidate.width - widthMm) + Math.abs(candidate.height - heightMm)
      if (!best || distance < best.distance) {
        best = { size, orientation: candidate.orientation, distance }
      }
    }
  }

  if (!best || best.distance > SIZE_MATCH_TOLERANCE_MM) return null
  return { size: best.size, orientation: best.orientation }
}

function extractPageHints(documentXml: Document): DocxLayoutHints['page'] {
  const sectPrList = documentXml.getElementsByTagName('w:sectPr')
  const sectPr = sectPrList.item(sectPrList.length - 1)
  if (!sectPr) return null

  const pgSz = sectPr.getElementsByTagName('w:pgSz').item(0)
  const pgMar = sectPr.getElementsByTagName('w:pgMar').item(0)
  if (!pgSz) return null

  const wTwips = Number(pgSz.getAttribute('w:w'))
  const hTwips = Number(pgSz.getAttribute('w:h'))
  if (!Number.isFinite(wTwips) || !Number.isFinite(hTwips) || wTwips <= 0 || hTwips <= 0) return null

  const widthMm = twipsToMm(wTwips)
  const heightMm = twipsToMm(hTwips)
  const matched = matchPageSize(widthMm, heightMm)
  if (!matched) return null

  let margins: Margins = MARGIN_PRESETS_MM.normal
  if (pgMar) {
    const top = Number(pgMar.getAttribute('w:top'))
    const right = Number(pgMar.getAttribute('w:right'))
    const bottom = Number(pgMar.getAttribute('w:bottom'))
    const left = Number(pgMar.getAttribute('w:left'))
    if ([top, right, bottom, left].every((v) => Number.isFinite(v))) {
      margins = {
        top: Math.round(twipsToMm(top) * 10) / 10,
        right: Math.round(twipsToMm(right) * 10) / 10,
        bottom: Math.round(twipsToMm(bottom) * 10) / 10,
        left: Math.round(twipsToMm(left) * 10) / 10,
      }
    }
  }

  return { size: matched.size, orientation: matched.orientation, margins }
}

/** Reads rFonts/sz from a specific rPr element, if present. */
function readFontFromRPr(rPr: Element | null): { fontName: string | null; sizePt: number | null } {
  if (!rPr) return { fontName: null, sizePt: null }

  const rFonts = rPr.getElementsByTagName('w:rFonts').item(0)
  const sz = rPr.getElementsByTagName('w:sz').item(0)

  const fontName = rFonts?.getAttribute('w:ascii') ?? rFonts?.getAttribute('w:hAnsi') ?? null
  const sizeHalfPoints = sz ? Number(sz.getAttribute('w:val')) : NaN
  const sizePt = Number.isFinite(sizeHalfPoints) && sizeHalfPoints > 0 ? halfPointsToPt(sizeHalfPoints) : null

  return { fontName, sizePt }
}

/**
 * The "Normal" paragraph style is what most body text actually uses, but it
 * doesn't always redeclare every property — anything it omits inherits from
 * docDefaults. Each field (font name, size) falls back independently rather
 * than falling back to docDefaults' rPr as a whole, since a Normal style
 * that overrides only the font size (say) should still inherit the default
 * font name rather than losing font detection entirely.
 */
function extractFontHints(stylesXml: Document): DocxLayoutHints['font'] {
  const normalStyle = Array.from(stylesXml.getElementsByTagName('w:style')).find(
    (style) => style.getAttribute('w:styleId') === 'Normal',
  )
  const docDefaultsRPr = stylesXml.getElementsByTagName('w:rPrDefault').item(0)?.getElementsByTagName('w:rPr').item(0) ?? null
  const normalRPr = normalStyle?.getElementsByTagName('w:rPr').item(0) ?? null

  const fromNormal = readFontFromRPr(normalRPr)
  const fromDefaults = readFontFromRPr(docDefaultsRPr)

  const fontName = fromNormal.fontName ?? fromDefaults.fontName
  if (!fontName) return null

  const sizePt = fromNormal.sizePt ?? fromDefaults.sizePt

  return { fontId: mapDocxFontNameToEmbeddedId(fontName), sourceName: fontName, sizePt }
}

/**
 * Reads page geometry (size/margins/orientation) and dominant document font
 * directly from the .docx's own OOXML — information mammoth doesn't expose
 * at all. Best-effort only: any missing or malformed part simply yields a
 * null field rather than failing the overall conversion, since this is an
 * enhancement layered on top of the mammoth-based conversion that already
 * works without it.
 */
export async function extractDocxLayoutHints(arrayBuffer: ArrayBuffer): Promise<DocxLayoutHints | null> {
  try {
    const zip = await JSZip.loadAsync(arrayBuffer)

    const documentXmlText = await zip.file('word/document.xml')?.async('text')
    const stylesXmlText = await zip.file('word/styles.xml')?.async('text')

    const documentXml = documentXmlText ? parseXml(documentXmlText) : null
    const stylesXml = stylesXmlText ? parseXml(stylesXmlText) : null

    const page = documentXml ? extractPageHints(documentXml) : null
    const font = stylesXml ? extractFontHints(stylesXml) : null

    if (!page && !font) return null
    return { page, font }
  } catch {
    return null
  }
}
