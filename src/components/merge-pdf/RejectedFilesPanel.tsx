import { AlertTriangleIcon, CloseIcon } from '@/components/common/icons'
import type { MergePdfRejectedFile } from '@/types/mergePdf'

interface RejectedFilesPanelProps {
  rejected: MergePdfRejectedFile[]
  onDismiss: () => void
}

/** Non-blocking summary of files that couldn't be added, shown alongside whatever files WERE accepted from the same batch. */
export function RejectedFilesPanel({ rejected, onDismiss }: RejectedFilesPanelProps) {
  if (rejected.length === 0) return null

  return (
    <div
      role="alert"
      className="flex flex-col gap-2 border-b border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-300"
    >
      <div className="flex items-start justify-between gap-2">
        <p className="flex items-center gap-2 font-semibold">
          <AlertTriangleIcon className="h-4 w-4 shrink-0" />
          {rejected.length} file{rejected.length === 1 ? '' : 's'} couldn't be added
        </p>
        <button
          type="button"
          onClick={onDismiss}
          aria-label="Dismiss rejected files notice"
          className="shrink-0 rounded p-1 hover:bg-amber-100 dark:hover:bg-amber-900/40"
        >
          <CloseIcon className="h-4 w-4" />
        </button>
      </div>
      <ul className="flex flex-col gap-1 pl-6 text-xs">
        {rejected.map((file, index) => (
          <li key={`${file.name}-${index}`} className="list-disc">
            <span className="font-medium">{file.name}</span> — {file.reason}
          </li>
        ))}
      </ul>
    </div>
  )
}
