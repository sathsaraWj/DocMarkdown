import { describe, expect, it } from 'vitest'

import { parsePageRange } from '@/services/pdf/parsePageRange'

describe('parsePageRange', () => {
  it('normalizes a mixed range/list into ascending, deduplicated pages', () => {
    const result = parsePageRange('1-3,6,8-10', 10)
    expect(result).toEqual({ ok: true, pages: [1, 2, 3, 6, 8, 9, 10], error: null })
  })

  it('parses a single page number', () => {
    const result = parsePageRange('4', 10)
    expect(result).toEqual({ ok: true, pages: [4], error: null })
  })

  it('sorts out-of-order tokens into ascending page order', () => {
    const result = parsePageRange('6,1-3', 10)
    expect(result.ok).toBe(true)
    expect(result.pages).toEqual([1, 2, 3, 6])
  })

  it('rejects empty input', () => {
    const result = parsePageRange('   ', 10)
    expect(result.ok).toBe(false)
    expect(result.error).toMatch(/enter a page range/i)
  })

  it('rejects invalid syntax', () => {
    const result = parsePageRange('abc', 10)
    expect(result.ok).toBe(false)
    expect(result.error).toMatch(/isn't a valid page or range/i)
  })

  it('rejects a reversed range', () => {
    const result = parsePageRange('5-2', 10)
    expect(result.ok).toBe(false)
    expect(result.error).toMatch(/reversed range/i)
  })

  it('rejects a page number below 1', () => {
    const result = parsePageRange('0-2', 10)
    expect(result.ok).toBe(false)
    expect(result.error).toMatch(/1 or greater/i)
  })

  it('rejects a page number beyond the document length', () => {
    const result = parsePageRange('1-3,15', 10)
    expect(result.ok).toBe(false)
    expect(result.error).toMatch(/beyond this document's last page/i)
  })

  it('rejects duplicate page numbers from a repeated single page', () => {
    const result = parsePageRange('1,2,2', 10)
    expect(result.ok).toBe(false)
    expect(result.error).toMatch(/listed more than once/i)
  })

  it('rejects duplicate page numbers from overlapping ranges', () => {
    const result = parsePageRange('1-3,2-4', 10)
    expect(result.ok).toBe(false)
    expect(result.error).toMatch(/listed more than once/i)
  })

  it('tolerates surrounding whitespace around tokens', () => {
    const result = parsePageRange(' 1 - 3 , 5 ', 10)
    expect(result).toEqual({ ok: true, pages: [1, 2, 3, 5], error: null })
  })
})
