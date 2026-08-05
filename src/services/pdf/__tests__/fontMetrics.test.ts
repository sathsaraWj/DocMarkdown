import { describe, expect, it } from 'vitest'

import { EMBEDDED_FONTS, mapDocxFontNameToEmbeddedId } from '@/services/pdf/fontMetrics'

describe('mapDocxFontNameToEmbeddedId', () => {
  it('maps Calibri and its close relatives to Carlito', () => {
    expect(mapDocxFontNameToEmbeddedId('Calibri')).toBe('carlito')
    expect(mapDocxFontNameToEmbeddedId('Aptos')).toBe('carlito')
    expect(mapDocxFontNameToEmbeddedId('Candara')).toBe('carlito')
  })

  it('maps Cambria and Georgia to Caladea', () => {
    expect(mapDocxFontNameToEmbeddedId('Cambria')).toBe('caladea')
    expect(mapDocxFontNameToEmbeddedId('Georgia')).toBe('caladea')
  })

  it('maps Arial and its relatives to Arimo', () => {
    expect(mapDocxFontNameToEmbeddedId('Arial')).toBe('arimo')
    expect(mapDocxFontNameToEmbeddedId('Verdana')).toBe('arimo')
    expect(mapDocxFontNameToEmbeddedId('Tahoma')).toBe('arimo')
  })

  it('maps Times New Roman to Tinos', () => {
    expect(mapDocxFontNameToEmbeddedId('Times New Roman')).toBe('tinos')
  })

  it('maps Courier New and Consolas to Cousine', () => {
    expect(mapDocxFontNameToEmbeddedId('Courier New')).toBe('cousine')
    expect(mapDocxFontNameToEmbeddedId('Consolas')).toBe('cousine')
  })

  it('is case-insensitive and tolerates surrounding whitespace', () => {
    expect(mapDocxFontNameToEmbeddedId('  CALIBRI  ')).toBe('carlito')
    expect(mapDocxFontNameToEmbeddedId('arial')).toBe('arimo')
  })

  it('falls back to Arimo for an unknown or missing font name', () => {
    expect(mapDocxFontNameToEmbeddedId('Some Custom Corporate Font')).toBe('arimo')
    expect(mapDocxFontNameToEmbeddedId(null)).toBe('arimo')
    expect(mapDocxFontNameToEmbeddedId(undefined)).toBe('arimo')
    expect(mapDocxFontNameToEmbeddedId('')).toBe('arimo')
  })

  it('exposes a substituteFor label for every embedded font, for UI disclosure', () => {
    for (const info of Object.values(EMBEDDED_FONTS)) {
      expect(info.substituteFor.length).toBeGreaterThan(0)
      expect(info.pdfName.length).toBeGreaterThan(0)
      expect(info.cssName.length).toBeGreaterThan(0)
    }
  })
})
