import { readFileSync } from 'node:fs'
import path from 'node:path'
import { PDFDocument } from 'pdf-lib'
import { describe, expect, it, vi } from 'vitest'

import { mergePdfFiles } from '@/services/pdf/mergePdfFiles'
import { DEFAULT_MERGE_PDF_OUTPUT_METADATA } from '@/types/mergePdf'

const FIXTURES_DIR = path.resolve(__dirname, '../../../../e2e/fixtures')

function loadFixture(name: string): File {
  const bytes = readFileSync(path.join(FIXTURES_DIR, name))
  return new File([bytes], name, { type: 'application/pdf' })
}

describe('mergePdfFiles', () => {
  it('merges pages from multiple files in the given order', async () => {
    const result = await mergePdfFiles(
      [
        { id: 'a', file: loadFixture('pdf-single-page.pdf'), pages: [1] },
        { id: 'b', file: loadFixture('pdf-multi-page.pdf'), pages: [1, 2, 3, 4, 5] },
      ],
      DEFAULT_MERGE_PDF_OUTPUT_METADATA,
    )

    expect(result.pageCount).toBe(6)
    const bytes = new Uint8Array(await result.blob.arrayBuffer())
    const merged = await PDFDocument.load(bytes)
    expect(merged.getPageCount()).toBe(6)
  })

  it('respects a custom page selection and its order', async () => {
    const result = await mergePdfFiles(
      [{ id: 'a', file: loadFixture('pdf-multi-page.pdf'), pages: [3, 1] }],
      DEFAULT_MERGE_PDF_OUTPUT_METADATA,
    )
    expect(result.pageCount).toBe(2)
  })

  it('applies output metadata to the merged document', async () => {
    const result = await mergePdfFiles(
      [{ id: 'a', file: loadFixture('pdf-single-page.pdf'), pages: [1] }],
      { title: 'Combined Report', author: 'Test Author', subject: 'Testing', keywords: 'a, b' },
    )
    const bytes = new Uint8Array(await result.blob.arrayBuffer())
    const merged = await PDFDocument.load(bytes)
    expect(merged.getTitle()).toBe('Combined Report')
    expect(merged.getAuthor()).toBe('Test Author')
    expect(merged.getKeywords()).toBe('a b')
  })

  it('produces a non-empty PDF blob', async () => {
    const result = await mergePdfFiles(
      [{ id: 'a', file: loadFixture('pdf-single-page.pdf'), pages: [1] }],
      DEFAULT_MERGE_PDF_OUTPUT_METADATA,
    )
    expect(result.blob.size).toBeGreaterThan(0)
    expect(result.blob.type).toBe('application/pdf')
  })

  it('reports progress through reading, copying, and completion stages', async () => {
    const onProgress = vi.fn()
    await mergePdfFiles(
      [
        { id: 'a', file: loadFixture('pdf-single-page.pdf'), pages: [1] },
        { id: 'b', file: loadFixture('pdf-multi-page.pdf'), pages: [1] },
      ],
      DEFAULT_MERGE_PDF_OUTPUT_METADATA,
      onProgress,
    )

    const stages = onProgress.mock.calls.map(([progress]) => progress.stage)
    expect(stages).toContain('reading')
    expect(stages).toContain('copying')
    expect(stages).toContain('finalizing')
    expect(stages).toContain('complete')
    expect(onProgress.mock.calls.at(-1)?.[0]).toMatchObject({ stage: 'complete', percent: 100 })
  })

  it('throws a friendly error when a source file is corrupt', async () => {
    await expect(
      mergePdfFiles(
        [{ id: 'a', file: loadFixture('pdf-corrupt.pdf'), pages: [1] }],
        DEFAULT_MERGE_PDF_OUTPUT_METADATA,
      ),
    ).rejects.toThrow(/could not be merged|corrupted or password-protected/i)
  })
})
