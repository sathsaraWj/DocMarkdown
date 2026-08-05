import { useRef } from 'react'

import { PdfFileListItem } from '@/components/merge-pdf/PdfFileListItem'
import type { MergePdfFileEntry, PageRangeMode } from '@/types/mergePdf'

interface PdfFileListProps {
  entries: MergePdfFileEntry[]
  disabled?: boolean
  onRemove: (id: string) => void
  onMoveUp: (id: string) => void
  onMoveDown: (id: string) => void
  onMoveToFirst: (id: string) => void
  onMoveToLast: (id: string) => void
  onReorder: (fromIndex: number, toIndex: number) => void
  onPageRangeModeChange: (id: string, mode: PageRangeMode) => void
  onPageRangeInputChange: (id: string, input: string) => void
  onPageRangeReset: (id: string) => void
}

/**
 * Renders the ordered PDF list with two independent ways to reorder: native
 * HTML5 drag-and-drop on each row, and the discrete move buttons on
 * PdfFileListItem (the only way to reorder without a mouse/touch drag).
 */
export function PdfFileList({
  entries,
  disabled,
  onRemove,
  onMoveUp,
  onMoveDown,
  onMoveToFirst,
  onMoveToLast,
  onReorder,
  onPageRangeModeChange,
  onPageRangeInputChange,
  onPageRangeReset,
}: PdfFileListProps) {
  const dragIndexRef = useRef<number | null>(null)

  if (entries.length === 0) return null

  return (
    <ol
      aria-label={`Selected PDF files, ${entries.length} total, in merge order`}
      className="flex flex-col divide-y divide-neutral-200 dark:divide-neutral-800"
    >
      {entries.map((entry, index) => (
        <PdfFileListItem
          key={entry.id}
          entry={entry}
          index={index}
          total={entries.length}
          disabled={disabled}
          onRemove={onRemove}
          onMoveUp={onMoveUp}
          onMoveDown={onMoveDown}
          onMoveToFirst={onMoveToFirst}
          onMoveToLast={onMoveToLast}
          onPageRangeModeChange={onPageRangeModeChange}
          onPageRangeInputChange={onPageRangeInputChange}
          onPageRangeReset={onPageRangeReset}
          onDragStart={(dragIndex) => {
            dragIndexRef.current = dragIndex
          }}
          onDragOver={() => {}}
          onDrop={() => {
            const from = dragIndexRef.current
            dragIndexRef.current = null
            if (from !== null && from !== index) onReorder(from, index)
          }}
        />
      ))}
    </ol>
  )
}
