import type { KeyboardEvent } from 'react'

import { FileTextIcon, LockIcon, UploadIcon } from '@/components/common/icons'
import { useWordFileDrop } from '@/hooks/useWordFileDrop'
import { MAX_WORD_UPLOAD_SIZE_BYTES } from '@/utils/env'

interface WordUploadZoneProps {
  onFile: (file: File) => void
  disabled?: boolean
}

function formatMaxSize(bytes: number): string {
  return `${(bytes / (1024 * 1024)).toFixed(0)} MB`
}

export function WordUploadZone({ onFile, disabled }: WordUploadZoneProps) {
  const { inputRef, isDragging, openFilePicker, handleInputChange, dragHandlers } =
    useWordFileDrop(onFile)

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (disabled) return
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      openFilePicker()
    }
  }

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-6 px-4 py-10 sm:px-6">
      <label htmlFor="word-file-input" className="sr-only">
        Choose a .docx Word document to upload
      </label>
      <input
        id="word-file-input"
        ref={inputRef}
        type="file"
        accept=".docx,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
        onChange={handleInputChange}
        disabled={disabled}
        className="sr-only"
      />

      <div
        role="button"
        tabIndex={disabled ? -1 : 0}
        aria-disabled={disabled}
        aria-describedby="word-upload-hint"
        onClick={() => !disabled && openFilePicker()}
        onKeyDown={handleKeyDown}
        {...dragHandlers}
        className={`flex flex-col items-center gap-4 rounded-2xl border-2 border-dashed px-6 py-16 text-center transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-500 ${
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
            Drag and drop a .docx file here
          </p>
          <p id="word-upload-hint" className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
            or use the button below. Supported format: <strong>.docx</strong> — up to{' '}
            {formatMaxSize(MAX_WORD_UPLOAD_SIZE_BYTES)}.
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
          {isDragging ? 'Drop the file to upload it' : ''}
        </span>
      </div>

      <div className="flex flex-col gap-3 rounded-xl border border-neutral-200 bg-neutral-50 p-4 text-sm text-neutral-600 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-300">
        <p className="flex items-start gap-2">
          <LockIcon className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
          <span>
            Your document is processed entirely in this browser tab. It is never uploaded to a
            server, and no analytics or third party ever sees its contents.
          </span>
        </p>
        <p>
          Best results with headings, paragraphs, bold/italic text, lists, tables, hyperlinks, and
          small embedded images. Complex layouts (text boxes, SmartArt, multi-column sections,
          tracked changes) may be simplified — see the warnings panel after conversion for
          specifics.
        </p>
      </div>
    </div>
  )
}
