import mermaid from 'mermaid'

import { sanitizeHtml } from './sanitize'

/** Marker class the Markdown code-block renderer emits for ```mermaid fences, and that every consumer (preview hydration, HTML export, PDF/DOCX rasterization) looks for. */
export const MERMAID_DIAGRAM_CLASS = 'mermaid-diagram'

let initialized = false
let counter = 0

function ensureInitialized(): void {
  if (initialized) return
  initialized = true
  // securityLevel 'strict' disables mermaid's own script/click-handler
  // injection, keeping diagram rendering inert like the rest of the
  // sanitized preview pipeline.
  mermaid.initialize({ startOnLoad: false, securityLevel: 'strict', theme: 'default' })
}

/** Builds the placeholder markup the Markdown `code` renderer inserts for a ```mermaid fence, before any client-side hydration has run. */
export function buildMermaidPlaceholder(source: string, escapedSource: string): string {
  return `<div class="${MERMAID_DIAGRAM_CLASS}" data-mermaid-source="${encodeURIComponent(source)}"><pre class="mermaid-diagram-source">${escapedSource}</pre></div>\n`
}

/** Renders raw Mermaid source to sanitized SVG markup, falling back to an inline error box for invalid diagram syntax rather than throwing. */
export async function renderMermaidToSvg(source: string): Promise<string> {
  ensureInitialized()
  try {
    const id = `mermaid-diagram-${counter++}`
    const { svg } = await mermaid.render(id, source)
    return sanitizeHtml(svg)
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unable to render diagram'
    return `<div class="mermaid-error" role="alert">Invalid Mermaid diagram: ${message}</div>`
  }
}

/**
 * Hydrates every not-yet-rendered Mermaid placeholder under `root` with its
 * rendered SVG. Used by the live preview after each render pass - Mermaid
 * rendering is async (unlike KaTeX), so diagrams necessarily appear a beat
 * after the rest of the preview.
 *
 * `renderSvg` is injectable so tests can exercise the DOM-traversal/token-
 * decoding logic without depending on Mermaid's real layout engine, which
 * requires SVG text-measurement APIs (`getBBox`) that jsdom doesn't implement.
 */
export async function hydrateMermaidDiagrams(
  root: ParentNode,
  renderSvg: (source: string) => Promise<string> = renderMermaidToSvg,
): Promise<void> {
  const pending = Array.from(
    root.querySelectorAll<HTMLElement>(`.${MERMAID_DIAGRAM_CLASS}[data-mermaid-source]`),
  )
  if (pending.length === 0) return

  await Promise.all(
    pending.map(async (el) => {
      const encoded = el.getAttribute('data-mermaid-source') ?? ''
      el.removeAttribute('data-mermaid-source')
      const source = decodeURIComponent(encoded)
      el.innerHTML = await renderSvg(source)
    }),
  )
}

/**
 * Resolves every Mermaid placeholder in a standalone HTML string to inline
 * SVG and returns the updated markup. Used for the self-contained HTML
 * export, which (unlike the PDF/DOCX pipelines) can embed live SVG directly
 * with no rasterization step and no script dependency in the output file.
 */
export async function resolveMermaidForStaticExport(
  html: string,
  renderSvg: (source: string) => Promise<string> = renderMermaidToSvg,
): Promise<string> {
  const doc = new DOMParser().parseFromString(html, 'text/html')
  await hydrateMermaidDiagrams(doc, renderSvg)
  return doc.body.innerHTML
}
