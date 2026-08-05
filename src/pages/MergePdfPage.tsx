import { useRef, useState } from 'react'
import type { ChangeEvent } from 'react'
import { Link } from 'react-router-dom'

import { ConfirmDialog } from '@/components/common/ConfirmDialog'
import { LayersIcon, LockIcon, PlusIcon, TrashIcon } from '@/components/common/icons'
import { MergePdfSettings } from '@/components/merge-pdf/MergePdfSettings'
import { MergePdfSummary } from '@/components/merge-pdf/MergePdfSummary'
import { MergeErrorPanel, MergeSuccessPanel } from '@/components/merge-pdf/MergeResultPanel'
import { MergeProgress } from '@/components/merge-pdf/MergeProgress'
import { PdfFileList } from '@/components/merge-pdf/PdfFileList'
import { PdfUploadZone } from '@/components/merge-pdf/PdfUploadZone'
import { RejectedFilesPanel } from '@/components/merge-pdf/RejectedFilesPanel'
import { useMediaQuery } from '@/hooks/useMediaQuery'
import { useMergePdfFiles } from '@/hooks/useMergePdfFiles'
import { usePageMeta } from '@/hooks/usePageMeta'

export default function MergePdfPage() {
  usePageMeta({
    title: 'Merge PDF Files Online Privately',
    description:
      'Combine multiple PDF files into one document directly in your browser. No uploads, no account, and no server-side file processing.',
    path: '/merge-pdf',
  })

  const merge = useMergePdfFiles()
  const isDesktop = useMediaQuery('(min-width: 768px)')
  const addMoreInputRef = useRef<HTMLInputElement>(null)
  const [clearOpen, setClearOpen] = useState(false)

  const hasFiles = merge.entries.length > 0
  const isMerging = merge.mergeStatus === 'merging'
  const firstReadyEntry = merge.entries.find((e) => e.status === 'ready' && (e.title || e.author))

  const handleAddMoreChange = (event: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files ?? [])
    event.target.value = ''
    if (files.length > 0) merge.addFiles(files)
  }

  const sidebarContent = (
    <div className="flex flex-col gap-4 p-4">
      <MergePdfSummary entries={merge.entries} />
      <MergePdfSettings
        settings={merge.settings}
        onFilenameChange={merge.setFilename}
        onMetadataFieldChange={merge.setMetadataField}
        suggestedTitle={firstReadyEntry?.title ?? null}
        suggestedAuthor={firstReadyEntry?.author ?? null}
        disabled={isMerging}
      />
      {merge.blockedCount > 0 && merge.mergeStatus !== 'merging' && (
        <p className="text-xs text-amber-700 dark:text-amber-400">
          {merge.blockedCount} file{merge.blockedCount === 1 ? '' : 's'} need attention before you
          can merge — finish validation or fix the page range above.
        </p>
      )}
    </div>
  )

  // A non-scrolling, always-visible footer inside whichever container scrolls
  // (the sidebar on desktop, the whole stacked column on mobile) — satisfies
  // "keep the primary merge button visible" without a separate fixed overlay.
  const mergeButton = (
    <div className="sticky bottom-0 z-10 border-t border-neutral-200 bg-white p-3 dark:border-neutral-800 dark:bg-neutral-950">
      <button
        type="button"
        onClick={() => void merge.startMerge()}
        disabled={!merge.isReadyToMerge || isMerging}
        className="flex w-full items-center justify-center gap-2 rounded-md bg-accent-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-accent-700 disabled:cursor-not-allowed disabled:opacity-50"
      >
        <LayersIcon className="h-4 w-4" />
        {isMerging ? 'Merging…' : 'Merge PDFs'}
      </button>
    </div>
  )

  return (
    <div className="mx-auto flex w-full max-w-6xl min-h-0 flex-1 flex-col overflow-y-auto px-4 py-8 sm:px-6 lg:px-8">
      <header className="mb-6 flex flex-col gap-3 border-b border-neutral-200 pb-6 dark:border-neutral-800">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold text-neutral-900 dark:text-white sm:text-3xl">
              Merge PDF Files
            </h1>
            <p className="mt-2 max-w-2xl text-neutral-600 dark:text-neutral-300">
              Combine multiple PDF files into one document without uploading them anywhere.
            </p>
          </div>
          <Link
            to="/"
            className="shrink-0 rounded-md border border-neutral-300 px-3.5 py-2 text-sm font-semibold text-neutral-700 hover:bg-neutral-50 dark:border-neutral-700 dark:text-neutral-200 dark:hover:bg-neutral-800"
          >
            ← Back to tools
          </Link>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-medium text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300">
            <LockIcon className="h-3.5 w-3.5" />
            Processed locally — nothing is uploaded
          </span>
          <span className="inline-flex items-center rounded-full bg-neutral-100 px-3 py-1.5 text-xs font-medium text-neutral-600 dark:bg-neutral-800 dark:text-neutral-300">
            Supported format: .pdf
          </span>
        </div>
      </header>

      <div aria-live="polite" className="sr-only">
        {merge.liveMessage}
      </div>

      {!hasFiles && (
        <div className="mx-auto flex w-full max-w-2xl flex-col gap-4 px-4 sm:px-6">
          <RejectedFilesPanel rejected={merge.rejected} onDismiss={merge.dismissRejected} />
        </div>
      )}

      {!hasFiles && <PdfUploadZone onFiles={merge.addFiles} />}

      {hasFiles && (
        <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-xl border border-neutral-200 dark:border-neutral-800">
          <div className="flex items-center justify-between gap-2 border-b border-neutral-200 px-3 py-2 dark:border-neutral-800">
            <h2 className="text-sm font-semibold text-neutral-700 dark:text-neutral-200">
              Selected files
            </h2>
            <div className="flex items-center gap-1">
              <input
                ref={addMoreInputRef}
                type="file"
                accept=".pdf,application/pdf"
                multiple
                onChange={handleAddMoreChange}
                className="sr-only"
                aria-label="Add more PDF files"
                disabled={isMerging}
              />
              <button
                type="button"
                onClick={() => addMoreInputRef.current?.click()}
                disabled={isMerging}
                title="Add more files"
                aria-label="Add more files to the merge"
                className="flex h-8 w-8 items-center justify-center rounded-md text-neutral-500 hover:bg-neutral-100 disabled:cursor-not-allowed disabled:opacity-50 dark:text-neutral-400 dark:hover:bg-neutral-800"
              >
                <PlusIcon className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() => setClearOpen(true)}
                disabled={isMerging}
                title="Clear all files"
                aria-label="Clear all selected PDF files"
                className="flex h-8 w-8 items-center justify-center rounded-md text-neutral-500 hover:bg-red-50 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-50 dark:text-neutral-400 dark:hover:bg-red-950/40 dark:hover:text-red-400"
              >
                <TrashIcon className="h-4 w-4" />
              </button>
            </div>
          </div>

          <RejectedFilesPanel rejected={merge.rejected} onDismiss={merge.dismissRejected} />

          {merge.mergeStatus === 'merging' && <MergeProgress progress={merge.progress} />}
          {merge.mergeStatus === 'success' && merge.result && (
            <MergeSuccessPanel
              result={merge.result}
              onDownloadAgain={merge.downloadAgain}
              onStartNewMerge={merge.startNewMerge}
            />
          )}
          {merge.mergeStatus === 'error' && merge.mergeError && (
            <MergeErrorPanel message={merge.mergeError} onDismiss={merge.startNewMerge} />
          )}

          <div className="min-h-0 flex-1 overflow-y-auto">
            {isDesktop ? (
              <div className="flex h-full min-h-0">
                <div className="min-h-0 flex-1 overflow-y-auto">
                  <PdfFileList
                    entries={merge.entries}
                    disabled={isMerging}
                    onRemove={merge.removeFile}
                    onMoveUp={merge.moveUp}
                    onMoveDown={merge.moveDown}
                    onMoveToFirst={merge.moveToFirst}
                    onMoveToLast={merge.moveToLast}
                    onReorder={merge.reorder}
                    onPageRangeModeChange={merge.setPageRangeMode}
                    onPageRangeInputChange={merge.setPageRangeInput}
                    onPageRangeReset={merge.resetPageRange}
                  />
                </div>
                <div className="flex min-h-0 w-80 shrink-0 flex-col border-l border-neutral-200 dark:border-neutral-800">
                  <div className="min-h-0 flex-1 overflow-y-auto">{sidebarContent}</div>
                  {mergeButton}
                </div>
              </div>
            ) : (
              <div className="flex flex-col divide-y divide-neutral-200 dark:divide-neutral-800">
                <PdfFileList
                  entries={merge.entries}
                  disabled={isMerging}
                  onRemove={merge.removeFile}
                  onMoveUp={merge.moveUp}
                  onMoveDown={merge.moveDown}
                  onMoveToFirst={merge.moveToFirst}
                  onMoveToLast={merge.moveToLast}
                  onReorder={merge.reorder}
                  onPageRangeModeChange={merge.setPageRangeMode}
                  onPageRangeInputChange={merge.setPageRangeInput}
                  onPageRangeReset={merge.resetPageRange}
                />
                {sidebarContent}
                {mergeButton}
              </div>
            )}
          </div>
        </div>
      )}

      <ConfirmDialog
        open={clearOpen}
        title="Clear all files?"
        description="This removes every selected PDF from memory. This cannot be undone."
        confirmLabel="Clear all"
        onConfirm={() => {
          merge.clearAll()
          setClearOpen(false)
        }}
        onCancel={() => setClearOpen(false)}
      />
    </div>
  )
}
