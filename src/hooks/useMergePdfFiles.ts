import { useCallback, useEffect, useRef, useState } from 'react'

import { inspectPdf } from '@/services/pdf/inspectPdf'
import { sanitizeMergeOutputFilename } from '@/services/pdf/mergePdfFilename'
import { mergePdfFiles } from '@/services/pdf/mergePdfFiles'
import type { MergeSourceFile } from '@/services/pdf/mergePdfFiles'
import { releaseMergeResources } from '@/services/pdf/pdfMemoryCleanup'
import { validatePdfBatch } from '@/services/pdf/pdfFileValidation'
import { parsePageRange } from '@/services/pdf/parsePageRange'
import {
  loadMergePdfPreferences,
  saveMergePdfPreferences,
} from '@/services/storage/mergePdfPreferences'
import { downloadBlob } from '@/utils/download'
import { moveItem, moveItemToEnd, moveItemToStart } from '@/utils/reorder'
import type {
  MergePdfFileEntry,
  MergePdfOutputMetadata,
  MergePdfProgress,
  MergePdfRejectedFile,
  MergePdfResult,
  MergePdfSettings,
  MergeRunStatus,
  PageRangeMode,
} from '@/types/mergePdf'

let idCounter = 0
function nextId(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID()
  }
  idCounter += 1
  return `merge-pdf-file-${idCounter}`
}

function allPagesOf(pageCount: number): number[] {
  return Array.from({ length: pageCount }, (_, i) => i + 1)
}

function plural(count: number, word: string): string {
  return `${count} ${word}${count === 1 ? '' : 's'}`
}

export interface UseMergePdfFilesResult {
  entries: MergePdfFileEntry[]
  rejected: MergePdfRejectedFile[]
  dismissRejected: () => void
  addFiles: (files: File[]) => void
  removeFile: (id: string) => void
  clearAll: () => void
  moveUp: (id: string) => void
  moveDown: (id: string) => void
  moveToFirst: (id: string) => void
  moveToLast: (id: string) => void
  reorder: (fromIndex: number, toIndex: number) => void
  setPageRangeMode: (id: string, mode: PageRangeMode) => void
  setPageRangeInput: (id: string, input: string) => void
  resetPageRange: (id: string) => void

  settings: MergePdfSettings
  setFilename: (filename: string) => void
  setMetadataField: (field: keyof MergePdfOutputMetadata, value: string) => void

  mergeStatus: MergeRunStatus
  progress: MergePdfProgress | null
  result: MergePdfResult | null
  mergeError: string | null
  isReadyToMerge: boolean
  blockedCount: number
  startMerge: () => Promise<void>
  downloadAgain: () => void
  startNewMerge: () => void

  liveMessage: string
}

/**
 * Owns all state for the Merge PDF tool. Files themselves live only in
 * memory (never localStorage) for the lifetime of this hook; only the small,
 * non-sensitive output-filename/metadata preferences are persisted. A ref
 * mirror of frequently-read state lets action callbacks read the latest
 * values synchronously (e.g. to compute an accessible "moved to position X
 * of Y" announcement) without re-creating callbacks on every entries change.
 */
