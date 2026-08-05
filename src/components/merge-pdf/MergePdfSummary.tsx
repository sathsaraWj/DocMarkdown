import { SectionHeading } from '@/components/settings/fields'
import { MERGE_PDF_LIMITS } from '@/types/mergePdf'
import type { MergePdfFileEntry } from '@/types/mergePdf'

function formatSize(bytes: number): string {
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

interface MergePdfSummaryProps {
  entries: MergePdfFileEntry[]
}

export function MergePdfSummary({ entries }: MergePdfSummaryProps) {
  const totalSize = entries.reduce((sum, entry) => sum + entry.size, 0)
  const readyCount = entries.filter((e) => e.status === 'ready').length

  return (
    <div className="flex flex-col gap-2">
      <SectionHeading>Summary</SectionHeading>
      <dl className="grid grid-cols-2 gap-2 text-sm">
        <div>
          <dt className="text-xs text-neutral-500 dark:text-neutral-400">Files</dt>
          <dd className="font-medium text-neutral-900 dark:text-white">
            {entries.length} / {MERGE_PDF_LIMITS.maxFiles}
          </dd>
        </div>
        <div>
          <dt className="text-xs text-neutral-500 dark:text-neutral-400">Combined size</dt>
          <dd className="font-medium text-neutral-900 dark:text-white">
            {formatSize(totalSize)} / {formatSize(MERGE_PDF_LIMITS.maxCombinedSizeBytes)}
          </dd>
        </div>
      </dl>
      {readyCount < entries.length && (
        <p className="text-xs text-neutral-500 dark:text-neutral-400">
          {readyCount} of {entries.length} files ready
        </p>
      )}
    </div>
  )
}
