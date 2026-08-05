import { describe, expect, it } from 'vitest'

import { parseSettingsJson, settingsToJson } from '@/services/storage'
import { DEFAULT_DOCUMENT_SETTINGS } from '@/types/settings'

describe('settings import/export', () => {
  it('serializes settings to formatted JSON', () => {
    const json = settingsToJson(DEFAULT_DOCUMENT_SETTINGS)
    expect(() => JSON.parse(json)).not.toThrow()
    expect(json).toContain('"templateId"')
  })

  it('round-trips exported settings through import', () => {
    const json = settingsToJson(DEFAULT_DOCUMENT_SETTINGS)
    const { settings, error } = parseSettingsJson(json)
    expect(error).toBeNull()
    expect(settings).toEqual(DEFAULT_DOCUMENT_SETTINGS)
  })

  it('reports an error for invalid JSON', () => {
    const { settings, error } = parseSettingsJson('{not json')
    expect(settings).toBeNull()
    expect(error).toBeTruthy()
  })

  it('fills in defaults for a partial settings file', () => {
    const { settings } = parseSettingsJson(JSON.stringify({ templateId: 'resume' }))
    expect(settings?.templateId).toBe('resume')
    expect(settings?.page).toEqual(DEFAULT_DOCUMENT_SETTINGS.page)
  })
})
