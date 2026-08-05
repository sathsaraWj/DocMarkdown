import { beforeEach, describe, expect, it } from 'vitest'

import {
  DEFAULT_MERGE_PDF_PREFERENCES,
  loadMergePdfPreferences,
  saveMergePdfPreferences,
} from '@/services/storage/mergePdfPreferences'

describe('mergePdfPreferences storage', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('returns defaults when nothing has been saved', () => {
    expect(loadMergePdfPreferences()).toEqual(DEFAULT_MERGE_PDF_PREFERENCES)
  })

  it('round-trips saved preferences', () => {
    const prefs = {
      filename: 'my-merged.pdf',
      metadata: { title: 'T', author: 'A', subject: 'S', keywords: 'k1, k2' },
      pageRangeControlsExpanded: true,
    }
    expect(saveMergePdfPreferences(prefs)).toBe(true)
    expect(loadMergePdfPreferences()).toEqual(prefs)
  })

  it('never contains file content — only the plain preference fields', () => {
    saveMergePdfPreferences({
      filename: 'x.pdf',
      metadata: { title: '', author: '', subject: '', keywords: '' },
      pageRangeControlsExpanded: false,
    })
    const raw = localStorage.getItem('docmarkdown:merge-pdf-preferences')
    expect(raw).not.toBeNull()
    const parsed = JSON.parse(raw as string) as Record<string, unknown>
    expect(Object.keys(parsed).sort()).toEqual(['filename', 'metadata', 'pageRangeControlsExpanded'])
  })

  it('discards corrupted JSON and falls back to defaults', () => {
    localStorage.setItem('docmarkdown:merge-pdf-preferences', '{not valid json')
    expect(loadMergePdfPreferences()).toEqual(DEFAULT_MERGE_PDF_PREFERENCES)
  })
})
