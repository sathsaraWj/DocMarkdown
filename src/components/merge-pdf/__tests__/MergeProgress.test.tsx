import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'

import { MergeProgress } from '../MergeProgress'

describe('MergeProgress', () => {
  it('renders nothing when there is no progress yet', () => {
    const { container } = render(<MergeProgress progress={null} />)
    expect(container).toBeEmptyDOMElement()
  })

  it('shows the current stage, file position, and file name', () => {
    render(
      <MergeProgress
        progress={{
          stage: 'copying',
          currentFileIndex: 1,
          totalFiles: 3,
          currentFileName: 'report-2.pdf',
          percent: 45,
        }}
      />,
    )
    expect(screen.getByText('Copying pages')).toBeInTheDocument()
    expect(screen.getByText(/file 2 of 3/i)).toBeInTheDocument()
    expect(screen.getByText(/report-2\.pdf/)).toBeInTheDocument()
    expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '45')
  })

  it('shows the complete stage at 100 percent', () => {
    render(
      <MergeProgress
        progress={{
          stage: 'complete',
          currentFileIndex: 3,
          totalFiles: 3,
          currentFileName: null,
          percent: 100,
        }}
      />,
    )
    expect(screen.getByText('Complete')).toBeInTheDocument()
    expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '100')
  })
})
