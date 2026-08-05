const UNSAFE_CHARS = /[^a-z0-9]+/gi
const RESERVED_WINDOWS_NAMES = /^(con|prn|aux|nul|com[1-9]|lpt[1-9])$/i

/**
 * Builds a filesystem-safe filename (no extension) from a document title.
 * Falls back to a generic name when the title sanitizes to nothing usable.
 */
export function sanitizeFilename(title: string, fallback = 'document'): string {
  const trimmed = title
    .trim()
    .replace(UNSAFE_CHARS, '-')
    .replace(/^-+|-+$/g, '')
    .toLowerCase()
  const collapsed = trimmed.replace(/-{2,}/g, '-')
  if (!collapsed || RESERVED_WINDOWS_NAMES.test(collapsed)) return fallback
  return collapsed.slice(0, 80)
}

export function buildFilename(title: string, extension: string, fallback = 'document'): string {
  return `${sanitizeFilename(title, fallback)}.${extension}`
}
