import { describe, expect, it } from 'vitest'

import { renderMarkdown } from '@/services/markdown'

describe('renderMarkdown', () => {
  it('renders headings, paragraphs, and assigns heading ids', () => {
    const { html, toc } = renderMarkdown('# Hello World\n\nA paragraph.')
    expect(html).toContain('<h1 id="hello-world">')
    expect(html).toContain('<p>A paragraph.</p>')
    expect(toc).toEqual([{ id: 'hello-world', text: 'Hello World', depth: 1 }])
  })

  it('renders GFM tables', () => {
    const md = '| A | B |\n| - | - |\n| 1 | 2 |'
    const { html } = renderMarkdown(md)
    expect(html).toContain('<table>')
    expect(html).toContain('<th>A</th>')
    expect(html).toContain('<td>1</td>')
  })

  it('renders task list checkboxes', () => {
    const { html } = renderMarkdown('- [x] done\n- [ ] todo')
    expect(html).toContain('type="checkbox"')
    expect(html).toContain('checked')
  })

  it('renders fenced code blocks with a language class', () => {
    const { html } = renderMarkdown('```javascript\nconst x = 1\n```')
    expect(html).toContain('language-javascript')
    expect(html).toContain('const')
  })

  it('applies heading numbering when enabled', () => {
    const { html } = renderMarkdown('# Title\n\n## First\n\n## Second', { headingNumbering: true })
    expect(html).toContain('1. </span>')
    expect(html).toContain('2. </span>')
  })

  it('handles escaped characters', () => {
    const { html } = renderMarkdown('\\*not italic\\*')
    expect(html).toContain('*not italic*')
  })

  it('renders footnote references and a footnotes section', () => {
    const md = 'Here is a note.[^1]\n\n[^1]: The footnote text.'
    const { html } = renderMarkdown(md)
    expect(html).toContain('footnote-ref')
    expect(html).toContain('The footnote text.')
    expect(html).toContain('Footnotes')
  })

  it('does not throw on malformed input and still returns a string', () => {
    expect(() => renderMarkdown('# Unclosed **bold')).not.toThrow()
    const { html } = renderMarkdown('# Unclosed **bold')
    expect(typeof html).toBe('string')
  })

  it('marks external links safely and leaves internal anchors alone', () => {
    const { html } = renderMarkdown('[external](https://example.com) and [internal](#section)')
    expect(html).toContain('target="_blank"')
    expect(html).toContain('rel="noopener noreferrer nofollow"')
    expect(html).toContain('href="#section"')
  })
})
