import { describe, expect, it, vi } from 'vitest'
import { fireEvent, render, screen } from '@testing-library/react'

import { RejectedFilesPanel } from '../RejectedFilesPanel'

describe('RejectedFilesPanel', () => {
  it('renders nothing when there are no rejected files', () => {
    const { container } = render(<RejectedFilesPanel rejected={[]} onDismiss={() => {}} />)
    expect(container).toBeEmptyDOMElement()
  })

  it('lists each rejected file with its reason', () => {
    render(
      <RejectedFilesPanel
        rejected={[
          { name: 'notes.txt', reason: 'Only PDF files are supported.' },
          { name: 'huge.pdf', reason: 'This PDF exceeds the 50 MB individual file limit.' },
        ]}
        onDismiss={() => {}}
      />,
    )
    expect(screen.getByText('notes.txt')).toBeInTheDocument()
    expect(screen.getByText(/only pdf files are supported/i)).toBeInTheDocument()
    expect(screen.getByText('huge.pdf')).toBeInTheDocument()
    expect(screen.getByText(/50 mb individual file limit/i)).toBeInTheDocument()
  })

  it('calls onDismiss when the dismiss button is clicked', () => {
    const onDismiss = vi.fn()
    render(
      <RejectedFilesPanel
        rejected={[{ name: 'x.txt', reason: 'Only PDF files are supported.' }]}
        onDismiss={onDismiss}
      />,
    )
    fireEvent.click(screen.getByRole('button', { name: /dismiss rejected files notice/i }))
    expect(onDismiss).toHaveBeenCalled()
  })
})
