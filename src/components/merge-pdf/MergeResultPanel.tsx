import { AlertTriangleIcon, CheckIcon, DownloadIcon, RefreshIcon } from '@/components/common/icons'
import type { MergePdfResult } from '@/types/mergePdf'

function formatSize(bytes: number): string {
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

interface MergeSuccessPanelProps {
  result: MergePdfResult
  onDownloadAgain: () => void
  onStartNewMerge: () => void
}

export function MergeSuccessPanel({ result, onDownloadAgain, onStartNewMerge }: MergeSuccessPanelProps) {
  return (
    <div
      role="status"
      className="flex flex-col gap-3 border-b border-emerald-200 bg-emerald-50 px-4 py-4 text-sm text-emerald-800 dark:border-emerald-900 dark:bg-emerald-950/30 dark:text-emerald-200"
    >
      <p className="flex items-center gap-2 font-semibold">
        <CheckIcon className="h-4 w-4 shrink-0" />
        Merge complete
      </p>
      <dl className="grid grid-cols-2 gap-2 text-xs sm:grid-cols-4">
        <div>
          <dt className="text-emerald-700/70 dark:text-emerald-300/70">Filename</dt>
          <dd className="font-medium">{result.filename}</dd>
        </div>
        <div>
          <dt className="text-emerald-700/70 dark:text-emerald-300/70">Source PDFs</dt>
          <dd className="font-medium">{result.sourceFileCount}</dd>
        </div>
        <div>
          <dt className="text-emerald-700/70 dark:text-emerald-300/70">Pages</dt>
          <dd className="font-medium">{result.pageCount}</dd>
        </div>
        <div>
          <dt className="text-emerald-700/70 dark:text-emerald-300/70">File size</dt>
          <dd className="font-medium">{formatSize(result.fileSize)}</dd>
        </div>
      </dl>
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={onDownloadAgain}
          className="flex items-center gap-1.5 rounded-md bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-emerald-700"
        >
          <DownloadIcon className="h-3.5 w-3.5" />
          Download again
        </button>
        <button
          type="button"
          onClick={onStartNewMerge}
          className="flex items-center gap-1.5 rounded-md border border-emerald-300 px-3 py-1.5 text-xs font-semibold text-emerald-700 hover:bg-emerald-100 dark:border-emerald-800 dark:text-emerald-200 dark:hover:bg-emerald-900/40"
        >
          <RefreshIcon className="h-3.5 w-3.5" />
          Start a new merge
        </button>
      </div>
    </div>
  )
}

interface MergeErrorPanelProps {
  message: string
  onDismiss: () => void
}

export function MergeErrorPanel({ message, onDismiss }: MergeErrorPanelProps) {
  return (
    <div
      role="alert"
      className="flex flex-col gap-2 border-b border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/40 dark:text-red-300"
    >
      <p className="flex items-center gap-2 font-semibold">
        <AlertTriangleIcon className="h-4 w-4 shrink-0" />
        Merge failed
      </p>
      <p>{message}</p>
      <button
        type="button"
        onClick={onDismiss}
        className="self-start rounded-md border border-red-300 px-3 py-1.5 text-xs font-semibold text-red-700 hover:bg-red-100 dark:border-red-800 dark:text-red-300 dark:hover:bg-red-900/40"
      >
        Dismiss and try again
      </button>
    </div>
  )
}
