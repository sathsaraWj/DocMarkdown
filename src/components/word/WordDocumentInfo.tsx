import { CheckIcon, FileTextIcon } from '@/components/common/icons'
import type { WordConversionStatus } from '@/types/word'

interface WordDocumentInfoProps {
  fileName: string
  fileSize: number
  status: WordConversionStatus
  extractedTitle: string | null
}

function formatSize(bytes: number): string {
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

const STATUS_LABEL: Record<WordConversionStatus, string> = {
  idle: 'No document loaded',
  validating: 'Checking file…',
  parsing: 'Converting document…',
  ready: 'Ready',
  'ready-with-warnings': 'Ready (with warnings)',
  invalid: 'Invalid file',
  error: 'Conversion failed',
}

export function WordDocumentInfo({ fileName, fileSize, status, extractedTitle }: WordDocumentInfoProps) {
  const isBusy = status === 'validating' || status === 'parsing'
  const isReady = status === 'ready' || status === 'ready-with-warnings'

  return (
    <div className="flex flex-col gap-2 border-b border-neutral-200 px-4 py-3 dark:border-neutral-800 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex min-w-0 items-center gap-3">
        <span
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-accent-50 text-accent-600 dark:bg-accent-950/40 dark:text-accent-400"
          aria-hidden="true"
        >
          <FileTextIcon className="h-5 w-5" />
        </span>
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-neutral-900 dark:text-white" title={fileName}>
            {fileName}
          </p>
          <p className="text-xs text-neutral-500 dark:text-neutral-400">{formatSize(fileSize)}</p>
        </div>
      </div>

      <div
        role="status"
        aria-live="polite"
        className="flex items-center gap-2 text-xs font-medium text-neutral-600 dark:text-neutral-300"
      >
        {isBusy && (
          <span
            className="h-3 w-3 animate-spin rounded-full border-2 border-neutral-300 border-t-accent-600 dark:border-neutral-600"
            aria-hidden="true"
          />
        )}
        {isReady && <CheckIcon className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />}
        <span>{STATUS_LABEL[status]}</span>
        {extractedTitle && isReady && (
          <span className="hidden text-neutral-400 sm:inline">· "{extractedTitle}"</span>
        )}
      </div>
    </div>
  )
}