export function useMergePdfFiles(): UseMergePdfFilesResult {
  const [entries, setEntries] = useState<MergePdfFileEntry[]>([])
  const [rejected, setRejected] = useState<MergePdfRejectedFile[]>([])
  const [settings, setSettings] = useState<MergePdfSettings>(() => {
    const prefs = loadMergePdfPreferences()
    return { filename: prefs.filename, metadata: prefs.metadata }
  })
  const [mergeStatus, setMergeStatus] = useState<MergeRunStatus>('idle')
  const [progress, setProgress] = useState<MergePdfProgress | null>(null)
  const [result, setResult] = useState<MergePdfResult | null>(null)
  const [mergeError, setMergeError] = useState<string | null>(null)
  const [liveMessage, setLiveMessage] = useState('')

  const entriesRef = useRef(entries)
  const settingsRef = useRef(settings)
  const mergeStatusRef = useRef(mergeStatus)
  const resultRef = useRef(result)

  useEffect(() => {
    entriesRef.current = entries
  }, [entries])
  useEffect(() => {
    settingsRef.current = settings
  }, [settings])
  useEffect(() => {
    mergeStatusRef.current = mergeStatus
  }, [mergeStatus])
  useEffect(() => {
    resultRef.current = result
  }, [result])

  useEffect(() => {
    saveMergePdfPreferences({
      filename: settings.filename,
      metadata: settings.metadata,
      pageRangeControlsExpanded: false,
    })
  }, [settings])

  const inspectEntriesSequentially = useCallback(async (ids: string[], files: File[]) => {
    for (let i = 0; i < ids.length; i += 1) {
      const id = ids[i] as string
      const file = files[i] as File
      const inspection = await inspectPdf(file)

      setEntries((prev) => {
        if (!prev.some((e) => e.id === id)) return prev
        return prev.map((e) => {
          if (e.id !== id) return e
          if (!inspection.ok) {
            return {
              ...e,
              status: inspection.encrypted ? 'encrypted' : 'invalid',
              errorMessage: inspection.error,
              pageCount: null,
              resolvedPages: null,
            }
          }
          return {
            ...e,
            status: 'ready',
            errorMessage: null,
            pageCount: inspection.pageCount,
            title: inspection.title,
            author: inspection.author,
            createdAt: inspection.createdAt,
            encrypted: false,
            resolvedPages:
              e.pageRangeMode === 'all' ? allPagesOf(inspection.pageCount as number) : e.resolvedPages,
          }
        })
      })
    }
  }, [])

  const addFiles = useCallback(
    (files: File[]) => {
      const batch = validatePdfBatch(
        files,
        entriesRef.current.map((e) => ({ size: e.size })),
      )

      const newEntries: MergePdfFileEntry[] = batch.accepted.map((file) => ({
        id: nextId(),
        file,
        name: file.name,
        size: file.size,
        lastModified: file.lastModified,
        status: 'validating',
        errorMessage: null,
        pageCount: null,
        title: null,
        author: null,
        createdAt: null,
        encrypted: false,
        pageRangeMode: 'all',
        pageRangeInput: '',
        resolvedPages: null,
        pageRangeError: null,
      }))

      if (newEntries.length > 0) setEntries((prev) => [...prev, ...newEntries])
      setRejected(batch.rejected)

      const parts: string[] = []
      if (newEntries.length > 0) parts.push(`${plural(newEntries.length, 'PDF')} added`)
      if (batch.rejected.length > 0) parts.push(`${plural(batch.rejected.length, 'file')} rejected`)
      setLiveMessage(parts.length > 0 ? `${parts.join('. ')}.` : 'No files were added.')

      if (newEntries.length > 0) {
        void inspectEntriesSequentially(
          newEntries.map((e) => e.id),
          newEntries.map((e) => e.file),
        )
      }
    },
    [inspectEntriesSequentially],
  )

  const dismissRejected = useCallback(() => setRejected([]), [])

  const removeFile = useCallback((id: string) => {
    if (mergeStatusRef.current === 'merging') return
    const list = entriesRef.current
    const removed = list.find((e) => e.id === id)
    if (!removed) return
    setEntries((prev) => prev.filter((e) => e.id !== id))
    const remaining = list.length - 1
    setLiveMessage(`${removed.name} removed. ${plural(remaining, 'file')} remaining.`)
  }, [])

  const clearAll = useCallback(() => {
    if (mergeStatusRef.current === 'merging') return
    setEntries(releaseMergeResources())
    setRejected([])
    setLiveMessage('All files cleared.')
  }, [])

  const announceMove = useCallback((entry: MergePdfFileEntry, newPosition: number, total: number) => {
    setLiveMessage(`${entry.name} moved to position ${newPosition} of ${total}.`)
  }, [])

  const moveUp = useCallback(
    (id: string) => {
      if (mergeStatusRef.current === 'merging') return
      const list = entriesRef.current
      const index = list.findIndex((e) => e.id === id)
      if (index <= 0) return
      const entry = list[index] as MergePdfFileEntry
      setEntries((prev) => moveItem(prev, index, index - 1))
      announceMove(entry, index, list.length)
    },
    [announceMove],
  )

  const moveDown = useCallback(
    (id: string) => {
      if (mergeStatusRef.current === 'merging') return
      const list = entriesRef.current
      const index = list.findIndex((e) => e.id === id)
      if (index === -1 || index >= list.length - 1) return
      const entry = list[index] as MergePdfFileEntry
      setEntries((prev) => moveItem(prev, index, index + 1))
      announceMove(entry, index + 2, list.length)
    },
    [announceMove],
  )

  const moveToFirst = useCallback(
    (id: string) => {
      if (mergeStatusRef.current === 'merging') return
      const list = entriesRef.current
      const index = list.findIndex((e) => e.id === id)
      if (index <= 0) return
      const entry = list[index] as MergePdfFileEntry
      setEntries((prev) => moveItemToStart(prev, index))
      announceMove(entry, 1, list.length)
    },
    [announceMove],
  )

  const moveToLast = useCallback(
    (id: string) => {
      if (mergeStatusRef.current === 'merging') return
      const list = entriesRef.current
      const index = list.findIndex((e) => e.id === id)
      if (index === -1 || index >= list.length - 1) return
      const entry = list[index] as MergePdfFileEntry
      setEntries((prev) => moveItemToEnd(prev, index))
      announceMove(entry, list.length, list.length)
    },
    [announceMove],
  )

  const reorder = useCallback(
    (fromIndex: number, toIndex: number) => {
      if (mergeStatusRef.current === 'merging') return
      const list = entriesRef.current
      if (
        fromIndex === toIndex ||
        fromIndex < 0 ||
        fromIndex >= list.length ||
        toIndex < 0 ||
        toIndex >= list.length
      ) {
        return
      }
      const entry = list[fromIndex] as MergePdfFileEntry
      setEntries((prev) => moveItem(prev, fromIndex, toIndex))
      announceMove(entry, toIndex + 1, list.length)
    },
    [announceMove],
  )

  const setPageRangeMode = useCallback((id: string, mode: PageRangeMode) => {
    setEntries((prev) =>
      prev.map((e) => {
        if (e.id !== id) return e
        if (mode === 'all') {
          return {
            ...e,
            pageRangeMode: 'all',
            pageRangeInput: '',
            pageRangeError: null,
            resolvedPages: e.pageCount ? allPagesOf(e.pageCount) : null,
          }
        }
        return { ...e, pageRangeMode: 'custom' }
      }),
    )
  }, [])

  const setPageRangeInput = useCallback((id: string, input: string) => {
    setEntries((prev) =>
      prev.map((e) => {
        if (e.id !== id) return e
        if (!e.pageCount) return { ...e, pageRangeInput: input }
        const parsed = parsePageRange(input, e.pageCount)
        return {
          ...e,
          pageRangeInput: input,
          resolvedPages: parsed.ok ? parsed.pages : null,
          pageRangeError: parsed.ok ? null : parsed.error,
        }
      }),
    )
  }, [])

  const resetPageRange = useCallback(
    (id: string) => setPageRangeMode(id, 'all'),
    [setPageRangeMode],
  )

  const setFilename = useCallback((filename: string) => {
    setSettings((prev) => ({ ...prev, filename }))
  }, [])

  const setMetadataField = useCallback((field: keyof MergePdfOutputMetadata, value: string) => {
    setSettings((prev) => ({ ...prev, metadata: { ...prev.metadata, [field]: value } }))
  }, [])

  const isReadyToMerge =
    entries.length > 0 &&
    entries.every(
      (e) =>
        e.status === 'ready' &&
        (e.pageRangeMode === 'all' || (e.resolvedPages !== null && !e.pageRangeError)),
    )

  const blockedCount = entries.filter(
    (e) =>
      e.status !== 'ready' ||
      (e.pageRangeMode === 'custom' && (e.resolvedPages === null || e.pageRangeError !== null)),
  ).length

  const startMerge = useCallback(async () => {
    if (mergeStatusRef.current === 'merging') return
    const list = entriesRef.current
    if (list.length === 0) return

    const allReady = list.every(
      (e) =>
        e.status === 'ready' &&
        (e.pageRangeMode === 'all' || (e.resolvedPages !== null && !e.pageRangeError)),
    )
    if (!allReady) return

    const sources: MergeSourceFile[] = list.map((e) => ({
      id: e.id,
      file: e.file,
      pages: e.pageRangeMode === 'all' ? allPagesOf(e.pageCount as number) : (e.resolvedPages as number[]),
    }))

    setMergeStatus('merging')
    setMergeError(null)
    setProgress(null)
    setLiveMessage('Merging PDFs…')

    try {
      const { blob, pageCount } = await mergePdfFiles(sources, settingsRef.current.metadata, (p) => {
        setProgress(p)
        const position = p.stage === 'complete' ? p.totalFiles : p.currentFileIndex + 1
        setLiveMessage(
          `Merging (${p.stage}): file ${position} of ${p.totalFiles}${p.currentFileName ? ` — ${p.currentFileName}` : ''}.`,
        )
      })

      const filename = sanitizeMergeOutputFilename(settingsRef.current.filename)
      const newResult: MergePdfResult = {
        blob,
        filename,
        sourceFileCount: sources.length,
        pageCount,
        fileSize: blob.size,
      }
      setResult(newResult)
      downloadBlob(blob, filename)
      setMergeStatus('success')
      setLiveMessage(
        `Merge complete. ${filename} downloaded with ${pageCount} pages from ${plural(sources.length, 'file')}.`,
      )
    } catch (err) {
      setMergeStatus('error')
      const message = err instanceof Error ? err.message : 'The PDFs could not be merged.'
      setMergeError(message)
      setLiveMessage(`Merge failed: ${message}`)
    }
  }, [])

  const downloadAgain = useCallback(() => {
    if (resultRef.current) downloadBlob(resultRef.current.blob, resultRef.current.filename)
  }, [])

  const startNewMerge = useCallback(() => {
    setEntries(releaseMergeResources())
    setRejected([])
    setResult(null)
    setMergeStatus('idle')
    setProgress(null)
    setMergeError(null)
    setLiveMessage('Ready for a new merge.')
  }, [])

  return {
    entries,
    rejected,
    dismissRejected,
    addFiles,
    removeFile,
    clearAll,
    moveUp,
    moveDown,
    moveToFirst,
    moveToLast,
    reorder,
    setPageRangeMode,
    setPageRangeInput,
    resetPageRange,
    settings,
    setFilename,
    setMetadataField,
    mergeStatus,
    progress,
    result,
    mergeError,
    isReadyToMerge,
    blockedCount,
    startMerge,
    downloadAgain,
    startNewMerge,
    liveMessage,
  }
}
