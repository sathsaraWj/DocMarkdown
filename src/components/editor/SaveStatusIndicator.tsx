import type { SaveStatus } from '@/app/DocumentContext'

const SAVE_STATUS_LABEL: Record<SaveStatus, string> = {
  saved: 'Saved locally',
  saving: 'Saving…',
  error: 'Could not save locally',
  unavailable: 'Local storage unavailable',
}

function formatSaveTimestamp(iso: string | null): string | null {
  if (!iso) return null
  try {
    return new Date(iso).toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' })
  } catch {
    return null
  }
}

interface SaveStatusIndicatorProps {
  saveStatus: SaveStatus
  lastEditedAt: string | null
  className?: string
}

/** Shared save-status dot + label, used by both the editor's bottom status bar and the top action bar. */
export function SaveStatusIndicator({
  saveStatus,
  lastEditedAt,
  className,
}: SaveStatusIndicatorProps) {
  const timestamp = formatSaveTimestamp(lastEditedAt)
  return (
    <div className={`flex items-center gap-2 ${className ?? ''}`} role="status" aria-live="polite">
      <span
        className={`h-1.5 w-1.5 shrink-0 rounded-full ${
          saveStatus === 'saved'
            ? 'bg-emerald-500'
            : saveStatus === 'saving'
              ? 'bg-amber-500'
              : 'bg-red-500'
        }`}
        aria-hidden="true"
      />
      <span className="whitespace-nowrap">
        {SAVE_STATUS_LABEL[saveStatus]}
        {saveStatus === 'saved' && timestamp ? ` at ${timestamp}` : ''}
      </span>
    </div>
  )
}
