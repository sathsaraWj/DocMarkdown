import { describe, expect, it } from 'vitest'

import { validateDocumentSettings } from '@/services/storage'
import { DEFAULT_DOCUMENT_SETTINGS } from '@/types/settings'

describe('validateDocumentSettings', () => {
  it('returns defaults for non-object input', () => {
    expect(validateDocumentSettings(null)).toEqual(DEFAULT_DOCUMENT_SETTINGS)
    expect(validateDocumentSettings('nonsense')).toEqual(DEFAULT_DOCUMENT_SETTINGS)
    expect(validateDocumentSettings(undefined)).toEqual(DEFAULT_DOCUMENT_SETTINGS)
  })

  it('accepts a fully valid settings object unchanged', () => {
    expect(validateDocumentSettings(DEFAULT_DOCUMENT_SETTINGS)).toEqual(DEFAULT_DOCUMENT_SETTINGS)
  })

  it('rejects an unknown template id and falls back to the default', () => {
    const result = validateDocumentSettings({ ...DEFAULT_DOCUMENT_SETTINGS, templateId: 'made-up' })
    expect(result.templateId).toBe(DEFAULT_DOCUMENT_SETTINGS.templateId)
  })

  it('clamps out-of-range typography values', () => {
    const result = validateDocumentSettings({
      ...DEFAULT_DOCUMENT_SETTINGS,
      typography: { ...DEFAULT_DOCUMENT_SETTINGS.typography, bodyFontSize: 999 },
    })
    expect(result.typography.bodyFontSize).toBeLessThanOrEqual(18)
  })

  it('clamps negative margins to zero', () => {
    const result = validateDocumentSettings({
      ...DEFAULT_DOCUMENT_SETTINGS,
      page: {
        ...DEFAULT_DOCUMENT_SETTINGS.page,
        marginPreset: 'custom',
        margins: { top: -50, right: 20, bottom: 20, left: 20 },
      },
    })
    expect(result.page.margins.top).toBe(0)
  })

  it('rejects an invalid page size and falls back to the default', () => {
    const result = validateDocumentSettings({
      ...DEFAULT_DOCUMENT_SETTINGS,
      page: { ...DEFAULT_DOCUMENT_SETTINGS.page, size: 'Tabloid' },
    })
    expect(result.page.size).toBe(DEFAULT_DOCUMENT_SETTINGS.page.size)
  })

  it('substitutes defaults for non-boolean content option values', () => {
    const result = validateDocumentSettings({
      ...DEFAULT_DOCUMENT_SETTINGS,
      content: { ...DEFAULT_DOCUMENT_SETTINGS.content, generateToc: 'yes' },
    })
    expect(result.content.generateToc).toBe(DEFAULT_DOCUMENT_SETTINGS.content.generateToc)
  })

  it('truncates excessively long metadata strings', () => {
    const result = validateDocumentSettings({
      ...DEFAULT_DOCUMENT_SETTINGS,
      metadata: { ...DEFAULT_DOCUMENT_SETTINGS.metadata, title: 'x'.repeat(1000) },
    })
    expect(result.metadata.title.length).toBeLessThanOrEqual(500)
  })

  it('accepts valid hex color overrides', () => {
    const result = validateDocumentSettings({
      ...DEFAULT_DOCUMENT_SETTINGS,
      colors: { accentColor: '#ff0000', bodyColor: '#123ABC' },
    })
    expect(result.colors).toEqual({ accentColor: '#ff0000', bodyColor: '#123ABC' })
  })

  it('drops invalid or unknown color override entries', () => {
    const result = validateDocumentSettings({
      ...DEFAULT_DOCUMENT_SETTINGS,
      colors: {
        accentColor: 'not-a-color',
        headingColor: 'red',
        bodyColor: '#12',
        somethingUnknown: '#ffffff',
      },
    })
    expect(result.colors).toEqual({})
  })

  it('defaults to an empty color override object when missing entirely', () => {
    const { colors: _colors, ...rest } = DEFAULT_DOCUMENT_SETTINGS
    const result = validateDocumentSettings(rest)
    expect(result.colors).toEqual({})
  })
})
