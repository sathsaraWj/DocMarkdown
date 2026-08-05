import { DEFAULT_MERGE_PDF_FILENAME } from '@/types/mergePdf'

// eslint-disable-next-line no-control-regex -- deliberately stripping ASCII control characters from filenames
const UNSAFE_FILENAME_CHARS = /[\\/:*?"<>|\x00-\x1f]/g
const MAX_BASENAME_LENGTH = 150

/**
 * Turns arbitrary user input into a safe merged-PDF filename: strips
 * characters that are unsafe across filesystems, collapses whitespace,
 * guarantees a non-empty base name, caps length, and ensures a single
 * ".pdf" extension (case-insensitive) regardless of what the user typed.
 */
export function sanitizeMergeOutputFilename(raw: string): string {
  let name = raw.trim().replace(UNSAFE_FILENAME_CHARS, '')
  name = name.replace(/\s+/g, ' ').trim()

  const base = (/\.pdf$/i.test(name) ? name.slice(0, -4) : name).trim()
  const safeBase = base.slice(0, MAX_BASENAME_LENGTH).trim()

  if (!safeBase) return DEFAULT_MERGE_PDF_FILENAME
  return `${safeBase}.pdf`
}
