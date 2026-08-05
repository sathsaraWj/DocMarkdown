import { describe, expect, it, vi } from 'vitest'
import { fireEvent, render, screen } from '@testing-library/react'

import type { MergePdfFileEntry } from '@/types/mergePdf'
import { PdfFileListItem } from '../PdfFileListItem'

function makeEntry(overrides: Partial<MergePdfFileEntry> = {}): MergePdfFileEntry {
  return {
    id: 'entry-1',
    file: new File(['x'], 'report.pdf', { type: 'application/pdf' }),
    name: 'report.pdf',
    size: 2048,
    lastModified: Date.parse('2024-01-01T00:00:00.000Z'),
    status: 'ready',
    errorMessage: null,
    pageCount: 4,
    title: null,
    author: null,
    createdAt: null,
    encrypted: false,
    pageRangeMode: 'all',
    pageRangeInput: '',
    resolvedPages: [1, 2, 3, 4],
    pageRangeError: null,
    ...overrides,
  }
}

const noop = () => {}

function renderItem(overrides: Partial<MergePdfFileEntry> = {}, index = 0, total = 3) {
  return render(
    <ol>
      <PdfFileListItem
        entry={makeEntry(overrides)}
        index={index}
        total={total}
        onRemove={vi.fn()}
        onMoveUp={vi.fn()}
        onMoveDown={vi.fn()}
        onMoveToFirst={vi.fn()}
        onMoveToLast={vi.fn()}
        onPageRangeModeChange={noop}
        onPageRangeInputChange={noop}
        onPageRangeReset={noop}
        onDragStart={noop}
        onDragOver={noop}
        onDrop={noop}
      />
    </ol>,
  )
}

describe('PdfFileListItem', () => {
  it('shows the position, name, size, and page count', () => {
    renderItem({}, 1, 3)
    expect(screen.getByText(/position 2 of 3/i)).toBeInTheDocument()
    expect(screen.getByText('report.pdf')).toBeInTheDocument()
    expect(screen.getByText('2 KB')).toBeInTheDocument()
    expect(screen.getByText('4 pages')).toBeInTheDocument()
  })

  it('shows a validating status while inspection is in progress', () => {
    renderItem({ status: 'validating', pageCount: null })
    expect(screen.getByText('Checking…')).toBeInTheDocument()
  })

  it('shows the error message for an invalid file instead of metadata', () => {
    renderItem({
      status: 'invalid',
      errorMessage: 'This PDF could not be read. It may be corrupted or password-protected.',
    })
    expect(screen.getByText(/could not be read/i)).toBeInTheDocument()
  })

  it('shows an encrypted status with its message', () => {
    renderItem({ status: 'encrypted', errorMessage: 'Encrypted PDFs are not currently supported.' })
    expect(screen.getByText('Encrypted')).toBeInTheDocument()
    expect(screen.getByText(/not currently supported/i)).toBeInTheDocument()
  })

  it('calls onRemove when the remove button is clicked', () => {
    const onRemove = vi.fn()
    render(
      <ol>
        <PdfFileListItem
          entry={makeEntry()}
          index={0}
          total={1}
          onRemove={onRemove}
          onMoveUp={noop}
          onMoveDown={noop}
          onMoveToFirst={noop}
          onMoveToLast={noop}
          onPageRangeModeChange={noop}
          onPageRangeInputChange={noop}
          onPageRangeReset={noop}
          onDragStart={noop}
          onDragOver={noop}
          onDrop={noop}
        />
      </ol>,
    )
    fireEvent.click(screen.getByRole('button', { name: /remove report\.pdf/i }))
    expect(onRemove).toHaveBeenCalledWith('entry-1')
  })

  it('calls onMoveUp/onMoveDown/onMoveToFirst/onMoveToLast with the entry id', () => {
    const onMoveUp = vi.fn()
    const onMoveDown = vi.fn()
    const onMoveToFirst = vi.fn()
    const onMoveToLast = vi.fn()
    render(
      <ol>
        <PdfFileListItem
          entry={makeEntry()}
          index={1}
          total={3}
          onRemove={noop}
          onMoveUp={onMoveUp}
          onMoveDown={onMoveDown}
          onMoveToFirst={onMoveToFirst}
          onMoveToLast={onMoveToLast}
          onPageRangeModeChange={noop}
          onPageRangeInputChange={noop}
          onPageRangeReset={noop}
          onDragStart={noop}
          onDragOver={noop}
          onDrop={noop}
        />
      </ol>,
    )
    fireEvent.click(screen.getByRole('button', { name: /move report\.pdf up/i }))
    fireEvent.click(screen.getByRole('button', { name: /move report\.pdf down/i }))
    fireEvent.click(screen.getByRole('button', { name: /move report\.pdf to first position/i }))
    fireEvent.click(screen.getByRole('button', { name: /move report\.pdf to last position/i }))
    expect(onMoveUp).toHaveBeenCalledWith('entry-1')
    expect(onMoveDown).toHaveBeenCalledWith('entry-1')
    expect(onMoveToFirst).toHaveBeenCalledWith('entry-1')
    expect(onMoveToLast).toHaveBeenCalledWith('entry-1')
  })

  it('disables move-up and move-to-first for the first item', () => {
    renderItem({}, 0, 3)
    expect(screen.getByRole('button', { name: /move report\.pdf up/i })).toBeDisabled()
    expect(screen.getByRole('button', { name: /move report\.pdf to first position/i })).toBeDisabled()
  })

  it('disables move-down and move-to-last for the last item', () => {
    renderItem({}, 2, 3)
    expect(screen.getByRole('button', { name: /move report\.pdf down/i })).toBeDisabled()
    expect(screen.getByRole('button', { name: /move report\.pdf to last position/i })).toBeDisabled()
  })

  it('shows the page-range control only once the file is ready', () => {
    renderItem({ status: 'validating', pageCount: null })
    expect(screen.queryByText(/pages to include/i)).not.toBeInTheDocument()
  })

  it('shows an invalid page-range error inline', () => {
    renderItem({
      pageRangeMode: 'custom',
      pageRangeInput: '1-3,15',
      resolvedPages: null,
      pageRangeError: "Page 15 is beyond this document's last page (4).",
    })
    expect(screen.getByRole('alert')).toHaveTextContent(/beyond this document's last page/i)
  })
})
