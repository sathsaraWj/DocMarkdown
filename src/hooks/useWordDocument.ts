import { useCallback, useEffect, useRef, useState } from 'react'

import { parseDocx } from '@/services/word/parseDocx'
import { detectWordFileSignatureIssue, validateWordFile } from '@/services/word/wordFileValidation'
import {
  DEFAULT_WORD_CONVERSION_SETTINGS,
  type WordConversionSettings,
  type WordConversionStatus,
  type WordParseResult,
} from '@/types/word'
import { TYPOGRAPHY_LIMITS } from '@/types/typography'

function clampBodyFontSize(sizePt: number): number {
  return Math.min(TYPOGRAPHY_LIMITS.bodyFontSize.max, Math.max(TYPOGRAPHY_LIMITS.bodyFontSize.min, sizePt))
}

export interface UseWordDocumentResult {
  file: File | null
  status: WordConversionStatus
  parseResult: WordParseResult | null
  errorMessage: string | null
  settings: WordConversionSettings
  setSettings: (updater: WordConversionSettings | ((prev: WordConversionSettings) => WordConversionSettings)) => void
  loadFile: (file: File) => Promise<void>
  clearDocument: () => void
}

/**
 * Owns all state for the Word-to-PDF converter: the selected file, its
 * parsed/sanitized HTML, conversion status, and export settings. Everything
 * lives only in memory for the lifetime of this hook (no localStorage), per
 * the "don't persist the raw .docx" privacy requirement — unmounting the
 * page (navigating away) is itself the cleanup.
 */
export function useWordDocument(): UseWordDocumentResult {
  const [file, setFile] = useState<File | null>(null)
  const [status, setStatus] = useState<WordConversionStatus>('idle')
  const [parseResult, setParseResult] = useState<WordParseResult | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [settings, setSettings] = useState<WordConversionSettings>(DEFAULT_WORD_CONVERSION_SETTINGS)

  // Guards against a stale parse result overwriting state after the user has
  // already replaced or cleared the file (or navigated away) while it was
  // still in flight.
  const parseTokenRef = useRef(0)

  useEffect(() => {
    return () => {
      parseTokenRef.current += 1
    }
  }, [])

  const loadFile = useCallback(async (candidate: File) => {
    setErrorMessage(null)

    const validation = validateWordFile(candidate)
    if (!validation.ok) {
      parseTokenRef.current += 1
      setFile(null)
      setParseResult(null)
      setStatus('invalid')
      setErrorMessage(validation.error.message)
      return
    }

    setStatus('validating')
    const signatureIssue = await detectWordFileSignatureIssue(candidate)
    if (signatureIssue) {
      parseTokenRef.current += 1
      setFile(null)
      setParseResult(null)
      setStatus('invalid')
      setErrorMessage(signatureIssue.message)
      return
    }

    const token = ++parseTokenRef.current
    setFile(candidate)
    setParseResult(null)
    setStatus('parsing')

    try {
      const result = await parseDocx(candidate)
      if (parseTokenRef.current !== token) return

      setParseResult(result)
      if (result.title) {
        setSettings((prev) => ({
          ...prev,
          document: { ...prev.document, metadata: { ...prev.document.metadata, title: result.title as string } },
        }))
      }

      const { page: pageHints, font: fontHints } = result.layoutHints ?? { page: null, font: null }
      if (pageHints || fontHints) {
        setSettings((prev) => ({
          ...prev,
          detectedFont: fontHints?.fontId ?? prev.detectedFont,
          document: {
            ...prev.document,
            page: pageHints
              ? {
                  size: pageHints.size,
                  orientation: pageHints.orientation,
                  marginPreset: 'custom',
                  margins: pageHints.margins,
                }
              : prev.document.page,
            typography: fontHints?.sizePt
              ? { ...prev.document.typography, bodyFontSize: clampBodyFontSize(fontHints.sizePt) }
              : prev.document.typography,
          },
        }))
      }

      const hasWarnings = result.warnings.length > 0
      setStatus(hasWarnings ? 'ready-with-warnings' : 'ready')
    } catch (err) {
      if (parseTokenRef.current !== token) return
      setStatus('error')
      setErrorMessage(
        err instanceof Error
          ? err.message
          : 'The document could not be read. It may be corrupted or password-protected.',
      )
    }
  }, [])

  const clearDocument = useCallback(() => {
    parseTokenRef.current += 1
    setFile(null)
    setParseResult(null)
    setStatus('idle')
    setErrorMessage(null)
  }, [])

  return { file, status, parseResult, errorMessage, settings, setSettings, loadFile, clearDocument }
}
