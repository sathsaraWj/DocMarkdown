import type { MergePdfFileEntry } from '@/types/mergePdf'

function formatSize(bytes: number): string {
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

function formatDate(iso: string | null): string | null {
  if (!iso) return null
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return null
  return date.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })
}

interface PdfFileMetadataProps {
  entry: MergePdfFileEntry
}

/** Read-only summary of what local PDF inspection found for one file — never the document's text content. */
export function PdfFileMetadata({ entry }: PdfFileMetadataProps) {
  const modified = formatDate(new Date(entry.lastModified).toISOString())

  return (
    <dl className="flex flex-wrap gap-x-4 gap-y-0.5 text-xs text-neutral-500 dark:text-neutral-400">
      <div className="flex gap-1">
        <dt className="sr-only">File size</dt>
        <dd>{formatSize(entry.size)}</dd>
      </div>
      {entry.pageCount !== null && (
        <div className="flex gap-1">
          <dt className="sr-only">Page count</dt>
          <dd>
            {entry.pageCount} page{entry.pageCount === 1 ? '' : 's'}
          </dd>
        </div>
      )}
      {entry.author && (
        <div className="flex gap-1">
          <dt className="sr-only">Author</dt>
          <dd>by {entry.author}</dd>
        </div>
      )}
      {modified && (
        <div className="flex gap-1">
          <dt className="sr-only">Modified</dt>
          <dd>modified {modified}</dd>
        </div>
      )}
    </dl>
  )
}
