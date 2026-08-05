import type { DocumentSettings } from '@/types/settings'
import type { DocumentTemplate } from '@/types/template'
import { buildStandaloneHtml } from './htmlExport'

/**
 * Prints the current document via the browser's native print dialog. Reuses
 * the same standalone-HTML builder as the HTML export (sanitized content,
 * embedded @page CSS, inline Mermaid SVG) so what prints matches what
 * exports, and renders it in a detached same-origin iframe rather than a new
 * tab/window - nothing leaves the page and no popup blocker can interfere.
 */
export async function printDocument(
  markdown: string,
  settings: DocumentSettings,
  template: DocumentTemplate,
): Promise<void> {
  const { html } = await buildStandaloneHtml(markdown, settings, template)

  return new Promise<void>((resolve) => {
    const iframe = document.createElement('iframe')
    iframe.setAttribute('aria-hidden', 'true')
    iframe.style.position = 'fixed'
    iframe.style.width = '0'
    iframe.style.height = '0'
    iframe.style.border = '0'
    iframe.style.visibility = 'hidden'

    let settled = false
    const cleanup = () => {
      if (settled) return
      settled = true
      iframe.remove()
      resolve()
    }

    iframe.onload = () => {
      const win = iframe.contentWindow
      if (!win) {
        cleanup()
        return
      }
      win.addEventListener('afterprint', cleanup, { once: true })
      win.focus()
      win.print()
      // Fallback in case `afterprint` never fires (dialog cancelled in some browsers).
      setTimeout(cleanup, 60_000)
    }

    document.body.appendChild(iframe)
    iframe.srcdoc = html
  })
}
