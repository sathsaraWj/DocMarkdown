import { describe, expect, it } from 'vitest'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'

import { DEFAULT_DOCUMENT_SETTINGS } from '@/types/settings'
import { DEFAULT_WORD_IMAGE_OPTIONS } from '@/types/word'
import { WordExportPanel } from '../WordExportPanel'

const SAMPLE_HTML = '<h1>Report</h1><p>Some content.</p>'

describe('WordExportPanel', () => {
  it('disables every export action when the document is not ready', () => {
    render(
      <WordExportPanel
        html=""
        ready={false}
        images={DEFAULT_WORD_IMAGE_OPTIONS}
        settings={DEFAULT_DOCUMENT_SETTINGS}
      />,
    )
    expect(screen.getByRole('button', { name: /export pdf/i })).toBeDisabled()
    expect(screen.getByRole('button', { name: /download html/i })).toBeDisabled()
    expect(screen.getByRole('button', { name: /download plain text/i })).toBeDisabled()
    expect(screen.getByText(/upload and convert a document/i)).toBeInTheDocument()
  })

  it('enables export actions once the document is ready', () => {
    render(
      <WordExportPanel
        html={SAMPLE_HTML}
        ready
        images={DEFAULT_WORD_IMAGE_OPTIONS}
        settings={DEFAULT_DOCUMENT_SETTINGS}
      />,
    )
    expect(screen.getByRole('button', { name: /export pdf/i })).toBeEnabled()
    expect(screen.getByRole('button', { name: /download html/i })).toBeEnabled()
    expect(screen.getByRole('button', { name: /download plain text/i })).toBeEnabled()
  })

  it('runs the plain-text export when clicked without crashing or leaving it stuck', async () => {
    const originalCreateObjectURL = URL.createObjectURL
    const originalRevokeObjectURL = URL.revokeObjectURL
    URL.createObjectURL = () => 'blob:mock'
    URL.revokeObjectURL = () => {}

    render(
      <WordExportPanel
        html={SAMPLE_HTML}
        ready
        images={DEFAULT_WORD_IMAGE_OPTIONS}
        settings={DEFAULT_DOCUMENT_SETTINGS}
      />,
    )

    const button = screen.getByRole('button', { name: /download plain text/i })
    fireEvent.click(button)

    await waitFor(() => {
      expect(button).toBeEnabled()
    })
    expect(screen.queryByRole('alert')).not.toBeInTheDocument()

    URL.createObjectURL = originalCreateObjectURL
    URL.revokeObjectURL = originalRevokeObjectURL
  })
})
