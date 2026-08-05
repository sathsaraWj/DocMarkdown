import type { SaveStatus } from '@/app/DocumentContext'
import type { DocumentStats } from '@/hooks/useDocumentStats'

interface EditorStatusBarProps {
  stats: DocumentStats
  saveStatus: SaveStatus
  lastEditedAt: string | null
}

const SAVE_STATUS_LABEL: Record<SaveStatus, string> = {
  saved: 'Saved locally',
  saving: 'Saving…',
  error: 'Could not save locally',
  unavailable: 'Local storage unavailable',
}

function formatTimestamp(iso: string | null): string | null {
  if (!iso) return null
  try {
    return new Date(iso).toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' })
  } catch {
    return null
  }
}

export function EditorStatusBar({ stats, saveStatus, lastEditedAt }: EditorStatusBarProps) {
  const timestamp = formatTimestamp(lastEditedAt)

  return (
    <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1 border-t border-neutral-200 bg-neutral-50 px-3 py-1.5 text-xs text-neutral-500 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-400">
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
        <span>{stats.words.toLocaleString()} words</span>
        <span aria-hidden="true">·</span>
        <span>{stats.characters.toLocaleString()} characters</span>
        <span aria-hidden="true">·</span>
        <span>{stats.readingTimeMinutes} min read</span>
      </div>
      <div className="flex items-center gap-2" role="status" aria-live="polite">
        <span
          className={`h-1.5 w-1.5 rounded-full ${
            saveStatus === 'saved'
              ? 'bg-emerald-500'
              : saveStatus === 'saving'
                ? 'bg-amber-500'
                : 'bg-red-500'
          }`}
          aria-hidden="true"
        />
        <span>
          {SAVE_STATUS_LABEL[saveStatus]}
          {saveStatus === 'saved' && timestamp ? ` at ${timestamp}` : ''}
        </span>
      </div>
    </div>
  )
}
