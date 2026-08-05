import { describe, expect, it } from 'vitest'

import { sanitizeHtml } from '@/services/markdown'

describe('sanitizeHtml', () => {
  it('strips script tags', () => {
    const result = sanitizeHtml('<p>hello</p><script>alert(1)</script>')
    expect(result).not.toContain('<script>')
    expect(result).toContain('<p>hello</p>')
  })

  it('removes inline event handler attributes', () => {
    const result = sanitizeHtml('<img src="x.png" onerror="alert(1)">')
    expect(result).not.toContain('onerror')
  })

  it('neutralizes javascript: URLs', () => {
    const result = sanitizeHtml('<a href="javascript:alert(1)">click</a>')
    expect(result).not.toContain('javascript:')
  })

  it('preserves safe formatting and table markup', () => {
    const result = sanitizeHtml(
      '<table><tr><th>H</th></tr><tr><td>D</td></tr></table><strong>bold</strong>',
    )
    expect(result).toContain('<table>')
    expect(result).toContain('<strong>bold</strong>')
  })

  it('adds target and rel to external links', () => {
    const result = sanitizeHtml('<a href="https://example.com">link</a>')
    expect(result).toContain('target="_blank"')
    expect(result).toContain('rel="noopener noreferrer nofollow"')
  })

  it('preserves disabled checkboxes for task lists', () => {
    const result = sanitizeHtml('<input type="checkbox" checked disabled>')
    expect(result).toContain('type="checkbox"')
    expect(result).toContain('checked')
  })
})
