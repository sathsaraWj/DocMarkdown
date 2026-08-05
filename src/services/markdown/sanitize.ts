import DOMPurify, { type Config } from 'dompurify'

let hooksRegistered = false

function registerHooks(): void {
  if (hooksRegistered) return
  hooksRegistered = true

  DOMPurify.addHook('afterSanitizeAttributes', (node) => {
    if (node.tagName === 'A' && node.hasAttribute('href')) {
      const href = node.getAttribute('href') ?? ''
      const isExternal = /^[a-z][a-z0-9+.-]*:\/\//i.test(href) || href.startsWith('//')
      if (isExternal) {
        node.setAttribute('target', '_blank')
        node.setAttribute('rel', 'noopener noreferrer nofollow')
      } else {
        node.removeAttribute('target')
      }
    }
    if (node.tagName === 'IMG') {
      node.setAttribute('loading', 'lazy')
      node.setAttribute('referrerpolicy', 'no-referrer')
    }
  })
}

const SANITIZE_CONFIG: Config = {
  ADD_ATTR: ['target', 'rel', 'loading', 'referrerpolicy', 'aria-describedby', 'aria-label'],
  FORBID_TAGS: ['script', 'style', 'iframe', 'object', 'embed', 'form'],
  FORBID_ATTR: ['onerror', 'onload', 'onclick'],
}

/**
 * Sanitizes markdown-rendered HTML before it is ever inserted into the DOM.
 * Must be called on every render path (preview and every export format).
 */
export function sanitizeHtml(dirty: string): string {
  registerHooks()
  return DOMPurify.sanitize(dirty, SANITIZE_CONFIG)
}
