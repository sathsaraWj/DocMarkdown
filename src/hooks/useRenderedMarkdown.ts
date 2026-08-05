import { useEffect, useState } from 'react'

import { renderMarkdown } from '@/services/markdown'
import type { TocItem } from '@/services/markdown'

export interface RenderedMarkdown {
  html: string
  toc: TocItem[]
  isRendering: boolean
}

const DEBOUNCE_MS = 250

/** Debounces Markdown -> sanitized HTML rendering so large documents don't re-parse on every keystroke. */
export function useRenderedMarkdown(
  markdown: string,
  headingNumbering: boolean,
  generateToc: boolean,
): RenderedMarkdown {
  const [state, setState] = useState(() => ({
    ...renderMarkdown(markdown, { headingNumbering, generateToc }),
    isRendering: false,
  }))

  useEffect(() => {
    let cancelled = false
    setState((prev) => ({ ...prev, isRendering: true }))
    const handle = setTimeout(() => {
      if (cancelled) return
      const result = renderMarkdown(markdown, { headingNumbering, generateToc })
      setState({ ...result, isRendering: false })
    }, DEBOUNCE_MS)
    return () => {
      cancelled = true
      clearTimeout(handle)
    }
  }, [markdown, headingNumbering, generateToc])

  return state
}
