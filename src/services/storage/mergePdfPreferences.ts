import {
  DEFAULT_MERGE_PDF_FILENAME,
  DEFAULT_MERGE_PDF_OUTPUT_METADATA,
  type MergePdfOutputMetadata,
} from '@/types/mergePdf'

const STORAGE_KEY = 'docmarkdown:merge-pdf-preferences'

/**
 * Non-sensitive UI preferences only — never the selected PDF files
 * themselves. Raw PDFs are intentionally never persisted (see the Merge PDF
 * privacy notes), so a page refresh always starts from an empty file list
 * even though these preferences carry over.
 */
export interface MergePdfPreferences {
  filename: string
  metadata: MergePdfOutputMetadata
  pageRangeControlsExpanded: boolean
}

export const DEFAULT_MERGE_PDF_PREFERENCES: MergePdfPreferences = {
  filename: DEFAULT_MERGE_PDF_FILENAME,
  metadata: DEFAULT_MERGE_PDF_OUTPUT_METADATA,
  pageRangeControlsExpanded: false,
}

function isOutputMetadata(value: unknown): value is MergePdfOutputMetadata {
  if (typeof value !== 'object' || value === null) return false
  const obj = value as Record<string, unknown>
  return (
    typeof obj.title === 'string' &&
    typeof obj.author === 'string' &&
    typeof obj.subject === 'string' &&
    typeof obj.keywords === 'string'
  )
}

function migrate(raw: unknown): MergePdfPreferences | null {
  if (typeof raw !== 'object' || raw === null) return null
  const obj = raw as Record<string, unknown>

  return {
    filename: typeof obj.filename === 'string' ? obj.filename : DEFAULT_MERGE_PDF_FILENAME,
    metadata: isOutputMetadata(obj.metadata) ? obj.metadata : DEFAULT_MERGE_PDF_OUTPUT_METADATA,
    pageRangeControlsExpanded:
      typeof obj.pageRangeControlsExpanded === 'boolean' ? obj.pageRangeControlsExpanded : false,
  }
}

export function loadMergePdfPreferences(): MergePdfPreferences {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return DEFAULT_MERGE_PDF_PREFERENCES
    return migrate(JSON.parse(raw) as unknown) ?? DEFAULT_MERGE_PDF_PREFERENCES
  } catch {
    return DEFAULT_MERGE_PDF_PREFERENCES
  }
}

export function saveMergePdfPreferences(preferences: MergePdfPreferences): boolean {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(preferences))
    return true
  } catch {
    return false
  }
}
