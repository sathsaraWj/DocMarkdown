import { PDFDocument } from 'pdf-lib'

export interface PdfInspectionResult {
  ok: boolean
  pageCount: number | null
  title: string | null
  author: string | null
  createdAt: string | null
  encrypted: boolean
  error: string | null
}

const READ_ERROR: PdfInspectionResult = {
  ok: false,
  pageCount: null,
  title: null,
  author: null,
  createdAt: null,
  encrypted: false,
  error: 'This PDF could not be read. It may be corrupted or password-protected.',
}

const ENCRYPTED_ERROR: PdfInspectionResult = {
  ok: false,
  pageCount: null,
  title: null,
  author: null,
  createdAt: null,
  encrypted: true,
  error: 'Encrypted PDFs are not currently supported.',
}

/**
 * Loads a PDF locally with pdf-lib to determine whether it's readable,
 * whether it's encrypted, and its page count/metadata — never rendering or
 * logging the document's actual text content. `ignoreEncryption: true` lets
 * pdf-lib parse the structure of an encrypted file just far enough to detect
 * that it *is* encrypted, rather than throwing immediately; we still reject
 * encrypted files afterwards since their content streams can't be trusted.
 */
export async function inspectPdf(file: File): Promise<PdfInspectionResult> {
  let bytes: ArrayBuffer
  try {
    bytes = await file.arrayBuffer()
  } catch {
    return READ_ERROR
  }

  let pdfDoc: PDFDocument
  try {
    pdfDoc = await PDFDocument.load(bytes, { ignoreEncryption: true, updateMetadata: false })
  } catch {
    return READ_ERROR
  }

  if (pdfDoc.isEncrypted) {
    return ENCRYPTED_ERROR
  }

  let pageCount: number
  try {
    pageCount = pdfDoc.getPageCount()
  } catch {
    return READ_ERROR
  }

  if (!Number.isFinite(pageCount) || pageCount < 1) {
    return READ_ERROR
  }

  let title: string | null = null
  let author: string | null = null
  let createdAt: string | null = null

  try {
    title = pdfDoc.getTitle()?.trim() || null
  } catch {
    title = null
  }

  try {
    author = pdfDoc.getAuthor()?.trim() || null
  } catch {
    author = null
  }

  try {
    const created = pdfDoc.getCreationDate()
    createdAt = created ? created.toISOString() : null
  } catch {
    createdAt = null
  }

  return { ok: true, pageCount, title, author, createdAt, encrypted: false, error: null }
}
