import { describe, expect, it } from 'vitest'

import { wordHtmlToPlainText } from '@/services/word/wordToPlainText'

describe('wordHtmlToPlainText', () => {
  it('returns an empty string for empty input', () => {
    expect(wordHtmlToPlainText('')).toBe('')
    expect(wordHtmlToPlainText('   ')).toBe('')
  })

  it('extracts heading and paragraph text without markup', () => {
    const text = wordHtmlToPlainText('<h1>Title</h1><p>Some <strong>bold</strong> text.</p>')
    expect(text).toContain('Title')
    expect(text).toContain('Some bold text.')
    expect(text).not.toContain('<')
  })

  it('renders list items with dashes', () => {
    const text = wordHtmlToPlainText('<ul><li>One</li><li>Two</li></ul>')
    expect(text).toContain('- One')
    expect(text).toContain('- Two')
  })

  it('renders table rows as pipe-delimited text', () => {
    const text = wordHtmlToPlainText(
      '<table><tr><th>Name</th><th>Role</th></tr><tr><td>Ada</td><td>Engineer</td></tr></table>',
    )
    expect(text).toContain('Name | Role')
    expect(text).toContain('Ada | Engineer')
  })

  it('shows a placeholder for images', () => {
    const text = wordHtmlToPlainText('<p><img src="data:image/png;base64,AA==" alt="A logo"></p>')
    expect(text).toContain('[Image: A logo]')
  })
})
