import {
  MAX_MERGE_PDF_COMBINED_SIZE_BYTES,
  MAX_MERGE_PDF_FILES,
  MAX_MERGE_PDF_FILE_SIZE_BYTES,
} from '@/utils/env'

export const MERGE_PDF_LIMITS = {
  maxFiles: MAX_MERGE_PDF_FILES,
  maxFileSizeBytes: MAX_MERGE_PDF_FILE_SIZE_BYTES,
  maxCombinedSizeBytes: MAX_MERGE_PDF_COMBINED_SIZE_BYTES,
} as const

export type MergePdfFileStatus = 'validating' | 'ready' | 'invalid' | 'encrypted'

export type PageRangeMode = 'all' | 'custom'

export interface MergePdfRejectedFile {
  name: string
  reason: string
}

/** One selected PDF and everything learned about it after local inspection. */
export interface MergePdfFileEntry {
  /** Stable identity independent of filename — duplicate filenames are different entries. */
  id: string
  file: File
  name: string
  size: number
  lastModified: number
  status: MergePdfFileStatus
  errorMessage: string | null
  pageCount: number | null
  title: string | null
  author: string | null
  createdAt: string | null
  encrypted: boolean
  pageRangeMode: PageRangeMode
  /** Raw text the user typed for a custom range, e.g. "1-3,6,8-10". */
  pageRangeInput: string
  /** Normalized, validated 1-based page numbers to copy, in ascending order. Null while invalid/unresolved. */
  resolvedPages: number[] | null
  pageRangeError: string | null
}

export interface MergePdfOutputMetadata {
  title: string
  author: string
  subject: string
  keywords: string
}

export const DEFAULT_MERGE_PDF_OUTPUT_METADATA: MergePdfOutputMetadata = {
  title: '',
  author: '',
  subject: '',
  keywords: '',
}

export const DEFAULT_MERGE_PDF_FILENAME = 'merged-document.pdf'

export interface MergePdfSettings {
  filename: string
  metadata: MergePdfOutputMetadata
}

export const DEFAULT_MERGE_PDF_SETTINGS: MergePdfSettings = {
  filename: DEFAULT_MERGE_PDF_FILENAME,
  metadata: DEFAULT_MERGE_PDF_OUTPUT_METADATA,
}

export type MergePdfStage =
  | 'reading'
  | 'preparing'
  | 'copying'
  | 'finalizing'
  | 'downloading'
  | 'complete'

export interface MergePdfProgress {
  stage: MergePdfStage
  currentFileIndex: number
  totalFiles: number
  currentFileName: string | null
  percent: number
}

export type MergeRunStatus = 'idle' | 'merging' | 'success' | 'error'

export interface MergePdfResult {
  blob: Blob
  filename: string
  sourceFileCount: number
  pageCount: number
  fileSize: number
}

/** Genuine, tested limitations of the pdf-lib-based merge — surfaced in the UI, not just docs. */
export const MERGE_PDF_LIMITATIONS: readonly string[] = [
  'Bookmarks and the source documents’ outline/table of contents are not carried over',
  'Digital signatures on source PDFs are invalidated once their pages are copied into a new document',
  'Password-protected or otherwise encrypted PDFs cannot be opened or merged',
  'Interactive form fields may lose their values or become read-only after merging',
  'Document-level JavaScript, embedded file attachments, and layers (OCGs) are not preserved',
]
