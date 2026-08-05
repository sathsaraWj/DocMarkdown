import { DEFAULT_DOCUMENT_SETTINGS, type DocumentSettings } from './settings'

export type WordFileErrorCode =
  | 'invalid-type'
  | 'legacy-doc'
  | 'too-large'
  | 'empty'
  | 'corrupt'
  | 'password-protected'

export interface WordValidationError {
  code: WordFileErrorCode
  message: string
}

export type WordMessageType = 'warning' | 'error'

export interface WordParseMessage {
  type: WordMessageType
  message: string
}

export interface WordParseResult {
  /** Sanitized HTML, safe to render via dangerouslySetInnerHTML. */
  html: string
  warnings: WordParseMessage[]
  /** Best-effort title extracted from the document's first heading, if any. */
  title: string | null
  /** Number of images found in the source document (before any include/exclude filtering). */
  imageCount: number
}

export type WordExportFormat = 'pdf' | 'html' | 'text'

export type WordConversionStatus =
  | 'idle'
  | 'validating'
  | 'parsing'
  | 'ready'
  | 'ready-with-warnings'
  | 'invalid'
  | 'error'

export interface WordImageOptions {
  includeImages: boolean
  compressImages: boolean
  /** JPEG re-encode quality, 0.1–1. Only used when compressImages is enabled. */
  imageQuality: number
}

export const DEFAULT_WORD_IMAGE_OPTIONS: WordImageOptions = {
  includeImages: true,
  compressImages: false,
  imageQuality: 0.8,
}

export const WORD_IMAGE_QUALITY_LIMITS = { min: 0.3, max: 1 } as const

export interface WordConversionSettings {
  /** Page, typography, metadata, header/footer, content, and template — reused wholesale from the Markdown converter. */
  document: DocumentSettings
  /** When true, the selected DocMarkdown template's typography/colors are applied instead of a neutral default rendering. */
  normalizeStyling: boolean
  images: WordImageOptions
}

export const DEFAULT_WORD_CONVERSION_SETTINGS: WordConversionSettings = {
  document: DEFAULT_DOCUMENT_SETTINGS,
  normalizeStyling: false,
  images: DEFAULT_WORD_IMAGE_OPTIONS,
}

/** Formatting features Word supports that browser-based conversion cannot faithfully reproduce. */
export const WORD_FORMATTING_LIMITATIONS: readonly string[] = [
  'Complex page layouts',
  'Text boxes',
  'Floating images',
  'SmartArt',
  'Charts',
  'Shapes',
  'Macros',
  'Embedded files',
  'Advanced headers and footers',
  'Section-specific margins',
  'Track changes',
  'Comments',
  'Custom fonts',
  'Complex tables',
  'Footnotes and endnotes',
  'Watermarks',
  'Multi-column layouts',
]
