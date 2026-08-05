import { beforeEach, describe, expect, it } from 'vitest'

import {
  clearPersistedState,
  isStorageAvailable,
  loadPersistedState,
  savePersistedState,
} from '@/services/storage'
import { DEFAULT_DOCUMENT_SETTINGS } from '@/types/settings'
import { STORAGE_SCHEMA_VERSION } from '@/types/storage'

describe('persistedState storage', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('reports storage as available in a normal browser environment', () => {
    expect(isStorageAvailable()).toBe(true)
  })

  it('returns null when nothing has been saved', () => {
    expect(loadPersistedState()).toBeNull()
  })

  it('round-trips a saved state', () => {
    const state = {
      version: STORAGE_SCHEMA_VERSION,
      markdown: '# Hello',
      settings: DEFAULT_DOCUMENT_SETTINGS,
      theme: 'dark' as const,
      lastEditedAt: '2026-01-01T00:00:00.000Z',
    }
    expect(savePersistedState(state)).toBe(true)
    const loaded = loadPersistedState()
    expect(loaded?.markdown).toBe('# Hello')
    expect(loaded?.theme).toBe('dark')
    expect(loaded?.settings.templateId).toBe('clean')
  })

  it('discards corrupted JSON and returns null', () => {
    localStorage.setItem('docmarkdown:state', '{not valid json')
    expect(loadPersistedState()).toBeNull()
  })

  it('clears the saved draft', () => {
    savePersistedState({
      version: STORAGE_SCHEMA_VERSION,
      markdown: 'content',
      settings: DEFAULT_DOCUMENT_SETTINGS,
      theme: 'system',
      lastEditedAt: null,
    })
    expect(clearPersistedState()).toBe(true)
    expect(loadPersistedState()).toBeNull()
  })
})
