import { MERMAID_DIAGRAM_CLASS, renderMermaidToSvg } from './mermaid'

/** Rasterizes an SVG string to a PNG data URI via an offscreen canvas, since jsPDF and the docx writer can only embed raster images. */
function svgToPngDataUrl(svg: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const blob = new Blob([svg], { type: 'image/svg+xml;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const img = new Image()

    img.onload = () => {
      const scale = 2
      const canvas = document.createElement('canvas')
      canvas.width = Math.max(1, img.naturalWidth) * scale
      canvas.height = Math.max(1, img.naturalHeight) * scale
      const ctx = canvas.getContext('2d')
      URL.revokeObjectURL(url)
      if (!ctx) {
        reject(new Error('Canvas 2D context is unavailable'))
        return
      }
      // Mermaid SVGs have a transparent background; PDF/DOCX pages need an opaque one.
      ctx.fillStyle = '#ffffff'
      ctx.fillRect(0, 0, canvas.width, canvas.height)
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
      resolve(canvas.toDataURL('image/png'))
    }
    img.onerror = () => {
      URL.revokeObjectURL(url)
      reject(new Error('Failed to rasterize Mermaid diagram'))
    }
    img.src = url
  })
}

export interface RasterizeMermaidOptions {
  renderSvg?: (source: string) => Promise<string>
  rasterize?: (svg: string) => Promise<string>
}

/**
 * Replaces every Mermaid placeholder in an HTML string with a single-image
 * paragraph containing a rasterized PNG. Emitting `<p><img></p>` (rather
 * than the div) means the existing image-block detection in
 * htmlToBlocks.ts's `isImageOnlyParagraph` picks it up with no changes of
 * its own, and `resolveImageDimensions` already knows how to size a
 * `data:image/` src - both PDF and DOCX export reuse this same output.
 */
export async function rasterizeMermaidDiagrams(
  html: string,
  options: RasterizeMermaidOptions = {},
): Promise<string> {
  const renderSvg = options.renderSvg ?? renderMermaidToSvg
  const rasterize = options.rasterize ?? svgToPngDataUrl

  const doc = new DOMParser().parseFromString(html, 'text/html')
  const nodes = Array.from(
    doc.querySelectorAll<HTMLElement>(`.${MERMAID_DIAGRAM_CLASS}[data-mermaid-source]`),
  )
  if (nodes.length === 0) return html

  await Promise.all(
    nodes.map(async (el) => {
      const source = decodeURIComponent(el.getAttribute('data-mermaid-source') ?? '')
      const svg = await renderSvg(source)

      if (svg.includes('mermaid-error')) {
        const p = doc.createElement('p')
        p.textContent = 'Diagram error: this Mermaid diagram could not be parsed.'
        el.replaceWith(p)
        return
      }

      try {
        const pngDataUrl = await rasterize(svg)
        const p = doc.createElement('p')
        const img = doc.createElement('img')
        img.setAttribute('src', pngDataUrl)
        img.setAttribute('alt', 'Mermaid diagram')
        p.appendChild(img)
        el.replaceWith(p)
      } catch {
        const p = doc.createElement('p')
        p.textContent = 'Diagram could not be rendered for export.'
        el.replaceWith(p)
      }
    }),
  )

  return doc.body.innerHTML
}
