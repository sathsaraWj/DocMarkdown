import { describe, expect, it } from 'vitest'

import { buildMermaidPlaceholder } from '@/services/markdown/mermaid'
import { rasterizeMermaidDiagrams } from '@/services/markdown/mermaidRaster'

describe('rasterizeMermaidDiagrams', () => {
  it('replaces a diagram placeholder with a single-image paragraph', async () => {
    const html = `<h1>Title</h1>${buildMermaidPlaceholder('flowchart LR\n  A --> B', 'fallback')}`
    const result = await rasterizeMermaidDiagrams(html, {
      renderSvg: async () => '<svg width="100" height="50"></svg>',
      rasterize: async () => 'data:image/png;base64,FAKE',
    })

    expect(result).toContain('<h1>Title</h1>')
    expect(result).toContain('<p><img src="data:image/png;base64,FAKE" alt="Mermaid diagram"></p>')
    expect(result).not.toContain('mermaid-diagram')
  })

  it('replaces multiple diagrams independently', async () => {
    const html =
      buildMermaidPlaceholder('flowchart LR\n  A --> B', 'a') +
      buildMermaidPlaceholder('graph TD\n  X --> Y', 'b')
    let calls = 0
    const result = await rasterizeMermaidDiagrams(html, {
      renderSvg: async () => '<svg></svg>',
      rasterize: async () => `data:image/png;base64,IMG${calls++}`,
    })
    expect(result).toContain('IMG0')
    expect(result).toContain('IMG1')
  })

  it('falls back to a text paragraph when the diagram fails to parse', async () => {
    const html = buildMermaidPlaceholder('garbage {{{', 'fallback')
    const result = await rasterizeMermaidDiagrams(html, {
      renderSvg: async () => '<div class="mermaid-error">Invalid Mermaid diagram: boom</div>',
    })
    expect(result).toContain('could not be parsed')
    expect(result).not.toContain('<img')
  })

  it('falls back to a text paragraph when rasterization itself fails', async () => {
    const html = buildMermaidPlaceholder('flowchart LR\n  A --> B', 'fallback')
    const result = await rasterizeMermaidDiagrams(html, {
      renderSvg: async () => '<svg></svg>',
      rasterize: async () => {
        throw new Error('canvas unsupported')
      },
    })
    expect(result).toContain('could not be rendered for export')
    expect(result).not.toContain('<img')
  })

  it('returns the input unchanged when there are no diagrams', async () => {
    const html = '<p>Nothing to see here.</p>'
    const result = await rasterizeMermaidDiagrams(html)
    expect(result).toBe(html)
  })
})
