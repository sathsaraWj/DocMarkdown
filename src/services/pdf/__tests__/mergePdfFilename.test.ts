import { describe, expect, it } from 'vitest'

import { sanitizeMergeOutputFilename } from '@/services/pdf/mergePdfFilename'

describe('sanitizeMergeOutputFilename', () => {
  it('appends .pdf when missing', () => {
    expect(sanitizeMergeOutputFilename('Quarterly Report')).toBe('Quarterly Report.pdf')
  })

  it('does not duplicate the .pdf extension', () => {
    expect(sanitizeMergeOutputFilename('Quarterly Report.pdf')).toBe('Quarterly Report.pdf')
  })

  it('normalizes the extension casing to .pdf', () => {
    expect(sanitizeMergeOutputFilename('Report.PDF')).toBe('Report.pdf')
  })

  it('removes unsafe filesystem characters', () => {
    expect(sanitizeMergeOutputFilename('Report:<Final>/v2?.pdf')).toBe('ReportFinalv2.pdf')
  })

  it('falls back to the default name when input sanitizes to nothing usable', () => {
    expect(sanitizeMergeOutputFilename('///???')).toBe('merged-document.pdf')
  })

  it('falls back to the default name for empty input', () => {
    expect(sanitizeMergeOutputFilename('   ')).toBe('merged-document.pdf')
  })

  it('caps excessively long filenames', () => {
    const longName = 'a'.repeat(300)
    const result = sanitizeMergeOutputFilename(longName)
    expect(result.length).toBeLessThanOrEqual(154) // 150 + ".pdf"
    expect(result.endsWith('.pdf')).toBe(true)
  })

  it('collapses internal whitespace runs', () => {
    expect(sanitizeMergeOutputFilename('My    Report')).toBe('My Report.pdf')
  })
})
