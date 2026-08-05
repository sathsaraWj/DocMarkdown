import { describe, expect, it } from 'vitest'

import {
  detectPdfSignatureIssue,
  validatePdfBatch,
  validatePdfFileBasic,
} from '@/services/pdf/pdfFileValidation'
import { MERGE_PDF_LIMITS } from '@/types/mergePdf'

function makePdfFile(name: string, sizeBytes: number): File {
  const body = new Uint8Array(Math.max(sizeBytes, 0))
  return new File([body], name, { type: 'application/pdf' })
}

describe('validatePdfFileBasic', () => {
  it('accepts a plausible PDF file', () => {
    const result = validatePdfFileBasic(makePdfFile('report.pdf', 1024))
    expect(result.ok).toBe(true)
  })

  it('rejects a non-PDF extension', () => {
    const result = validatePdfFileBasic(makePdfFile('notes.txt', 1024))
    expect(result).toEqual({ ok: false, error: 'Only PDF files are supported.' })
  })

  it('rejects a mismatched MIME type', () => {
    const file = new File([new Uint8Array(10)], 'fake.pdf', { type: 'image/png' })
    const result = validatePdfFileBasic(file)
    expect(result).toEqual({ ok: false, error: 'Only PDF files are supported.' })
  })

  it('rejects an empty file', () => {
    const result = validatePdfFileBasic(makePdfFile('empty.pdf', 0))
    expect(result).toEqual({ ok: false, error: 'This file is empty and cannot be merged.' })
  })

  it('rejects a file over the individual size limit', () => {
    const result = validatePdfFileBasic(makePdfFile('huge.pdf', MERGE_PDF_LIMITS.maxFileSizeBytes + 1))
    expect(result.ok).toBe(false)
    if (!result.ok) expect(result.error).toContain('exceeds the')
  })
})

describe('detectPdfSignatureIssue', () => {
  it('accepts a file starting with the PDF header', async () => {
    const file = new File([new TextEncoder().encode('%PDF-1.7\n...')], 'real.pdf', {
      type: 'application/pdf',
    })
    expect(await detectPdfSignatureIssue(file)).toBeNull()
  })

  it('rejects a file without a PDF header', async () => {
    const file = new File([new TextEncoder().encode('not a pdf at all')], 'fake.pdf', {
      type: 'application/pdf',
    })
    const issue = await detectPdfSignatureIssue(file)
    expect(issue).toMatch(/could not be read/i)
  })
})

describe('validatePdfBatch', () => {
  it('accepts every valid file when under all limits', () => {
    const files = [makePdfFile('a.pdf', 100), makePdfFile('b.pdf', 200)]
    const result = validatePdfBatch(files, [])
    expect(result.accepted).toHaveLength(2)
    expect(result.rejected).toHaveLength(0)
  })

  it('rejects invalid files while keeping the valid ones from the same batch', () => {
    const files = [makePdfFile('good.pdf', 100), makePdfFile('bad.txt', 100)]
    const result = validatePdfBatch(files, [])
    expect(result.accepted.map((f) => f.name)).toEqual(['good.pdf'])
    expect(result.rejected).toEqual([{ name: 'bad.txt', reason: 'Only PDF files are supported.' }])
  })

  it('stops accepting files once the max file count is reached', () => {
    const existing = Array.from({ length: MERGE_PDF_LIMITS.maxFiles }, () => ({ size: 100 }))
    const result = validatePdfBatch([makePdfFile('overflow.pdf', 100)], existing)
    expect(result.accepted).toHaveLength(0)
    expect(result.rejected[0]?.reason).toContain(`up to ${MERGE_PDF_LIMITS.maxFiles}`)
  })

  it('stops accepting files once the combined size limit would be exceeded', () => {
    const existing = [{ size: MERGE_PDF_LIMITS.maxCombinedSizeBytes - 50 }]
    const result = validatePdfBatch([makePdfFile('toobig.pdf', 100)], existing)
    expect(result.accepted).toHaveLength(0)
    expect(result.rejected[0]?.reason).toContain('combined limit')
  })

  it('partially accepts a batch up to the combined size limit rather than discarding it all', () => {
    const roomLeft = 150
    const existing = [{ size: MERGE_PDF_LIMITS.maxCombinedSizeBytes - roomLeft }]
    const files = [makePdfFile('fits.pdf', 100), makePdfFile('too-much.pdf', 100)]
    const result = validatePdfBatch(files, existing)
    expect(result.accepted.map((f) => f.name)).toEqual(['fits.pdf'])
    expect(result.rejected.map((f) => f.name)).toEqual(['too-much.pdf'])
  })

  it('treats duplicate filenames as distinct files, both accepted', () => {
    const files = [makePdfFile('same.pdf', 100), makePdfFile('same.pdf', 200)]
    const result = validatePdfBatch(files, [])
    expect(result.accepted).toHaveLength(2)
  })
})
