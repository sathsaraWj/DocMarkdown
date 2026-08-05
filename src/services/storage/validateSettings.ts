import { TEMPLATE_IDS, type TemplateId } from '@/types/template'
import { DEFAULT_DOCUMENT_SETTINGS, type DocumentSettings } from '@/types/settings'
import {
  MARGIN_PRESETS_MM,
  type MarginPreset,
  type Margins,
  type Orientation,
  type PageSettings,
  type PageSize,
} from '@/types/page'
import { TYPOGRAPHY_LIMITS, type TypographySettings } from '@/types/typography'
import type { DocumentMetadata } from '@/types/document'
import type { HeaderFooterSettings } from '@/types/headerFooter'
import type { ContentOptions } from '@/types/contentOptions'

const PAGE_SIZES: readonly PageSize[] = ['A4', 'Letter', 'Legal', 'A5']
const ORIENTATIONS: readonly Orientation[] = ['portrait', 'landscape']
const MARGIN_PRESETS: readonly MarginPreset[] = ['narrow', 'normal', 'wide', 'custom']
const MAX_MARGIN_MM = 100
const MAX_STRING_LENGTH = 500

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}

function clampNumber(value: unknown, min: number, max: number, fallback: number): number {
  const num = typeof value === 'number' && Number.isFinite(value) ? value : fallback
  return Math.min(max, Math.max(min, num))
}

function sanitizeString(value: unknown, fallback: string): string {
  if (typeof value !== 'string') return fallback
  return value.slice(0, MAX_STRING_LENGTH)
}

function validateMargins(value: unknown, fallback: Margins): Margins {
  if (!isRecord(value)) return fallback
  return {
    top: clampNumber(value.top, 0, MAX_MARGIN_MM, fallback.top),
    right: clampNumber(value.right, 0, MAX_MARGIN_MM, fallback.right),
    bottom: clampNumber(value.bottom, 0, MAX_MARGIN_MM, fallback.bottom),
    left: clampNumber(value.left, 0, MAX_MARGIN_MM, fallback.left),
  }
}

function validatePage(value: unknown): PageSettings {
  const fallback = DEFAULT_DOCUMENT_SETTINGS.page
  if (!isRecord(value)) return fallback
  const size = PAGE_SIZES.includes(value.size as PageSize)
    ? (value.size as PageSize)
    : fallback.size
  const orientation = ORIENTATIONS.includes(value.orientation as Orientation)
    ? (value.orientation as Orientation)
    : fallback.orientation
  const marginPreset = MARGIN_PRESETS.includes(value.marginPreset as MarginPreset)
    ? (value.marginPreset as MarginPreset)
    : fallback.marginPreset
  const presetMargins = marginPreset === 'custom' ? undefined : MARGIN_PRESETS_MM[marginPreset]
  const margins = presetMargins ?? validateMargins(value.margins, fallback.margins)
  return { size, orientation, marginPreset, margins }
}

function validateTypography(value: unknown): TypographySettings {
  const fallback = DEFAULT_DOCUMENT_SETTINGS.typography
  if (!isRecord(value)) return fallback
  const fontFamily = ['sans', 'serif', 'mono', 'system'].includes(value.fontFamily as string)
    ? (value.fontFamily as TypographySettings['fontFamily'])
    : fallback.fontFamily
  const { bodyFontSize, headingScale, lineHeight, paragraphSpacing, codeFontSize } =
    TYPOGRAPHY_LIMITS
  return {
    fontFamily,
    bodyFontSize: clampNumber(
      value.bodyFontSize,
      bodyFontSize.min,
      bodyFontSize.max,
      fallback.bodyFontSize,
    ),
    headingScale: clampNumber(
      value.headingScale,
      headingScale.min,
      headingScale.max,
      fallback.headingScale,
    ),
    lineHeight: clampNumber(value.lineHeight, lineHeight.min, lineHeight.max, fallback.lineHeight),
    paragraphSpacing: clampNumber(
      value.paragraphSpacing,
      paragraphSpacing.min,
      paragraphSpacing.max,
      fallback.paragraphSpacing,
    ),
    codeFontSize: clampNumber(
      value.codeFontSize,
      codeFontSize.min,
      codeFontSize.max,
      fallback.codeFontSize,
    ),
  }
}

function validateMetadata(value: unknown): DocumentMetadata {
  const fallback = DEFAULT_DOCUMENT_SETTINGS.metadata
  if (!isRecord(value)) return fallback
  return {
    title: sanitizeString(value.title, fallback.title),
    author: sanitizeString(value.author, fallback.author),
    subject: sanitizeString(value.subject, fallback.subject),
    keywords: sanitizeString(value.keywords, fallback.keywords),
  }
}

function validateHeaderFooter(value: unknown): HeaderFooterSettings {
  const fallback = DEFAULT_DOCUMENT_SETTINGS.headerFooter
  if (!isRecord(value)) return fallback
  return {
    headerEnabled:
      typeof value.headerEnabled === 'boolean' ? value.headerEnabled : fallback.headerEnabled,
    footerEnabled:
      typeof value.footerEnabled === 'boolean' ? value.footerEnabled : fallback.footerEnabled,
    headerText: sanitizeString(value.headerText, fallback.headerText),
    footerText: sanitizeString(value.footerText, fallback.footerText),
    showPageNumber:
      typeof value.showPageNumber === 'boolean' ? value.showPageNumber : fallback.showPageNumber,
    showDocTitle:
      typeof value.showDocTitle === 'boolean' ? value.showDocTitle : fallback.showDocTitle,
    showExportDate:
      typeof value.showExportDate === 'boolean' ? value.showExportDate : fallback.showExportDate,
  }
}

function validateContent(value: unknown): ContentOptions {
  const fallback = DEFAULT_DOCUMENT_SETTINGS.content
  if (!isRecord(value)) return fallback
  return {
    generateToc: typeof value.generateToc === 'boolean' ? value.generateToc : fallback.generateToc,
    headingNumbering:
      typeof value.headingNumbering === 'boolean'
        ? value.headingNumbering
        : fallback.headingNumbering,
    styleLinksForPrint:
      typeof value.styleLinksForPrint === 'boolean'
        ? value.styleLinksForPrint
        : fallback.styleLinksForPrint,
    codeBlockBackgrounds:
      typeof value.codeBlockBackgrounds === 'boolean'
        ? value.codeBlockBackgrounds
        : fallback.codeBlockBackgrounds,
    preserveChecklistSymbols:
      typeof value.preserveChecklistSymbols === 'boolean'
        ? value.preserveChecklistSymbols
        : fallback.preserveChecklistSymbols,
  }
}

function validateTemplateId(value: unknown): TemplateId {
  return TEMPLATE_IDS.includes(value as TemplateId)
    ? (value as TemplateId)
    : DEFAULT_DOCUMENT_SETTINGS.templateId
}

/**
 * Rebuilds a valid, in-range DocumentSettings object from arbitrary (e.g.
 * user-imported) JSON, substituting defaults for anything missing or invalid.
 */
export function validateDocumentSettings(value: unknown): DocumentSettings {
  if (!isRecord(value)) return DEFAULT_DOCUMENT_SETTINGS
  return {
    templateId: validateTemplateId(value.templateId),
    page: validatePage(value.page),
    typography: validateTypography(value.typography),
    metadata: validateMetadata(value.metadata),
    headerFooter: validateHeaderFooter(value.headerFooter),
    content: validateContent(value.content),
  }
}
