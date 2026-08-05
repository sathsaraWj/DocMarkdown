import { describe, expect, it, vi } from 'vitest'
import { fireEvent, render, screen } from '@testing-library/react'

import { MergeErrorPanel, MergeSuccessPanel } from '../MergeResultPanel'

describe('MergeSuccessPanel', () => {
  const result = {
    blob: new Blob(['x'], { type: 'application/pdf' }),
    filename: 'merged-document.pdf',
    sourceFileCount: 3,
    pageCount: 12,
    fileSize: 234_567,
  }

  it('shows the filename, source count, page count, and file size', () => {
    render(
      <MergeSuccessPanel result={result} onDownloadAgain={vi.fn()} onStartNewMerge={vi.fn()} />,
    )
    expect(screen.getByText('Merge complete')).toBeInTheDocument()
    expect(screen.getByText('merged-document.pdf')).toBeInTheDocument()
    expect(screen.getByText('3')).toBeInTheDocument()
    expect(screen.getByText('12')).toBeInTheDocument()
    expect(screen.getByText('229 KB')).toBeInTheDocument()
  })

  it('calls onDownloadAgain and onStartNewMerge', () => {
    const onDownloadAgain = vi.fn()
    const onStartNewMerge = vi.fn()
    render(
      <MergeSuccessPanel
        result={result}
        onDownloadAgain={onDownloadAgain}
        onStartNewMerge={onStartNewMerge}
      />,
    )
    fireEvent.click(screen.getByRole('button', { name: /download again/i }))
    fireEvent.click(screen.getByRole('button', { name: /start a new merge/i }))
    expect(onDownloadAgain).toHaveBeenCalled()
    expect(onStartNewMerge).toHaveBeenCalled()
  })
})

describe('MergeErrorPanel', () => {
  it('shows the error message and calls onDismiss', () => {
    const onDismiss = vi.fn()
    render(
      <MergeErrorPanel
        message='Could not merge "bad.pdf". It may be corrupted or password-protected.'
        onDismiss={onDismiss}
      />,
    )
    expect(screen.getByRole('alert')).toHaveTextContent(/could not merge "bad\.pdf"/i)
    fireEvent.click(screen.getByRole('button', { name: /dismiss and try again/i }))
    expect(onDismiss).toHaveBeenCalled()
  })
})
