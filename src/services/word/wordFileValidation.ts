import { MAX_WORD_UPLOAD_SIZE_BYTES } from '@/utils/env'
import type { WordFileErrorCode, WordValidationError } from '@/types/word'

const DOCX_MIME = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
const LEGACY_DOC_MIME = 'application/msword'

/** ZIP local-file-header signature — every valid .docx (an OOXML zip) starts with this. */
const ZIP_SIGNATURE = [0x50, 0x4b, 0x03, 0x04]
/** OLE/CFB compound-file signature — legacy .doc files, and password-protected/encrypted .docx (Office wraps encrypted packages in an OLE container instead of a plain zip). */
const OLE_SIGNATURE = [0xd0, 0xcf, 0x11, 0xe0]

function formatSize(bytes: number): string {
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

function error(code: WordFileErrorCode, message: string): WordValidationError {
  return { code, message }
}

function hasExtension(filename: string, ext: string): boolean {
  return filename.toLowerCase().endsWith(ext)
}

/** Validates file name, MIME type, and size before any parsing is attempted. */
export function validateWordFile(file: File): { ok: true } | { ok: false; error: WordValidationError } {
  const name = file.name || 'document'

  if (hasExtension(name, '.doc') && !hasExtension(name, '.docx')) {
    return {
      ok: false,
      error: error(
        'legacy-doc',
        'Legacy .doc files are not supported. Please save the document as .docx and try again.',
      ),
    }
  }

  if (!hasExtension(name, '.docx')) {
    return {
      ok: false,
      error: error('invalid-type', 'Only .docx Word documents are currently supported.'),
    }
  }

  // MIME type is a secondary sanity check only — browsers/OSes don't reliably
  // set it for every file, so we only reject a clearly-wrong, non-empty value.
  if (file.type && file.type !== DOCX_MIME) {
    if (file.type === LEGACY_DOC_MIME) {
      return {
        ok: false,
        error: error(
          'legacy-doc',
          'Legacy .doc files are not supported. Please save the document as .docx and try again.',
        ),
      }
    }
    if (!file.type.includes('officedocument') && !file.type.includes('zip')) {
      return {
        ok: false,
        error: error('invalid-type', 'Only .docx Word documents are currently supported.'),
      }
    }
  }

  if (file.size === 0) {
    return {
      ok: false,
      error: error('empty', 'This file is empty and cannot be converted.'),
    }
  }

  if (file.size > MAX_WORD_UPLOAD_SIZE_BYTES) {
    return {
      ok: false,
      error: error(
        'too-large',
        `This file is larger than the ${formatSize(MAX_WORD_UPLOAD_SIZE_BYTES)} upload limit.`,
      ),
    }
  }

  return { ok: true }
}

function bytesStartWith(bytes: Uint8Array, signature: number[]): boolean {
  if (bytes.length < signature.length) return false
  return signature.every((byte, index) => bytes[index] === byte)
}

/**
 * Peeks at the file's magic bytes to catch corrupt or password-protected
 * files before handing them to the parser. A real .docx is a zip archive
 * (starts with "PK"); Word wraps password-protected documents in an OLE
 * compound-file container instead, which has a distinct, detectable signature.
 */
export async function detectWordFileSignatureIssue(file: File): Promise<WordValidationError | null> {
  try {
    const head = await file.slice(0, 8).arrayBuffer()
    const bytes = new Uint8Array(head)

    if (bytesStartWith(bytes, OLE_SIGNATURE)) {
      return error(
        'password-protected',
        'The document could not be read. It may be corrupted or password-protected.',
      )
    }

    if (!bytesStartWith(bytes, ZIP_SIGNATURE)) {
      return error(
        'corrupt',
        'The document could not be read. It may be corrupted or password-protected.',
      )
    }

    return null
  } catch {
    return error(
      'corrupt',
      'The document could not be read. It may be corrupted or password-protected.',
    )
  }
}
