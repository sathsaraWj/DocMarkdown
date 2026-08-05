import { readFileSync } from 'node:fs'
import path from 'node:path'
import { describe, expect, it } from 'vitest'

import { parseDocx } from '@/services/word/parseDocx'

const FIXTURES_DIR = path.resolve(__dirname, '../../../../e2e/fixtures')

function loadFixture(name: string): File {
  const bytes = readFileSync(path.join(FIXTURES_DIR, name))
  return new File([bytes], name)
}

describe('parseDocx', () => {
  it('converts a real .docx into sanitized HTML preserving structure', async () => {
    const file = loadFixture('sample.docx')
    const result = await parseDocx(file)

    expect(result.html).toContain('<h1')
    expect(result.html).toContain('Sample Report')
    expect(result.html).toContain('<strong>bold text</strong>')
    expect(result.html).toContain('<em>italic text</em>')
    expect(result.html).toContain('<ul>')
    expect(result.html).toContain('First item')
    expect(result.html).toContain('<table>')
    expect(result.html).toContain('Engineer')
    expect(result.html).toContain('href="https://example.com"')
    expect(result.html).toContain('target="_blank"')
    expect(result.html).toContain('<img')
  })

  it('extracts the document title from the first heading', async () => {
    const file = loadFixture('sample.docx')
    const result = await parseDocx(file)
    expect(result.title).toBe('Sample Report')
  })

  it('counts embedded images', async () => {
    const file = loadFixture('sample.docx')
    const result = await parseDocx(file)
    expect(result.imageCount).toBe(1)
  })

  it('surfaces parser messages as warnings', async () => {
    const file = loadFixture('sample.docx')
    const result = await parseDocx(file)
    expect(Array.isArray(result.warnings)).toBe(true)
    for (const warning of result.warnings) {
      expect(['warning', 'error']).toContain(warning.type)
      expect(typeof warning.message).toBe('string')
    }
  })

  it('throws a friendly error for a corrupt file', async () => {
    const file = loadFixture('corrupt.docx')
    await expect(parseDocx(file)).rejects.toThrow(/could not be read/i)
  })

  it('never leaves unsanitized script tags in the output', async () => {
    const file = loadFixture('sample.docx')
    const result = await parseDocx(file)
    expect(result.html).not.toContain('<script')
  })
})
