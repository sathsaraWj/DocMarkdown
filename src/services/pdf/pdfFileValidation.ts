import { MERGE_PDF_LIMITS } from '@/types/mergePdf'
import type { MergePdfRejectedFile } from '@/types/mergePdf'

const PDF_MIME = 'application/pdf'
/** Every PDF starts with this header, optionally after a few bytes of junk some generators prepend. */
const PDF_SIGNATURE = '%PDF-'

function formatSize(bytes: number): string {
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

function hasPdfExtension(filename: string): boolean {
  return filename.toLowerCase().endsWith('.pdf')
}

/** Extension/MIME/empty/individual-size checks — cheap, synchronous-ish checks done before reading file bytes. */
export function validatePdfFileBasic(file: File): { ok: true } | { ok: false; error: string } {
  if (!hasPdfExtension(file.name)) {
    return { ok: false, error: 'Only PDF files are supported.' }
  }

  if (file.type && file.type !== PDF_MIME) {
    return { ok: false, error: 'Only PDF files are supported.' }
  }

  if (file.size === 0) {
    return { ok: false, error: 'This file is empty and cannot be merged.' }
  }

  if (file.size > MERGE_PDF_LIMITS.maxFileSizeBytes) {
    return {
      ok: false,
      error: `This PDF exceeds the ${formatSize(MERGE_PDF_LIMITS.maxFileSizeBytes)} individual file limit.`,
    }
  }

  return { ok: true }
}

/** Peeks at the file header to catch obviously corrupt files before handing them to pdf-lib. */
export async function detectPdfSignatureIssue(file: File): Promise<string | null> {
  try {
    const head = await file.slice(0, 1024).arrayBuffer()
    const text = new TextDecoder('latin1').decode(head)
    if (!text.includes(PDF_SIGNATURE)) {
      return 'This PDF could not be read. It may be corrupted or password-protected.'
    }
    return null
  } catch {
    return 'This PDF could not be read. It may be corrupted or password-protected.'
  }
}

export interface PdfBatchValidationResult {
  accepted: File[]
  rejected: MergePdfRejectedFile[]
}

/**
 * Applies per-file checks plus batch-level count/combined-size limits to a
 * newly selected set of files, given the files already in the list. Accepts
 * files in order until a limit is hit rather than discarding the whole
 * batch — the combined-size and count limits are evaluated against the
 * running total so a batch of otherwise-valid files can be partially added.
 */
export function validatePdfBatch(
  newFiles: File[],
  existingFiles: { size: number }[],
): PdfBatchValidationResult {
  const accepted: File[] = []
  const rejected: MergePdfRejectedFile[] = []

  let runningCount = existingFiles.length
  let runningSize = existingFiles.reduce((sum, f) => sum + f.size, 0)

  for (const file of newFiles) {
    const basic = validatePdfFileBasic(file)
    if (!basic.ok) {
      rejected.push({ name: file.name, reason: basic.error })
      continue
    }

    if (runningCount + 1 > MERGE_PDF_LIMITS.maxFiles) {
      rejected.push({
        name: file.name,
        reason: `You can merge up to ${MERGE_PDF_LIMITS.maxFiles} PDF files at a time.`,
      })
      continue
    }

    if (runningSize + file.size > MERGE_PDF_LIMITS.maxCombinedSizeBytes) {
      rejected.push({
        name: file.name,
        reason: `The selected files exceed the ${formatSize(MERGE_PDF_LIMITS.maxCombinedSizeBytes)} combined limit.`,
      })
      continue
    }

    accepted.push(file)
    runningCount += 1
    runningSize += file.size
  }

  return { accepted, rejected }
}
