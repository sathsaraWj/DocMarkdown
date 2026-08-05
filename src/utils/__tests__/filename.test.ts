import { describe, expect, it } from 'vitest'

import { buildFilename, sanitizeFilename } from '@/utils/filename'

describe('sanitizeFilename', () => {
  it('lowercases and hyphenates a normal title', () => {
    expect(sanitizeFilename('My Great Report')).toBe('my-great-report')
  })

  it('strips unsafe characters', () => {
    expect(sanitizeFilename('Report: Q1 / Final?.doc')).toBe('report-q1-final-doc')
  })

  it('collapses repeated separators', () => {
    expect(sanitizeFilename('a   --  b')).toBe('a-b')
  })

  it('falls back when the title sanitizes to nothing', () => {
    expect(sanitizeFilename('///???', 'document')).toBe('document')
    expect(sanitizeFilename('', 'document')).toBe('document')
  })

  it('avoids reserved Windows device names', () => {
    expect(sanitizeFilename('CON', 'document')).toBe('document')
    expect(sanitizeFilename('nul', 'document')).toBe('document')
  })

  it('truncates very long titles', () => {
    const long = 'a'.repeat(200)
    expect(sanitizeFilename(long).length).toBeLessThanOrEqual(80)
  })
})

describe('buildFilename', () => {
  it('appends the given extension', () => {
    expect(buildFilename('My Report', 'pdf')).toBe('my-report.pdf')
  })
})
