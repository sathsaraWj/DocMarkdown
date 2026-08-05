import { DEFAULT_DOCUMENT_SETTINGS } from '@/types/settings'
import { STORAGE_SCHEMA_VERSION, type PersistedState } from '@/types/storage'
import type { ThemePreference } from '@/types/settings'
import { validateDocumentSettings } from './validateSettings'

const STORAGE_KEY = 'docmarkdown:state'

function isThemePreference(value: unknown): value is ThemePreference {
  return value === 'light' || value === 'dark' || value === 'system'
}

/**
 * Reshapes arbitrary stored JSON into a valid PersistedState. Versions older
 * than STORAGE_SCHEMA_VERSION would be transformed here before validation;
 * today there is only one schema, so unknown versions fall back to defaults.
 */
function migrate(raw: unknown): PersistedState | null {
  if (typeof raw !== 'object' || raw === null) return null
  const obj = raw as Record<string, unknown>
  if (typeof obj.version !== 'number') return null

  return {
    version: STORAGE_SCHEMA_VERSION,
    markdown: typeof obj.markdown === 'string' ? obj.markdown : '',
    settings: validateDocumentSettings(obj.settings ?? DEFAULT_DOCUMENT_SETTINGS),
    theme: isThemePreference(obj.theme) ? obj.theme : 'system',
    lastEditedAt: typeof obj.lastEditedAt === 'string' ? obj.lastEditedAt : null,
  }
}

export function isStorageAvailable(): boolean {
  try {
    const testKey = '__docmarkdown_storage_test__'
    localStorage.setItem(testKey, '1')
    localStorage.removeItem(testKey)
    return true
  } catch {
    return false
  }
}

export function loadPersistedState(): PersistedState | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    return migrate(JSON.parse(raw) as unknown)
  } catch {
    return null
  }
}

export function savePersistedState(state: PersistedState): boolean {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
    return true
  } catch {
    return false
  }
}

export function clearPersistedState(): boolean {
  try {
    localStorage.removeItem(STORAGE_KEY)
    return true
  } catch {
    return false
  }
}
