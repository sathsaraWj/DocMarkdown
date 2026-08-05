import type { DragEvent } from 'react'

import {
  AlertTriangleIcon,
  ArrowDownIcon,
  ArrowUpIcon,
  ChevronsDownIcon,
  ChevronsUpIcon,
  CheckIcon,
  GripVerticalIcon,
  TrashIcon,
} from '@/components/common/icons'
import { PdfFileMetadata } from '@/components/merge-pdf/PdfFileMetadata'
import { PdfPageRangeInput } from '@/components/merge-pdf/PdfPageRangeInput'
import type { MergePdfFileEntry, PageRangeMode } from '@/types/mergePdf'

interface PdfFileListItemProps {
  entry: MergePdfFileEntry
  index: number
  total: number
  disabled?: boolean
  onRemove: (id: string) => void
  onMoveUp: (id: string) => void
  onMoveDown: (id: string) => void
  onMoveToFirst: (id: string) => void
  onMoveToLast: (id: string) => void
  onPageRangeModeChange: (id: string, mode: PageRangeMode) => void
  onPageRangeInputChange: (id: string, input: string) => void
  onPageRangeReset: (id: string) => void
  onDragStart: (index: number) => void
  onDragOver: (index: number) => void
  onDrop: () => void
}

const STATUS_LABEL: Record<MergePdfFileEntry['status'], string> = {
  validating: 'Checking…',
  ready: 'Ready',
  invalid: 'Invalid',
  encrypted: 'Encrypted',
}

export function PdfFileListItem({
  entry,
  index,
  total,
  disabled,
  onRemove,
  onMoveUp,
  onMoveDown,
  onMoveToFirst,
  onMoveToLast,
  onPageRangeModeChange,
  onPageRangeInputChange,
  onPageRangeReset,
  onDragStart,
  onDragOver,
  onDrop,
}: PdfFileListItemProps) {
  const isFirst = index === 0
  const isLast = index === total - 1
  const isBusy = entry.status === 'validating'
  const hasError = entry.status === 'invalid' || entry.status === 'encrypted'

  const handleDragStart = (event: DragEvent<HTMLLIElement>) => {
    event.dataTransfer.effectAllowed = 'move'
    onDragStart(index)
  }
  const handleDragOver = (event: DragEvent<HTMLLIElement>) => {
    event.preventDefault()
    onDragOver(index)
  }
  const handleDrop = (event: DragEvent<HTMLLIElement>) => {
    event.preventDefault()
    onDrop()
  }

  return (
    <li
      draggable={!disabled}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      className="flex flex-col gap-2 border-b border-neutral-200 px-3 py-3 last:border-b-0 dark:border-neutral-800 sm:flex-row sm:items-start"
    >
      <div className="flex items-start gap-2 sm:pt-1">
        <span
          aria-hidden="true"
          title="Drag to reorder"
          className={`flex h-6 w-6 shrink-0 items-center justify-center text-neutral-400 ${disabled ? 'cursor-not-allowed' : 'cursor-grab'}`}
        >
          <GripVerticalIcon className="h-4 w-4" />
        </span>
        <span
          className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-neutral-100 text-xs font-semibold text-neutral-600 dark:bg-neutral-800 dark:text-neutral-300"
          aria-hidden="true"
        >
          {index + 1}
        </span>
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <p
            className="max-w-full truncate text-sm font-medium text-neutral-900 dark:text-white"
            title={entry.name}
          >
            <span className="sr-only">Position {index + 1} of {total}: </span>
            {entry.name}
          </p>
          <span
            role="status"
            className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium ${
              hasError
                ? 'bg-red-50 text-red-700 dark:bg-red-950/40 dark:text-red-300'
                : entry.status === 'ready'
                  ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300'
                  : 'bg-neutral-100 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-300'
            }`}
          >
            {isBusy && (
              <span
                className="h-2.5 w-2.5 animate-spin rounded-full border-2 border-neutral-300 border-t-accent-600 motion-reduce:animate-none dark:border-neutral-600"
                aria-hidden="true"
              />
            )}
            {entry.status === 'ready' && <CheckIcon className="h-3 w-3" />}
            {hasError && <AlertTriangleIcon className="h-3 w-3" />}
            {STATUS_LABEL[entry.status]}
          </span>
        </div>

        {hasError ? (
          <p className="mt-1 text-xs text-red-600 dark:text-red-400">{entry.errorMessage}</p>
        ) : (
          <PdfFileMetadata entry={entry} />
        )}

        {entry.status === 'ready' && (
          <div className="mt-2">
            <PdfPageRangeInput
              entry={entry}
              disabled={disabled}
              onModeChange={(mode) => onPageRangeModeChange(entry.id, mode)}
              onInputChange={(input) => onPageRangeInputChange(entry.id, input)}
              onReset={() => onPageRangeReset(entry.id)}
            />
          </div>
        )}
      </div>

      <div className="flex shrink-0 items-center gap-0.5 self-start">
        <button
          type="button"
          disabled={disabled || isFirst}
          onClick={() => onMoveToFirst(entry.id)}
          title="Move to first"
          aria-label={`Move ${entry.name} to first position`}
          className="flex h-8 w-8 items-center justify-center rounded-md text-neutral-500 hover:bg-neutral-100 disabled:cursor-not-allowed disabled:opacity-30 dark:text-neutral-400 dark:hover:bg-neutral-800"
        >
          <ChevronsUpIcon className="h-4 w-4" />
        </button>
        <button
          type="button"
          disabled={disabled || isFirst}
          onClick={() => onMoveUp(entry.id)}
          title="Move up"
          aria-label={`Move ${entry.name} up`}
          className="flex h-8 w-8 items-center justify-center rounded-md text-neutral-500 hover:bg-neutral-100 disabled:cursor-not-allowed disabled:opacity-30 dark:text-neutral-400 dark:hover:bg-neutral-800"
        >
          <ArrowUpIcon className="h-4 w-4" />
        </button>
        <button
          type="button"
          disabled={disabled || isLast}
          onClick={() => onMoveDown(entry.id)}
          title="Move down"
          aria-label={`Move ${entry.name} down`}
          className="flex h-8 w-8 items-center justify-center rounded-md text-neutral-500 hover:bg-neutral-100 disabled:cursor-not-allowed disabled:opacity-30 dark:text-neutral-400 dark:hover:bg-neutral-800"
        >
          <ArrowDownIcon className="h-4 w-4" />
        </button>
        <button
          type="button"
          disabled={disabled || isLast}
          onClick={() => onMoveToLast(entry.id)}
          title="Move to last"
          aria-label={`Move ${entry.name} to last position`}
          className="flex h-8 w-8 items-center justify-center rounded-md text-neutral-500 hover:bg-neutral-100 disabled:cursor-not-allowed disabled:opacity-30 dark:text-neutral-400 dark:hover:bg-neutral-800"
        >
          <ChevronsDownIcon className="h-4 w-4" />
        </button>
        <button
          type="button"
          disabled={disabled}
          onClick={() => onRemove(entry.id)}
          title="Remove file"
          aria-label={`Remove ${entry.name}`}
          className="flex h-8 w-8 items-center justify-center rounded-md text-neutral-500 hover:bg-red-50 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-30 dark:text-neutral-400 dark:hover:bg-red-950/40 dark:hover:text-red-400"
        >
          <TrashIcon className="h-4 w-4" />
        </button>
      </div>
    </li>
  )
}
