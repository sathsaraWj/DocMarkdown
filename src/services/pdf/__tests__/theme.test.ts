import { describe, expect, it } from 'vitest'

import { getTemplate } from '@/templates'
import { DEFAULT_DOCUMENT_SETTINGS } from '@/types/settings'
import { buildPdfTheme } from '@/services/pdf/theme'

describe('buildPdfTheme', () => {
  it('uses the template palette when there are no color overrides', () => {
    const template = getTemplate('clean')
    const theme = buildPdfTheme(DEFAULT_DOCUMENT_SETTINGS, template)
    expect(theme.accentColor).toEqual([0x3b, 0x66, 0xf5])
  })

  it('applies a document color override on top of the template palette', () => {
    const template = getTemplate('clean')
    const settings = {
      ...DEFAULT_DOCUMENT_SETTINGS,
      colors: { accentColor: '#ff0000' },
    }
    const theme = buildPdfTheme(settings, template)
    expect(theme.accentColor).toEqual([0xff, 0, 0])
    // Non-overridden colors still come from the template.
    expect(theme.headingColor).toEqual(
      buildPdfTheme(DEFAULT_DOCUMENT_SETTINGS, template).headingColor,
    )
  })
})
