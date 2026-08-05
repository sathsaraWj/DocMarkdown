import type { DocumentSettings } from '@/types/settings'
import { validateDocumentSettings } from './validateSettings'

export function settingsToJson(settings: DocumentSettings): string {
  return JSON.stringify(settings, null, 2)
}

export interface SettingsImportResult {
  settings: DocumentSettings | null
  error: string | null
}

export function parseSettingsJson(json: string): SettingsImportResult {
  try {
    const parsed: unknown = JSON.parse(json)
    return { settings: validateDocumentSettings(parsed), error: null }
  } catch {
    return { settings: null, error: 'That file is not valid JSON.' }
  }
}
