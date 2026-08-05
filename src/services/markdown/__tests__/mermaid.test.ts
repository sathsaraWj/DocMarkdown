import { describe, expect, it } from 'vitest'

import { renderMarkdown } from '@/services/markdown'
import {
  buildMermaidPlaceholder,
  hydrateMermaidDiagrams,
  MERMAID_DIAGRAM_CLASS,
  renderMermaidToSvg,
  resolveMermaidForStaticExport,
} from '@/services/markdown/mermaid'

describe('buildMermaidPlaceholder', () => {
  it('encodes the raw source into a data attribute and keeps an escaped fallback body', () => {
    const html = buildMermaidPlaceholder('flowchart LR\n  A --> B', 'flowchart LR\n  A --&gt; B')
    expect(html).toContain(`class="${MERMAID_DIAGRAM_CLASS}"`)
    expect(html).toContain(encodeURIComponent('flowchart LR\n  A --> B'))
    expect(html).toContain('<pre class="mermaid-diagram-source">flowchart LR\n  A --&gt; B</pre>')
  })
})

describe('renderMermaidToSvg', () => {
  it('falls back to an inline error box instead of throwing for unparseable input', async () => {
    const result = await renderMermaidToSvg('not a real diagram {{{')
    expect(result).toContain('mermaid-error')
  })
})

describe('hydrateMermaidDiagrams', () => {
  it('replaces every placeholder with the injected renderer output and clears the source attribute', async () => {
    const container = document.createElement('div')
    container.innerHTML =
      buildMermaidPlaceholder('flowchart LR\n  A --> B', 'flowchart LR\n  A --&gt; B') +
      buildMermaidPlaceholder('graph TD\n  X --> Y', 'graph TD\n  X --&gt; Y')

    const seen: string[] = []
    await hydrateMermaidDiagrams(container, async (source) => {
      seen.push(source)
      return `<svg data-fake="1">${source}</svg>`
    })

    expect(seen).toEqual(['flowchart LR\n  A --> B', 'graph TD\n  X --> Y'])
    const diagrams = container.querySelectorAll(`.${MERMAID_DIAGRAM_CLASS}`)
    expect(diagrams).toHaveLength(2)
    for (const el of diagrams) {
      expect(el.hasAttribute('data-mermaid-source')).toBe(false)
      expect(el.innerHTML).toContain('data-fake="1"')
    }
  })

  it('does nothing when there are no placeholders', async () => {
    const container = document.createElement('div')
    container.innerHTML = '<p>Just text.</p>'
    let called = false
    await hydrateMermaidDiagrams(container, async () => {
      called = true
      return ''
    })
    expect(called).toBe(false)
    expect(container.innerHTML).toBe('<p>Just text.</p>')
  })

  it('round-trips source text containing characters that must survive URI encoding', async () => {
    const source = 'flowchart LR\n  A[Has "quotes" & <brackets>] --> B{Decision?}'
    const container = document.createElement('div')
    container.innerHTML = buildMermaidPlaceholder(source, 'irrelevant fallback')

    let received = ''
    await hydrateMermaidDiagrams(container, async (s) => {
      received = s
      return '<svg></svg>'
    })

    expect(received).toBe(source)
  })
})

describe('resolveMermaidForStaticExport', () => {
  it('inlines rendered svg into the returned html string, preserving surrounding markup', async () => {
    const html = `<h1>Title</h1>${buildMermaidPlaceholder('flowchart LR\n  A --> B', 'fallback')}<p>After.</p>`
    const result = await resolveMermaidForStaticExport(
      html,
      async () => '<svg data-fake="1"></svg>',
    )

    expect(result).toContain('<h1>Title</h1>')
    expect(result).toContain('<p>After.</p>')
    expect(result).toContain('data-fake="1"')
    expect(result).not.toContain('data-mermaid-source')
  })

  it('returns the input unchanged when there are no diagrams', async () => {
    const html = '<p>No diagrams here.</p>'
    const result = await resolveMermaidForStaticExport(html, async () => '<svg></svg>')
    expect(result).toBe(html)
  })
})

describe('mermaid end-to-end through the markdown pipeline', () => {
  it('renders a ```mermaid fence to a placeholder div that survives sanitization', () => {
    const { html } = renderMarkdown('```mermaid\nflowchart LR\n  A[Markdown] --> B[Preview]\n```')
    expect(html).toContain(`class="${MERMAID_DIAGRAM_CLASS}"`)
    expect(html).toContain('data-mermaid-source')
    expect(html).toContain('mermaid-diagram-source')
  })

  it('does not treat a regular fenced code block as a mermaid diagram', () => {
    const { html } = renderMarkdown('```javascript\nconst x = 1\n```')
    expect(html).not.toContain(MERMAID_DIAGRAM_CLASS)
  })
})
