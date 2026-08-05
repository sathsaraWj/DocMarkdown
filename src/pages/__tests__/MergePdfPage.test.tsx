import { readFileSync } from 'node:fs'
import path from 'node:path'
import { MemoryRouter } from 'react-router-dom'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it } from 'vitest'

import MergePdfPage from '../MergePdfPage'

const FIXTURES_DIR = path.resolve(__dirname, '../../../e2e/fixtures')

function loadFixture(name: string, rename?: string): File {
  const bytes = readFileSync(path.join(FIXTURES_DIR, name))
  return new File([bytes], rename ?? name, { type: 'application/pdf' })
}

function renderPage() {
  return render(
    <MemoryRouter>
      <MergePdfPage />
    </MemoryRouter>,
  )
}

async function uploadTwoFiles() {
  const input = screen.getByLabelText(/choose pdf files to merge/i) as HTMLInputElement
  fireEvent.change(input, {
    target: { files: [loadFixture('pdf-single-page.pdf'), loadFixture('pdf-multi-page.pdf')] },
  })
  await waitFor(() => {
    expect(screen.getByText('1 page')).toBeInTheDocument()
    expect(screen.getByText('5 pages')).toBeInTheDocument()
  })
}

describe('MergePdfPage', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('shows the upload zone with privacy messaging before any file is selected', () => {
    renderPage()
    expect(screen.getByRole('heading', { level: 1, name: /merge pdf files/i })).toBeInTheDocument()
    expect(screen.getByText(/without uploading them anywhere/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/choose pdf files to merge/i)).toBeInTheDocument()
  })

  it('uploads multiple PDFs and displays their page counts', async () => {
    renderPage()
    await uploadTwoFiles()
    expect(screen.getByText('pdf-single-page.pdf')).toBeInTheDocument()
    expect(screen.getByText('pdf-multi-page.pdf')).toBeInTheDocument()
  })

  it('rejects a non-PDF file while keeping valid files from the same batch', async () => {
    renderPage()
    const input = screen.getByLabelText(/choose pdf files to merge/i) as HTMLInputElement
    fireEvent.change(input, {
      target: { files: [loadFixture('pdf-single-page.pdf'), new File(['x'], 'notes.txt')] },
    })
    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent(/only pdf files are supported/i)
    })
    expect(screen.getByText('pdf-single-page.pdf')).toBeInTheDocument()
  })

  it('handles duplicate filenames as separate entries', async () => {
    renderPage()
    const input = screen.getByLabelText(/choose pdf files to merge/i) as HTMLInputElement
    fireEvent.change(input, {
      target: {
        files: [
          loadFixture('pdf-single-page.pdf', 'dup.pdf'),
          loadFixture('pdf-multi-page.pdf', 'dup.pdf'),
        ],
      },
    })
    await waitFor(() => {
      expect(screen.getAllByText('dup.pdf')).toHaveLength(2)
    })
  })

  it('reorders files using the move-down control', async () => {
    renderPage()
    await uploadTwoFiles()
    fireEvent.click(screen.getByRole('button', { name: /move pdf-single-page\.pdf down/i }))
    const items = screen.getAllByRole('listitem')
    expect(items[0]?.textContent).toContain('pdf-multi-page.pdf')
    expect(items[1]?.textContent).toContain('pdf-single-page.pdf')
  })

  it('blocks merging with an invalid custom page range and unblocks once corrected', async () => {
    renderPage()
    await uploadTwoFiles()

    fireEvent.click(screen.getAllByLabelText('Custom range')[1] as HTMLElement)
    const rangeInput = screen.getByLabelText(/page range for pdf-multi-page\.pdf/i)
    fireEvent.change(rangeInput, { target: { value: '1-3,20' } })

    expect(screen.getByRole('alert')).toHaveTextContent(/beyond this document's last page/i)
    expect(screen.getByRole('button', { name: /merge pdfs/i })).toBeDisabled()

    fireEvent.change(rangeInput, { target: { value: '2,1' } })
    expect(screen.queryByRole('alert')).not.toBeInTheDocument()
    expect(screen.getByRole('button', { name: /merge pdfs/i })).toBeEnabled()
  })

  it('removes a single file', async () => {
    renderPage()
    await uploadTwoFiles()
    fireEvent.click(screen.getByRole('button', { name: /remove pdf-single-page\.pdf/i }))
    await waitFor(() => {
      expect(screen.queryByText('pdf-single-page.pdf')).not.toBeInTheDocument()
    })
    expect(screen.getByText('pdf-multi-page.pdf')).toBeInTheDocument()
  })

  it('adds another file via the add-more control', async () => {
    renderPage()
    await uploadTwoFiles()
    const addMoreInput = screen.getByLabelText(/add more pdf files/i, {
      selector: 'input',
    }) as HTMLInputElement
    fireEvent.change(addMoreInput, {
      target: { files: [loadFixture('pdf-with-metadata.pdf')] },
    })
    await waitFor(() => {
      expect(screen.getByText('pdf-with-metadata.pdf')).toBeInTheDocument()
    })
  })

  it('clears all files after confirming', async () => {
    renderPage()
    await uploadTwoFiles()
    fireEvent.click(screen.getByRole('button', { name: /clear all selected pdf files/i }))
    expect(screen.getByText(/clear all files\?/i)).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: /^clear all$/i }))
    await waitFor(() => {
      expect(screen.getByLabelText(/choose pdf files to merge/i)).toBeInTheDocument()
    })
    expect(screen.queryByText('pdf-single-page.pdf')).not.toBeInTheDocument()
  })

  it('merges files and shows a success result with a non-empty download', async () => {
    const originalCreateObjectURL = URL.createObjectURL
    const originalRevokeObjectURL = URL.revokeObjectURL
    URL.createObjectURL = () => 'blob:mock'
    URL.revokeObjectURL = () => {}

    renderPage()
    await uploadTwoFiles()

    fireEvent.click(screen.getByRole('button', { name: /merge pdfs/i }))

    await waitFor(
      () => {
        expect(screen.getByText('Merge complete')).toBeInTheDocument()
      },
      { timeout: 10_000 },
    )
    expect(screen.getByText('merged-document.pdf')).toBeInTheDocument()
    expect(screen.getByText('6')).toBeInTheDocument()

    URL.createObjectURL = originalCreateObjectURL
    URL.revokeObjectURL = originalRevokeObjectURL
  })
})
