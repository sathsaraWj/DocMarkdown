import type { WordImageOptions } from '@/types/word'

const MAX_IMAGE_DIMENSION_PX = 1600
const IMAGE_LOAD_TIMEOUT_MS = 4000

function recompressDataUri(dataUri: string, quality: number): Promise<string | null> {
  return new Promise((resolve) => {
    let settled = false
    const settle = (value: string | null) => {
      if (settled) return
      settled = true
      clearTimeout(timeoutId)
      resolve(value)
    }
    // Guards against a hung compression pass (and therefore a hung export)
    // if the browser never fires either load or error for this image.
    const timeoutId = setTimeout(() => settle(null), IMAGE_LOAD_TIMEOUT_MS)

    const image = new Image()
    image.onload = () => {
      const scale = Math.min(
        1,
        MAX_IMAGE_DIMENSION_PX / Math.max(image.naturalWidth, image.naturalHeight),
      )
      const width = Math.max(1, Math.round(image.naturalWidth * scale))
      const height = Math.max(1, Math.round(image.naturalHeight * scale))

      const canvas = document.createElement('canvas')
      canvas.width = width
      canvas.height = height
      const context = canvas.getContext('2d')
      if (!context) {
        settle(null)
        return
      }
      context.drawImage(image, 0, 0, width, height)
      try {
        settle(canvas.toDataURL('image/jpeg', quality))
      } catch {
        settle(null)
      } finally {
        canvas.width = 0
        canvas.height = 0
      }
    }
    image.onerror = () => settle(null)
    image.src = dataUri
  })
}

/**
 * Applies the "include images" / "compress images" settings to Word-derived
 * HTML. Images are re-encoded one at a time (not in parallel) to bound peak
 * memory use for documents with many large embedded images.
 */
export async function applyWordImageOptions(html: string, options: WordImageOptions): Promise<string> {
  if (options.includeImages && !options.compressImages) return html

  const doc = new DOMParser().parseFromString(html, 'text/html')
  const images = Array.from(doc.querySelectorAll('img'))
  if (images.length === 0) return html

  if (!options.includeImages) {
    for (const img of images) {
      const placeholder = doc.createElement('span')
      placeholder.className = 'docx-image-omitted'
      placeholder.textContent = `[Image omitted: ${img.getAttribute('alt') || 'untitled'}]`
      img.replaceWith(placeholder)
    }
    return doc.body.innerHTML
  }

  for (const img of images) {
    const src = img.getAttribute('src')
    if (!src?.startsWith('data:image/')) continue
    const compressed = await recompressDataUri(src, options.imageQuality)
    if (compressed) img.setAttribute('src', compressed)
  }

  return doc.body.innerHTML
}
