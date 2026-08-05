import { describe, expect, it } from 'vitest'

import { readFileAsText, validateUploadFile } from '@/utils/fileUpload'

function makeFile(name: string, content: string, type = 'text/plain'): File {
  return new File([content], name, { type })
}

describe('validateUploadFile', () => {
  it('accepts .md files', () => {
    expect(validateUploadFile(makeFile('readme.md', '# Hi')).ok).toBe(true)
  })

  it('accepts .txt files', () => {
    expect(validateUploadFile(makeFile('notes.txt', 'hi')).ok).toBe(true)
  })

  it('rejects unsupported file types', () => {
    const result = validateUploadFile(makeFile('document.docx', 'binary'))
    expect(result.ok).toBe(false)
    if (!result.ok) expect(result.error).toContain('not a supported file type')
  })

  it('rejects files larger than the upload limit', () => {
    const oversized = new File([new Uint8Array(6 * 1024 * 1024)], 'big.md', {
      type: 'text/markdown',
    })
    const result = validateUploadFile(oversized)
    expect(result.ok).toBe(false)
    if (!result.ok) expect(result.error).toContain('exceeds')
  })
})

describe('readFileAsText', () => {
  it('resolves file contents for a valid file', async () => {
    const result = await readFileAsText(makeFile('a.md', '# Title'))
    expect(result.ok).toBe(true)
    expect(result.text).toBe('# Title')
  })

  it('resolves with an error for an invalid file without reading it', async () => {
    const result = await readFileAsText(makeFile('a.exe', 'binary'))
    expect(result.ok).toBe(false)
    expect(result.error).toBeTruthy()
  })
})
