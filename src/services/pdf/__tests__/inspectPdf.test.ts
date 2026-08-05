import { readFileSync } from 'node:fs'
import path from 'node:path'
import { describe, expect, it, vi } from 'vitest'

const FIXTURES_DIR = path.resolve(__dirname, '../../../../e2e/fixtures')

function loadFixture(name: string): File {
  const bytes = readFileSync(path.join(FIXTURES_DIR, name))
  return new File([bytes], name, { type: 'application/pdf' })
}

describe('inspectPdf', () => {
  it('extracts page count for a plain single-page PDF', async () => {
    const { inspectPdf } = await import('@/services/pdf/inspectPdf')
    const result = await inspectPdf(loadFixture('pdf-single-page.pdf'))
    expect(result.ok).toBe(true)
    expect(result.pageCount).toBe(1)
    expect(result.encrypted).toBe(false)
  })

  it('extracts page count for a multi-page PDF', async () => {
    const { inspectPdf } = await import('@/services/pdf/inspectPdf')
    const result = await inspectPdf(loadFixture('pdf-multi-page.pdf'))
    expect(result.ok).toBe(true)
    expect(result.pageCount).toBe(5)
  })

  it('extracts title/author/creation-date metadata when present', async () => {
    const { inspectPdf } = await import('@/services/pdf/inspectPdf')
    const result = await inspectPdf(loadFixture('pdf-with-metadata.pdf'))
    expect(result.ok).toBe(true)
    expect(result.title).toBe('Merge PDF Fixture Document')
    expect(result.author).toBe('DocMarkdown Test Suite')
    expect(result.createdAt).toBe('2024-01-15T00:00:00.000Z')
  })

  it('returns null metadata (not an error) when a valid PDF has none set', async () => {
    const { inspectPdf } = await import('@/services/pdf/inspectPdf')
    const result = await inspectPdf(loadFixture('pdf-single-page.pdf'))
    expect(result.ok).toBe(true)
    expect(result.title).toBeNull()
    expect(result.author).toBeNull()
  })

  it('reports a friendly error for a corrupt PDF without crashing', async () => {
    const { inspectPdf } = await import('@/services/pdf/inspectPdf')
    const result = await inspectPdf(loadFixture('pdf-corrupt.pdf'))
    expect(result.ok).toBe(false)
    expect(result.error).toMatch(/could not be read/i)
  })

  it('reports a friendly error when the file cannot be read at all', async () => {
    const { inspectPdf } = await import('@/services/pdf/inspectPdf')
    const file = { arrayBuffer: () => Promise.reject(new Error('boom')) } as unknown as File
    const result = await inspectPdf(file)
    expect(result.ok).toBe(false)
    expect(result.error).toMatch(/could not be read/i)
  })

  it('flags an encrypted PDF as unsupported rather than attempting to merge it', async () => {
    vi.resetModules()
    vi.doMock('pdf-lib', () => ({
      PDFDocument: {
        load: vi.fn().mockResolvedValue({
          isEncrypted: true,
        }),
      },
    }))

    const { inspectPdf } = await import('@/services/pdf/inspectPdf')
    const result = await inspectPdf(loadFixture('pdf-single-page.pdf'))
    expect(result.ok).toBe(false)
    expect(result.encrypted).toBe(true)
    expect(result.error).toMatch(/encrypted pdfs are not currently supported/i)

    vi.doUnmock('pdf-lib')
    vi.resetModules()
  })
})
