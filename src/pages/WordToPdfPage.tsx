import { useEffect, useRef, useState } from 'react'
import type { ChangeEvent } from 'react'
import { Link } from 'react-router-dom'

import { ConfirmDialog } from '@/components/common/ConfirmDialog'
import { LockIcon, RefreshIcon, TrashIcon } from '@/components/common/icons'
import { WordConversionWarnings } from '@/components/word/WordConversionWarnings'
import { WordDocumentInfo } from '@/components/word/WordDocumentInfo'
import { WordPreview } from '@/components/word/WordPreview'
import { WordSettingsPanel } from '@/components/word/WordSettingsPanel'
import { WordUploadZone } from '@/components/word/WordUploadZone'
import { useMediaQuery } from '@/hooks/useMediaQuery'
import { usePageMeta } from '@/hooks/usePageMeta'
import { useWordDocument } from '@/hooks/useWordDocument'

export default function WordToPdfPage() {
  usePageMeta({
    title: 'Word to PDF Converter – Private Browser Conversion',
    description:
      'Convert DOCX Word documents to PDF directly in your browser. No uploads, no account, and no server-side file processing.',
    path: '/word-to-pdf',
  })

  const { file, status, parseResult, errorMessage, settings, setSettings, loadFile, clearDocument } =
    useWordDocument()
  const isDesktop = useMediaQuery('(min-width: 768px)')
  const replaceInputRef = useRef<HTMLInputElement>(null)
  const workspaceHeadingRef = useRef<HTMLHeadingElement>(null)
  const [clearOpen, setClearOpen] = useState(false)

  const hasFile = file !== null
  const isReady = status === 'ready' || status === 'ready-with-warnings'
  const isInvalidOrError = status === 'invalid' || status === 'error'

  useEffect(() => {
    if (isReady) workspaceHeadingRef.current?.focus()
  }, [isReady])

  const handleReplaceInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    const nextFile = event.target.files?.[0]
    event.target.value = ''
    if (nextFile) void loadFile(nextFile)
  }

  return (
    <div className="mx-auto flex w-full max-w-6xl min-h-0 flex-1 flex-col overflow-y-auto px-4 py-8 sm:px-6 lg:px-8">
      <header className="mb-6 flex flex-col gap-3 border-b border-neutral-200 pb-6 dark:border-neutral-800">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold text-neutral-900 dark:text-white sm:text-3xl">
              Word to PDF Converter
            </h1>
            <p className="mt-2 max-w-2xl text-neutral-600 dark:text-neutral-300">
              Convert Word documents to PDF directly in your browser. Your files never leave your
              device.
            </p>
          </div>
          <Link
            to="/"
            className="shrink-0 rounded-md border border-neutral-300 px-3.5 py-2 text-sm font-semibold text-neutral-700 hover:bg-neutral-50 dark:border-neutral-700 dark:text-neutral-200 dark:hover:bg-neutral-800"
          >
            ← Markdown converter
          </Link>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-medium text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300">
            <LockIcon className="h-3.5 w-3.5" />
            Processed locally — nothing is uploaded
          </span>
          <span className="inline-flex items-center rounded-full bg-neutral-100 px-3 py-1.5 text-xs font-medium text-neutral-600 dark:bg-neutral-800 dark:text-neutral-300">
            Supported format: .docx
          </span>
        </div>
      </header>

      {!hasFile && !isInvalidOrError && (
        <WordUploadZone onFile={(f) => void loadFile(f)} />
      )}

      {!hasFile && isInvalidOrError && (
        <div className="mx-auto flex w-full max-w-2xl flex-col gap-4 px-4 py-10 sm:px-6">
          <div role="alert" className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/40 dark:text-red-300">
            <p className="font-semibold">This file couldn't be used.</p>
            <p className="mt-1">{errorMessage}</p>
          </div>
          <WordUploadZone onFile={(f) => void loadFile(f)} />
        </div>
      )}

      {hasFile && (
        <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-xl border border-neutral-200 dark:border-neutral-800">
          <div className="flex items-center justify-between gap-2 border-b border-neutral-200 px-3 py-2 dark:border-neutral-800">
            <h2
              ref={workspaceHeadingRef}
              tabIndex={-1}
              className="text-sm font-semibold text-neutral-700 outline-none dark:text-neutral-200"
            >
              Conversion workspace
            </h2>
            <div className="flex items-center gap-1">
              <input
                ref={replaceInputRef}
                type="file"
                accept=".docx,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                onChange={handleReplaceInputChange}
                className="sr-only"
                aria-label="Replace with a different .docx file"
              />
              <button
                type="button"
                onClick={() => replaceInputRef.current?.click()}
                title="Replace file"
                aria-label="Replace the current Word document"
                className="flex h-8 w-8 items-center justify-center rounded-md text-neutral-500 hover:bg-neutral-100 dark:text-neutral-400 dark:hover:bg-neutral-800"
              >
                <RefreshIcon className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() => setClearOpen(true)}
                title="Clear document"
                aria-label="Clear the current Word document"
                className="flex h-8 w-8 items-center justify-center rounded-md text-neutral-500 hover:bg-red-50 hover:text-red-600 dark:text-neutral-400 dark:hover:bg-red-950/40 dark:hover:text-red-400"
              >
                <TrashIcon className="h-4 w-4" />
              </button>
            </div>
          </div>

          <WordDocumentInfo
            fileName={file.name}
            fileSize={file.size}
            status={status}
            extractedTitle={parseResult?.title ?? null}
          />

          {parseResult && (status === 'ready-with-warnings' || parseResult.warnings.length > 0) && (
            <WordConversionWarnings warnings={parseResult.warnings} />
          )}

          {isInvalidOrError && (
            <div role="alert" className="border-b border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/40 dark:text-red-300">
              {errorMessage}
            </div>
          )}

          <div className="min-h-0 flex-1">
            {isDesktop ? (
              <div className="flex h-full min-h-0">
                <div className="min-h-0 flex-1">
                  <WordPreview
                    html={parseResult?.html ?? ''}
                    settings={settings.document}
                    status={status}
                    errorMessage={errorMessage}
                  />
                </div>
                <div className="w-80 shrink-0 border-l border-neutral-200 dark:border-neutral-800">
                  <WordSettingsPanel
                    html={parseResult?.html ?? ''}
                    ready={isReady}
                    settings={settings}
                    onChange={setSettings}
                  />
                </div>
              </div>
            ) : (
              <div className="flex h-full min-h-0 flex-col divide-y divide-neutral-200 overflow-y-auto dark:divide-neutral-800">
                <div className="h-[60vh] min-h-[320px]">
                  <WordPreview
                    html={parseResult?.html ?? ''}
                    settings={settings.document}
                    status={status}
                    errorMessage={errorMessage}
                  />
                </div>
                <WordSettingsPanel
                  html={parseResult?.html ?? ''}
                  ready={isReady}
                  settings={settings}
                  onChange={setSettings}
                />
              </div>
            )}
          </div>
        </div>
      )}

      <ConfirmDialog
        open={clearOpen}
        title="Clear this document?"
        description="This removes the uploaded Word document and its converted preview from memory. This cannot be undone."
        confirmLabel="Clear"
        onConfirm={() => {
          clearDocument()
          setClearOpen(false)
        }}
        onCancel={() => setClearOpen(false)}
      />
    </div>
  )
}
