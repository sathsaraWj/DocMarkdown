import { describe, expect, it, vi } from 'vitest'
import { fireEvent, render, screen } from '@testing-library/react'

import { WordUploadZone } from '../WordUploadZone'

function makeFile(name: string): File {
  return new File(['content'], name, { type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' })
}

describe('WordUploadZone', () => {
  it('renders a labeled, keyboard-focusable drop zone with format/size info', () => {
    render(<WordUploadZone onFile={() => {}} />)
    expect(screen.getByLabelText(/choose a \.docx word document/i)).toBeInTheDocument()
    const dropzone = screen.getByRole('button', { name: /drag and drop a \.docx file here/i })
    expect(dropzone).toHaveAttribute('tabIndex', '0')
    expect(screen.getByText(/10 MB/i)).toBeInTheDocument()
  })

  it('calls onFile when a file is selected via the input', () => {
    const onFile = vi.fn()
    render(<WordUploadZone onFile={onFile} />)
    const input = screen.getByLabelText(/choose a \.docx word document/i) as HTMLInputElement
    const file = makeFile('report.docx')
    fireEvent.change(input, { target: { files: [file] } })
    expect(onFile).toHaveBeenCalledWith(file)
  })

  it('calls onFile when a file is dropped', () => {
    const onFile = vi.fn()
    render(<WordUploadZone onFile={onFile} />)
    const dropzone = screen.getByRole('button', { name: /drag and drop a \.docx file here/i })
    const file = makeFile('report.docx')
    fireEvent.drop(dropzone, { dataTransfer: { files: [file], types: ['Files'] } })
    expect(onFile).toHaveBeenCalledWith(file)
  })

  it('shows a drag-active state while a file is dragged over', () => {
    render(<WordUploadZone onFile={() => {}} />)
    const dropzone = screen.getByRole('button', { name: /drag and drop a \.docx file here/i })
    fireEvent.dragEnter(dropzone, { dataTransfer: { types: ['Files'] } })
    expect(screen.getByText(/drop the file to upload it/i)).toBeInTheDocument()
  })

  it('opens the file picker on Enter/Space keypress', () => {
    render(<WordUploadZone onFile={() => {}} />)
    const dropzone = screen.getByRole('button', { name: /drag and drop a \.docx file here/i })
    const input = screen.getByLabelText(/choose a \.docx word document/i) as HTMLInputElement
    const clickSpy = vi.spyOn(input, 'click')
    fireEvent.keyDown(dropzone, { key: 'Enter' })
    expect(clickSpy).toHaveBeenCalled()
  })

  it('disables interaction when disabled is set', () => {
    render(<WordUploadZone onFile={() => {}} disabled />)
    const dropzone = screen.getByRole('button', { name: /drag and drop a \.docx file here/i })
    expect(dropzone).toHaveAttribute('aria-disabled', 'true')
    expect(dropzone).toHaveAttribute('tabIndex', '-1')
  })
})
