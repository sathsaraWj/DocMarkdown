import { describe, expect, it } from 'vitest'

import { beautifyMarkdown } from '@/services/markdown/beautify'

describe('beautifyMarkdown', () => {
  it('trims trailing whitespace on every line', () => {
    const result = beautifyMarkdown('Some text   \nAnother line\t\t\n')
    expect(result).toBe('Some text\nAnother line\n')
  })

  it('collapses three or more blank lines down to a single blank line', () => {
    const result = beautifyMarkdown('First\n\n\n\n\nSecond\n')
    expect(result).toBe('First\n\nSecond\n')
  })

  it('ensures exactly one blank line before and after a heading', () => {
    const result = beautifyMarkdown('Intro text\n# Heading\nBody text\n')
    expect(result).toBe('Intro text\n\n# Heading\n\nBody text\n')
  })

  it('does not add a stray blank line between two adjacent headings', () => {
    const result = beautifyMarkdown('# Title\n## Subtitle\n')
    expect(result).toBe('# Title\n\n## Subtitle\n')
  })

  it('normalizes excess whitespace after heading hashes to a single space', () => {
    const result = beautifyMarkdown('##    Extra spaced heading\n')
    expect(result).toBe('## Extra spaced heading\n')
  })

  it('does not turn a non-heading line starting with # into a heading', () => {
    const result = beautifyMarkdown('#hashtag is just text\n')
    expect(result).toBe('#hashtag is just text\n')
  })

  it('normalizes * and + unordered list bullets to -, preserving indentation', () => {
    const result = beautifyMarkdown('* first\n  + nested\n- already correct\n')
    expect(result).toBe('- first\n  - nested\n- already correct\n')
  })

  it('does not mistake bold/italic emphasis for a list bullet', () => {
    const result = beautifyMarkdown('**bold text** and *italic text* stay untouched\n')
    expect(result).toBe('**bold text** and *italic text* stay untouched\n')
  })

  it('leaves an asterisk-style thematic break alone rather than treating it as a bullet', () => {
    const result = beautifyMarkdown('Before\n\n***\n\nAfter\n')
    expect(result).toBe('Before\n\n***\n\nAfter\n')
  })

  it('never modifies content inside fenced code blocks', () => {
    const source =
      '```javascript\nconst x = 1;   \n*  not a bullet inside code\n#not a heading\n```\n'
    const result = beautifyMarkdown(source)
    expect(result).toBe(source)
  })

  it('trims leading blank lines and ensures exactly one trailing newline', () => {
    const result = beautifyMarkdown('\n\n\n# Title\n\nBody\n\n\n\n')
    expect(result).toBe('# Title\n\nBody\n')
  })

  it('normalizes CRLF line endings to LF', () => {
    const result = beautifyMarkdown('Line one\r\nLine two\r\n')
    expect(result).toBe('Line one\nLine two\n')
  })

  it('is idempotent - beautifying already-clean markdown leaves it unchanged', () => {
    const clean = '# Title\n\nA paragraph.\n\n- one\n- two\n\n## Section\n\nMore text.\n'
    expect(beautifyMarkdown(clean)).toBe(clean)
  })
})
