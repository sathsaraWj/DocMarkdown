import type { SaveStatus } from '@/app/DocumentContext'
import type { EditorCursorPosition } from '@/components/editor/MarkdownEditor'
import type { DocumentStats } from '@/hooks/useDocumentStats'
import { SaveStatusIndicator } from './SaveStatusIndicator'

interface EditorStatusBarProps {
  stats: DocumentStats
  saveStatus: SaveStatus
  lastEditedAt: string | null
  cursor?: EditorCursorPosition
}

export function EditorStatusBar({ stats, saveStatus, lastEditedAt, cursor }: EditorStatusBarProps) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1 border-t border-neutral-200 bg-neutral-50 px-3 py-1.5 text-xs text-neutral-500 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-400">
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
        <span>{stats.words.toLocaleString()} words</span>
        <span aria-hidden="true">·</span>
        <span>{stats.characters.toLocaleString()} characters</span>
        <span aria-hidden="true">·</span>
        <span>{stats.readingTimeMinutes} min read</span>
        {cursor && (
          <>
            <span aria-hidden="true">·</span>
            <span>
              Ln {cursor.line}, Col {cursor.column}
            </span>
          </>
        )}
      </div>
      <SaveStatusIndicator saveStatus={saveStatus} lastEditedAt={lastEditedAt} />
    </div>
  )
}
