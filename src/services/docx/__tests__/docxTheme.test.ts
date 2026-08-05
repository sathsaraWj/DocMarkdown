import { describe, expect, it } from 'vitest'

import { getTemplate } from '@/templates'
import { DEFAULT_DOCUMENT_SETTINGS } from '@/types/settings'
import { buildDocxTheme, mmToTwips } from '@/services/docx/docxTheme'

describe('mmToTwips', () => {
  it('converts millimeters to twips at 1440 twips per inch', () => {
    // 25.4mm = 1 inch = 1440 twips.
    expect(mmToTwips(25.4)).toBe(1440)
  })

  it('rounds to the nearest whole twip', () => {
    expect(Number.isInteger(mmToTwips(10))).toBe(true)
  })
})

describe('buildDocxTheme', () => {
  it('maps the sans font bucket to a real installed font name', () => {
    const template = getTemplate('clean')
    const theme = buildDocxTheme(DEFAULT_DOCUMENT_SETTINGS, template)
    expect(theme.bodyFont).toBe('Arial')
    expect(theme.headingFont).toBe('Arial')
    expect(theme.monoFont).toBe('Courier New')
  })

  it('maps the serif font bucket to Times New Roman', () => {
    const template = getTemplate('clean')
    const settings = {
      ...DEFAULT_DOCUMENT_SETTINGS,
      typography: { ...DEFAULT_DOCUMENT_SETTINGS.typography, fontFamily: 'serif' as const },
    }
    const theme = buildDocxTheme(settings, template)
    expect(theme.bodyFont).toBe('Times New Roman')
  })

  it('converts body font size to half-points', () => {
    const template = getTemplate('clean')
    const settings = {
      ...DEFAULT_DOCUMENT_SETTINGS,
      typography: { ...DEFAULT_DOCUMENT_SETTINGS.typography, bodyFontSize: 11 },
    }
    const theme = buildDocxTheme(settings, template)
    expect(theme.bodyFontSizeHalfPt).toBe(22)
  })

  it('applies a document color override on top of the template palette', () => {
    const template = getTemplate('clean')
    const settings = { ...DEFAULT_DOCUMENT_SETTINGS, colors: { accentColor: '#ff0000' } }
    const theme = buildDocxTheme(settings, template)
    expect(theme.accentColor).toBe('FF0000')
  })

  it('uses the template accent color unchanged with no overrides', () => {
    const template = getTemplate('clean')
    const theme = buildDocxTheme(DEFAULT_DOCUMENT_SETTINGS, template)
    expect(theme.accentColor).toBe('3B66F5')
  })
})
