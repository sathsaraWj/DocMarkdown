import type { KeyboardEvent } from 'react'

import { FileTextIcon, LockIcon, UploadIcon } from '@/components/common/icons'
import { useMergePdfDrop } from '@/hooks/useMergePdfDrop'
import { MERGE_PDF_LIMITS } from '@/types/mergePdf'

interface PdfUploadZoneProps {
  onFiles: (files: File[]) => void
  disabled?: boolean
}

function formatMaxSize(bytes: number): string {
  return `${(bytes / (1024 * 1024)).toFixed(0)} MB`
}

export function PdfUploadZone({ onFiles, disabled }: PdfUploadZoneProps) {
  const { inputRef, isDragging, openFilePicker, handleInputChange, dragHandlers } =
    useMergePdfDrop(onFiles)

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (disabled) return
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      openFilePicker()
    }
  }

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-6 px-4 py-10 sm:px-6">
      <label htmlFor="merge-pdf-file-input" className="sr-only">
        Choose PDF files to merge
      </label>
      <input
        id="merge-pdf-file-input"
        ref={inputRef}
        type="file"
        accept=".pdf,application/pdf"
        multiple
        onChange={handleInputChange}
        disabled={disabled}
        className="sr-only"
      />

      <div
        role="button"
        tabIndex={disabled ? -1 : 0}
        aria-disabled={disabled}
        aria-describedby="merge-pdf-upload-hint"
        onClick={() => !disabled && openFilePicker()}
        onKeyDown={handleKeyDown}
        {...dragHandlers}
        className={`flex flex-col items-center gap-4 rounded-2xl border-2 border-dashed px-6 py-16 text-center transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-500 motion-reduce:transition-none ${
          isDragging
            ? 'border-accent-400 bg-accent-50 dark:bg-accent-950/30'
            : 'border-neutral-300 bg-white hover:border-neutral-400 dark:border-neutral-700 dark:bg-neutral-900 dark:hover:border-neutral-600'
        } ${disabled ? 'cursor-not-allowed opacity-60' : 'cursor-pointer'}`}
      >
        <span
          className="flex h-14 w-14 items-center justify-center rounded-full bg-accent-50 text-accent-600 dark:bg-accent-950/40 dark:text-accent-400"
          aria-hidden="true"
        >
          <FileTextIcon className="h-7 w-7" />
        </span>
        <div>
          <p className="text-base font-semibold text-neutral-900 dark:text-white">
            Drag and drop PDF files here
          </p>
          <p id="merge-pdf-upload-hint" className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
            or use the button below. Select multiple files at once. Supported format:{' '}
            <strong>.pdf</strong> — up to {formatMaxSize(MERGE_PDF_LIMITS.maxFileSizeBytes)} each,{' '}
            {formatMaxSize(MERGE_PDF_LIMITS.maxCombinedSizeBytes)} combined,{' '}
            {MERGE_PDF_LIMITS.maxFiles} files max.
          </p>
        </div>
        <button
          type="button"
          disabled={disabled}
          onClick={(event) => {
            event.stopPropagation()
            openFilePicker()
          }}
          className="flex items-center gap-2 rounded-md bg-accent-600 px-4 py-2 text-sm font-semibold text-white hover:bg-accent-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          <UploadIcon className="h-4 w-4" />
          Browse files
        </button>
        <span aria-live="polite" className="sr-only">
          {isDragging ? 'Drop the files to upload them' : ''}
        </span>
      </div>

      <div className="flex flex-col gap-3 rounded-xl border border-neutral-200 bg-neutral-50 p-4 text-sm text-neutral-600 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-300">
        <p className="flex items-start gap-2">
          <LockIcon className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
          <span>
            Your PDFs are processed entirely in this browser tab. They are never uploaded to a
            server, and no analytics or third party ever sees their contents.
          </span>
        </p>
        <p>
          Files are merged in the order they appear in the list below — drag to reorder, or use
          the move up/down/first/last controls, before merging.
        </p>
      </div>
    </div>
  )
}
