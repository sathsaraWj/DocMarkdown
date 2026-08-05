import type { DocumentSettings, ThemePreference } from './settings'

/** Bump this whenever the persisted shape changes, and add a migration in storage/migrations.ts. */
export const STORAGE_SCHEMA_VERSION = 1

export interface PersistedState {
  version: number
  markdown: string
  settings: DocumentSettings
  theme: ThemePreference
  lastEditedAt: string | null
}

export interface StorageEnvelope<T> {
  version: number
  data: T
}
