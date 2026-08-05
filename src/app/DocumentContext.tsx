import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react'
import type { ReactNode } from 'react'

import { useDebouncedCallback } from '@/hooks/useDebouncedCallback'
import {
  clearPersistedState,
  isStorageAvailable,
  loadPersistedState,
  savePersistedState,
} from '@/services/storage'
import {
  DEFAULT_DOCUMENT_SETTINGS,
  type DocumentSettings,
  type ThemePreference,
} from '@/types/settings'
import { STORAGE_SCHEMA_VERSION } from '@/types/storage'
import { SAMPLE_DOCUMENT } from '@/utils/sampleDocument'

export type SaveStatus = 'saved' | 'saving' | 'error' | 'unavailable'

interface DocumentContextValue {
  markdown: string
  setMarkdown: (value: string) => void
  settings: DocumentSettings
  setSettings: (updater: DocumentSettings | ((prev: DocumentSettings) => DocumentSettings)) => void
  resetSettings: () => void
  theme: ThemePreference
  setTheme: (value: ThemePreference) => void
  saveStatus: SaveStatus
  lastEditedAt: string | null
  storageAvailable: boolean
  deleteAllLocalData: () => void
}

const DocumentContext = createContext<DocumentContextValue | null>(null)

function applyThemeClass(theme: ThemePreference): () => void {
  const root = document.documentElement
  const apply = (dark: boolean) => {
    root.classList.toggle('dark', dark)
  }

  if (theme === 'system') {
    const media = window.matchMedia('(prefers-color-scheme: dark)')
    apply(media.matches)
    const listener = (event: MediaQueryListEvent) => apply(event.matches)
    media.addEventListener('change', listener)
    return () => media.removeEventListener('change', listener)
  }

  apply(theme === 'dark')
  return () => {}
}

export function DocumentProvider({ children }: { children: ReactNode }) {
  const storageAvailable = useMemo(() => isStorageAvailable(), [])
  const initial = useMemo(
    () => (storageAvailable ? loadPersistedState() : null),
    [storageAvailable],
  )

  const [markdown, setMarkdownState] = useState(initial?.markdown ?? SAMPLE_DOCUMENT)
  const [settings, setSettingsState] = useState<DocumentSettings>(
    initial?.settings ?? DEFAULT_DOCUMENT_SETTINGS,
  )
  const [theme, setThemeState] = useState<ThemePreference>(initial?.theme ?? 'system')
  const [lastEditedAt, setLastEditedAt] = useState<string | null>(initial?.lastEditedAt ?? null)
  const [saveStatus, setSaveStatus] = useState<SaveStatus>(
    storageAvailable ? 'saved' : 'unavailable',
  )

  useEffect(() => applyThemeClass(theme), [theme])

  const persist = useDebouncedCallback(
    (next: {
      markdown: string
      settings: DocumentSettings
      theme: ThemePreference
      lastEditedAt: string | null
    }) => {
      if (!storageAvailable) return
      const ok = savePersistedState({ version: STORAGE_SCHEMA_VERSION, ...next })
      setSaveStatus(ok ? 'saved' : 'error')
    },
    600,
  )

  const isFirstRender = useRef(true)
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false
      return
    }
    if (!storageAvailable) {
      setSaveStatus('unavailable')
      return
    }
    setSaveStatus('saving')
    persist.call({ markdown, settings, theme, lastEditedAt })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [markdown, settings, theme, lastEditedAt])

  const setMarkdown = useCallback((value: string) => {
    setMarkdownState(value)
    setLastEditedAt(new Date().toISOString())
  }, [])

  const setSettings = useCallback(
    (updater: DocumentSettings | ((prev: DocumentSettings) => DocumentSettings)) => {
      setSettingsState((prev) => (typeof updater === 'function' ? updater(prev) : updater))
    },
    [],
  )

  const resetSettings = useCallback(() => {
    setSettingsState(DEFAULT_DOCUMENT_SETTINGS)
  }, [])

  const setTheme = useCallback((value: ThemePreference) => {
    setThemeState(value)
  }, [])

  const deleteAllLocalData = useCallback(() => {
    persist.cancel()
    clearPersistedState()
    setMarkdownState('')
    setSettingsState(DEFAULT_DOCUMENT_SETTINGS)
    setThemeState('system')
    setLastEditedAt(null)
    // Persist the cleared state immediately (not debounced) so a fast reload
    // doesn't see "no saved state" and fall back to the sample document.
    if (storageAvailable) {
      savePersistedState({
        version: STORAGE_SCHEMA_VERSION,
        markdown: '',
        settings: DEFAULT_DOCUMENT_SETTINGS,
        theme: 'system',
        lastEditedAt: null,
      })
    }
    setSaveStatus(storageAvailable ? 'saved' : 'unavailable')
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [storageAvailable])

  const value: DocumentContextValue = {
    markdown,
    setMarkdown,
    settings,
    setSettings,
    resetSettings,
    theme,
    setTheme,
    saveStatus,
    lastEditedAt,
    storageAvailable,
    deleteAllLocalData,
  }

  return <DocumentContext.Provider value={value}>{children}</DocumentContext.Provider>
}

export function useDocument(): DocumentContextValue {
  const ctx = useContext(DocumentContext)
  if (!ctx) throw new Error('useDocument must be used within a DocumentProvider')
  return ctx
}
