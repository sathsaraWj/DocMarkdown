import { useId } from 'react'

import { RefreshIcon } from '@/components/common/icons'
import type { MergePdfFileEntry } from '@/types/mergePdf'

interface PdfPageRangeInputProps {
  entry: MergePdfFileEntry
  onModeChange: (mode: 'all' | 'custom') => void
  onInputChange: (input: string) => void
  onReset: () => void
  disabled?: boolean
}

export function PdfPageRangeInput({
  entry,
  onModeChange,
  onInputChange,
  onReset,
  disabled,
}: PdfPageRangeInputProps) {
  const groupId = useId()
  const errorId = useId()
  const isCustom = entry.pageRangeMode === 'custom'

  return (
    <div className="flex flex-col gap-2">
      <fieldset className="flex flex-wrap items-center gap-3" disabled={disabled}>
        <legend className="text-xs font-medium text-neutral-600 dark:text-neutral-300">
          Pages to include
        </legend>
        <label className="flex items-center gap-1.5 text-sm text-neutral-700 dark:text-neutral-200">
          <input
            type="radio"
            name={groupId}
            checked={!isCustom}
            onChange={() => onModeChange('all')}
          />
          All pages{entry.pageCount ? ` (${entry.pageCount})` : ''}
        </label>
        <label className="flex items-center gap-1.5 text-sm text-neutral-700 dark:text-neutral-200">
          <input
            type="radio"
            name={groupId}
            checked={isCustom}
            onChange={() => onModeChange('custom')}
          />
          Custom range
        </label>
      </fieldset>

      {isCustom && (
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={entry.pageRangeInput}
              disabled={disabled}
              onChange={(event) => onInputChange(event.target.value)}
              placeholder="e.g. 1-3,6,8-10"
              aria-label={`Page range for ${entry.name}`}
              aria-invalid={entry.pageRangeError !== null}
              aria-describedby={entry.pageRangeError ? errorId : undefined}
              className="w-40 rounded-md border border-neutral-300 bg-white px-2 py-1 text-sm text-neutral-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-500 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-100"
            />
            <button
              type="button"
              onClick={onReset}
              disabled={disabled}
              className="flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium text-neutral-500 hover:bg-neutral-100 disabled:cursor-not-allowed disabled:opacity-60 dark:text-neutral-400 dark:hover:bg-neutral-800"
            >
              <RefreshIcon className="h-3.5 w-3.5" />
              Reset to all pages
            </button>
          </div>
          {entry.pageRangeError && (
            <p id={errorId} role="alert" className="text-xs text-red-600 dark:text-red-400">
              {entry.pageRangeError}
            </p>
          )}
        </div>
      )}
    </div>
  )
}
