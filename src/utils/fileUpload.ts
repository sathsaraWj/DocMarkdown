import { MAX_UPLOAD_SIZE_BYTES } from './env'

const ALLOWED_EXTENSIONS = ['.md', '.markdown', '.txt']

export interface FileLoadResult {
  ok: boolean
  text?: string
  error?: string
}

function hasAllowedExtension(filename: string): boolean {
  const lower = filename.toLowerCase()
  return ALLOWED_EXTENSIONS.some((ext) => lower.endsWith(ext))
}

function formatSize(bytes: number): string {
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

export function validateUploadFile(file: File): { ok: true } | { ok: false; error: string } {
  if (!hasAllowedExtension(file.name)) {
    return {
      ok: false,
      error: `"${file.name}" is not a supported file type. Upload a .md or .txt file.`,
    }
  }
  if (file.size > MAX_UPLOAD_SIZE_BYTES) {
    return {
      ok: false,
      error: `"${file.name}" is ${formatSize(file.size)}, which exceeds the ${formatSize(MAX_UPLOAD_SIZE_BYTES)} upload limit.`,
    }
  }
  return { ok: true }
}

export function readFileAsText(file: File): Promise<FileLoadResult> {
  const validation = validateUploadFile(file)
  if (!validation.ok) {
    return Promise.resolve({ ok: false, error: validation.error })
  }

  return new Promise((resolve) => {
    const reader = new FileReader()
    reader.onload = () => {
      resolve({ ok: true, text: typeof reader.result === 'string' ? reader.result : '' })
    }
    reader.onerror = () => {
      resolve({ ok: false, error: `Could not read "${file.name}". The file may be corrupted.` })
    }
    reader.readAsText(file)
  })
}
