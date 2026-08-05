import { describe, expect, it } from 'vitest'

import { renderMarkdown } from '@/services/markdown'
import { extractMath, restoreMath } from '@/services/markdown/math'

describe('extractMath', () => {
  it('extracts a block math expression and replaces it with a placeholder', () => {
    const { content, blocks } = extractMath('Before\n\n$$\nE = mc^2\n$$\n\nAfter')
    expect(content).not.toContain('$$')
    expect(blocks.size).toBe(1)
    const [rendered] = blocks.values()
    expect(rendered).toContain('katex')
  })

  it('extracts inline math that looks like real LaTeX', () => {
    const { content, blocks } = extractMath('The formula $x^2 + y^2 = z^2$ is famous.')
    expect(content).not.toContain('$x^2')
    expect(blocks.size).toBe(1)
  })

  it('leaves plain currency amounts alone (a known, documented limitation)', () => {
    const { content, blocks } = extractMath('It costs $5 and $10 respectively.')
    expect(content).toBe('It costs $5 and $10 respectively.')
    expect(blocks.size).toBe(0)
  })

  it('restoreMath substitutes every token back with its rendered HTML', () => {
    const { content, blocks } = extractMath('$$a+b$$')
    const html = restoreMath(`<p>${content}</p>`, blocks)
    expect(html).toContain('katex')
    expect(html).not.toMatch(/[]/)
  })

  it('returns the input unchanged when there is no math at all', () => {
    const { content, blocks } = extractMath('# Just a heading\n\nAnd text.')
    expect(content).toBe('# Just a heading\n\nAnd text.')
    expect(blocks.size).toBe(0)
  })
})

describe('math end-to-end through the markdown pipeline', () => {
  it('renders KaTeX markup that survives DOMPurify sanitization', () => {
    const { html } = renderMarkdown('Einstein: $$E = mc^2$$')
    expect(html).toContain('katex')
    expect(html).not.toMatch(/[]/)
  })

  it('renders inline math alongside normal prose', () => {
    const { html } = renderMarkdown('We know that $a^2+b^2=c^2$ for right triangles.')
    expect(html).toContain('katex')
    expect(html).toContain('right triangles')
  })

  it('never executes or injects a script tag even for a maliciously crafted math source', () => {
    const { html } = renderMarkdown('$$\\htmlClass{x}{<script>alert(1)</script>}$$')
    expect(html).not.toContain('<script')
  })
})
