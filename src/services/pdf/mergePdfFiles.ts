import { PDFDocument } from 'pdf-lib'

import type { MergePdfOutputMetadata, MergePdfProgress, MergePdfStage } from '@/types/mergePdf'

export interface MergeSourceFile {
  id: string
  file: File
  /** 1-based page numbers to copy, in the exact order they should appear in the output. */
  pages: number[]
}

export interface MergePdfFilesResult {
  blob: Blob
  pageCount: number
}

export type MergeProgressCallback = (progress: MergePdfProgress) => void

function report(
  onProgress: MergeProgressCallback | undefined,
  stage: MergePdfStage,
  currentFileIndex: number,
  totalFiles: number,
  currentFileName: string | null,
): void {
  if (!onProgress) return
  const percent =
    stage === 'complete'
      ? 100
      : Math.min(95, Math.round((currentFileIndex / Math.max(totalFiles, 1)) * 90))
  onProgress({ stage, currentFileIndex, totalFiles, currentFileName, percent })
}

function friendlyMergeError(fileName: string): Error {
  return new Error(`Could not merge "${fileName}". It may be corrupted or password-protected.`)
}

/** Loads one source file and copies its selected pages into `mergedPdf`, wrapping any failure in a user-safe error. */
async function copySourceIntoMerged(
  mergedPdf: PDFDocument,
  source: MergeSourceFile,
  index: number,
  totalFiles: number,
  onProgress: MergeProgressCallback | undefined,
): Promise<void> {
  report(onProgress, 'reading', index, totalFiles, source.file.name)

  let sourceDoc: PDFDocument
  try {
    const bytes = await source.file.arrayBuffer()
    sourceDoc = await PDFDocument.load(bytes, { ignoreEncryption: true, updateMetadata: false })
  } catch {
    throw friendlyMergeError(source.file.name)
  }

  if (sourceDoc.isEncrypted) {
    throw friendlyMergeError(source.file.name)
  }

  report(onProgress, 'copying', index, totalFiles, source.file.name)
  try {
    const pageIndices = source.pages.map((page) => page - 1)
    const copiedPages = await mergedPdf.copyPages(sourceDoc, pageIndices)
    for (const page of copiedPages) mergedPdf.addPage(page)
  } catch {
    throw friendlyMergeError(source.file.name)
  }
}

function applyOutputMetadata(mergedPdf: PDFDocument, metadata: MergePdfOutputMetadata): void {
  if (metadata.title.trim()) mergedPdf.setTitle(metadata.title.trim())
  if (metadata.author.trim()) mergedPdf.setAuthor(metadata.author.trim())
  if (metadata.subject.trim()) mergedPdf.setSubject(metadata.subject.trim())
  if (metadata.keywords.trim()) {
    mergedPdf.setKeywords(
      metadata.keywords
        .split(',')
        .map((keyword) => keyword.trim())
        .filter(Boolean),
    )
  }
  mergedPdf.setProducer('DocMarkdown')
  mergedPdf.setCreationDate(new Date())
}

/**
 * Reads each source PDF in the given order, copies exactly the selected
 * pages (already resolved by parsePageRange), and produces a single merged
 * PDF. Runs sequentially rather than in parallel — this keeps peak memory
 * bounded to roughly one source file at a time, which matters more here
 * than raw speed since batches can include up to the configured file-count
 * and combined-size limits.
 */
export async function mergePdfFiles(
  sources: MergeSourceFile[],
  metadata: MergePdfOutputMetadata,
  onProgress?: MergeProgressCallback,
): Promise<MergePdfFilesResult> {
  const totalFiles = sources.length
  report(onProgress, 'preparing', 0, totalFiles, null)

  const mergedPdf = await PDFDocument.create()

  for (let index = 0; index < sources.length; index += 1) {
    const source = sources[index]
    if (source) await copySourceIntoMerged(mergedPdf, source, index, totalFiles, onProgress)
  }

  report(onProgress, 'finalizing', totalFiles, totalFiles, null)
  applyOutputMetadata(mergedPdf, metadata)

  report(onProgress, 'downloading', totalFiles, totalFiles, null)
  const bytes = await mergedPdf.save()
  // pdf-lib types `save()` as Uint8Array<ArrayBufferLike>, which TS's DOM lib
  // won't accept as a BlobPart (it wants a concrete ArrayBuffer, never a
  // SharedArrayBuffer) — safe to assert here since this is always a plain,
  // freshly-allocated Uint8Array at runtime.
  const blob = new Blob([bytes as unknown as BlobPart], { type: 'application/pdf' })
  const pageCount = mergedPdf.getPageCount()

  report(onProgress, 'complete', totalFiles, totalFiles, null)

  return { blob, pageCount }
}
