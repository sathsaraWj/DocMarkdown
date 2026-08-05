import { readFileSync } from 'node:fs'
import path from 'node:path'
import { describe, expect, it } from 'vitest'

import { detectWordFileSignatureIssue, validateWordFile } from '@/services/word/wordFileValidation'

const FIXTURES_DIR = path.resolve(__dirname, '../../../../e2e/fixtures')

function loadFixture(name: string, type = ''): File {
  const bytes = readFileSync(path.join(FIXTURES_DIR, name))
  return new File([bytes], name, { type })
}

function makeFile(name: string, content: string, type = ''): File {
  return new File([content], name, { type })
}

describe('validateWordFile', () => {
  it('accepts a well-formed .docx file', () => {
    const file = loadFixture(
      'sample.docx',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    )
    expect(validateWordFile(file)).toEqual({ ok: true })
  })

  it('rejects legacy .doc files with a specific message', () => {
    const file = makeFile('report.doc', 'anything', 'application/msword')
    const result = validateWordFile(file)
    expect(result.ok).toBe(false)
    if (!result.ok) {
      expect(result.error.code).toBe('legacy-doc')
      expect(result.error.message).toContain('Legacy .doc files are not supported')
      expect(result.error.message).toContain('.docx')
    }
  })

  it('rejects unrelated file types', () => {
    const file = makeFile('notes.txt', 'hello', 'text/plain')
    const result = validateWordFile(file)
    expect(result.ok).toBe(false)
    if (!result.ok) {
      expect(result.error.code).toBe('invalid-type')
      expect(result.error.message).toBe('Only .docx Word documents are currently supported.')
    }
  })

  it('rejects empty files', () => {
    const file = makeFile('empty.docx', '', '')
    const result = validateWordFile(file)
    expect(result.ok).toBe(false)
    if (!result.ok) expect(result.error.code).toBe('empty')
  })

  it('rejects files larger than the upload limit', () => {
    const oversized = new File([new Uint8Array(11 * 1024 * 1024)], 'big.docx')
    const result = validateWordFile(oversized)
    expect(result.ok).toBe(false)
    if (!result.ok) {
      expect(result.error.code).toBe('too-large')
      expect(result.error.message).toContain('larger than the')
      expect(result.error.message).toContain('upload limit')
    }
  })

  it('rejects a .docx with a clearly-wrong non-empty MIME type', () => {
    const file = makeFile('sneaky.docx', 'not really a docx', 'image/png')
    const result = validateWordFile(file)
    expect(result.ok).toBe(false)
    if (!result.ok) expect(result.error.code).toBe('invalid-type')
  })
})

describe('detectWordFileSignatureIssue', () => {
  it('passes a real .docx (zip signature)', async () => {
    const file = loadFixture('sample.docx')
    const issue = await detectWordFileSignatureIssue(file)
    expect(issue).toBeNull()
  })

  it('flags a corrupt file that is not a zip at all', async () => {
    const file = loadFixture('corrupt.docx')
    const issue = await detectWordFileSignatureIssue(file)
    expect(issue).not.toBeNull()
    expect(issue?.code).toBe('corrupt')
  })

  it('flags an OLE/compound-file signature as likely password-protected', async () => {
    const oleHeader = new Uint8Array([0xd0, 0xcf, 0x11, 0xe0, 0xa1, 0xb1, 0x1a, 0xe1])
    const file = new File([oleHeader], 'protected.docx')
    const issue = await detectWordFileSignatureIssue(file)
    expect(issue?.code).toBe('password-protected')
    expect(issue?.message).toContain('password-protected')
  })
})
