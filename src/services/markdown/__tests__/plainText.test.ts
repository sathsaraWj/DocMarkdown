import { describe, expect, it } from 'vitest'

import { markdownToPlainText } from '@/services/markdown'

describe('markdownToPlainText', () => {
  it('returns an empty string for empty input', () => {
    expect(markdownToPlainText('')).toBe('')
    expect(markdownToPlainText('   ')).toBe('')
  })

  it('extracts heading and paragraph text without markup', () => {
    const text = markdownToPlainText('# Title\n\nSome **bold** and *italic* text.')
    expect(text).toContain('Title')
    expect(text).toContain('Some bold and italic text.')
    expect(text).not.toContain('#')
    expect(text).not.toContain('**')
  })

  it('renders unordered list items with dashes', () => {
    const text = markdownToPlainText('- one\n- two')
    expect(text).toContain('- one')
    expect(text).toContain('- two')
  })

  it('renders ordered list items with numbers', () => {
    const text = markdownToPlainText('1. first\n2. second')
    expect(text).toContain('1. first')
    expect(text).toContain('2. second')
  })

  it('preserves checklist state', () => {
    const text = markdownToPlainText('- [x] done\n- [ ] pending')
    expect(text).toContain('[x] done')
    expect(text).toContain('[ ] pending')
  })

  it('renders table rows as pipe-delimited text', () => {
    const text = markdownToPlainText('| A | B |\n| - | - |\n| 1 | 2 |')
    expect(text).toContain('A | B')
    expect(text).toContain('1 | 2')
  })

  it('keeps code block content readable', () => {
    const text = markdownToPlainText('```\nconst x = 1\n```')
    expect(text).toContain('const x = 1')
  })
})
