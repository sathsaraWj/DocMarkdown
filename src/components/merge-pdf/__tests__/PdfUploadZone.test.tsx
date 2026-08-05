import { describe, expect, it, vi } from 'vitest'
import { fireEvent, render, screen } from '@testing-library/react'

import { PdfUploadZone } from '../PdfUploadZone'

function makeFile(name: string): File {
  return new File(['content'], name, { type: 'application/pdf' })
}

describe('PdfUploadZone', () => {
  it('renders a labeled, keyboard-focusable drop zone with limit info', () => {
    render(<PdfUploadZone onFiles={() => {}} />)
    expect(screen.getByLabelText(/choose pdf files to merge/i)).toBeInTheDocument()
    const dropzone = screen.getByRole('button', { name: /drag and drop pdf files here/i })
    expect(dropzone).toHaveAttribute('tabIndex', '0')
    expect(screen.getByText(/50 files max/i)).toBeInTheDocument()
  })

  it('calls onFiles with every file selected via the input', () => {
    const onFiles = vi.fn()
    render(<PdfUploadZone onFiles={onFiles} />)
    const input = screen.getByLabelText(/choose pdf files to merge/i) as HTMLInputElement
    const files = [makeFile('a.pdf'), makeFile('b.pdf')]
    fireEvent.change(input, { target: { files } })
    expect(onFiles).toHaveBeenCalledWith(files)
  })

  it('calls onFiles when multiple files are dropped', () => {
    const onFiles = vi.fn()
    render(<PdfUploadZone onFiles={onFiles} />)
    const dropzone = screen.getByRole('button', { name: /drag and drop pdf files here/i })
    const files = [makeFile('a.pdf'), makeFile('b.pdf')]
    fireEvent.drop(dropzone, { dataTransfer: { files, types: ['Files'] } })
    expect(onFiles).toHaveBeenCalledWith(files)
  })

  it('shows a drag-active state while files are dragged over', () => {
    render(<PdfUploadZone onFiles={() => {}} />)
    const dropzone = screen.getByRole('button', { name: /drag and drop pdf files here/i })
    fireEvent.dragEnter(dropzone, { dataTransfer: { types: ['Files'] } })
    expect(screen.getByText(/drop the files to upload them/i)).toBeInTheDocument()
  })

  it('opens the file picker on Enter/Space keypress', () => {
    render(<PdfUploadZone onFiles={() => {}} />)
    const dropzone = screen.getByRole('button', { name: /drag and drop pdf files here/i })
    const input = screen.getByLabelText(/choose pdf files to merge/i) as HTMLInputElement
    const clickSpy = vi.spyOn(input, 'click')
    fireEvent.keyDown(dropzone, { key: 'Enter' })
    expect(clickSpy).toHaveBeenCalled()
  })

  it('disables interaction when disabled is set', () => {
    render(<PdfUploadZone onFiles={() => {}} disabled />)
    const dropzone = screen.getByRole('button', { name: /drag and drop pdf files here/i })
    expect(dropzone).toHaveAttribute('aria-disabled', 'true')
    expect(dropzone).toHaveAttribute('tabIndex', '-1')
  })
})
