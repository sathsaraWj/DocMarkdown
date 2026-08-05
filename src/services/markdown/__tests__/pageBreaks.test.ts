import { describe, expect, it } from 'vitest'

import { extractPageBreaks } from '@/services/markdown/pageBreaks'
import { renderMarkdown } from '@/services/markdown'
import { htmlToBlocks } from '@/services/pdf/htmlToBlocks'

describe('extractPageBreaks', () => {
  it('converts a standalone \\pagebreak line into the shared page-break marker', () => {
    const result = extractPageBreaks('Before\n\n\\pagebreak\n\nAfter')
    expect(result).toBe('Before\n\n<hr class="docx-page-break">\n\nAfter')
  })

  it('does not touch \\pagebreak when it is not alone on its own line', () => {
    const result = extractPageBreaks('See \\pagebreak here for details.')
    expect(result).toBe('See \\pagebreak here for details.')
  })

  it('leaves markdown without any page break unchanged', () => {
    const result = extractPageBreaks('# Title\n\nSome text.')
    expect(result).toBe('# Title\n\nSome text.')
  })
})

describe('\\pagebreak end-to-end through the markdown pipeline', () => {
  it('renders to an hr.docx-page-break element that htmlToBlocks recognizes as a page break', () => {
    const { html } = renderMarkdown('# Title\n\nFirst page.\n\n\\pagebreak\n\nSecond page.')
    expect(html).toContain('docx-page-break')

    const blocks = htmlToBlocks(html)
    expect(blocks.some((b) => b.type === 'page-break')).toBe(true)
  })
})
