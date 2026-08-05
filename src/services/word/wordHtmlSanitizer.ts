import { sanitizeHtml } from '@/services/markdown'

/**
 * Sanitizes HTML extracted from a Word document before it is ever inserted
 * into the DOM. Mammoth performs no sanitization of its own (its docs
 * explicitly warn that source documents can contain `javascript:` links),
 * so every conversion must pass through here.
 *
 * Reuses the exact same DOMPurify configuration as the Markdown pipeline —
 * the threat model (untrusted external links, images, arbitrary markup) is
 * identical, so there is no reason to maintain a second sanitizer.
 */
export function sanitizeWordHtml(dirty: string): string {
  return sanitizeHtml(dirty)
}
