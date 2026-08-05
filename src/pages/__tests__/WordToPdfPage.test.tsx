import { readFileSync } from 'node:fs'
import path from 'node:path'
import { MemoryRouter } from 'react-router-dom'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import WordToPdfPage from '../WordToPdfPage'

const FIXTURES_DIR = path.resolve(__dirname, '../../../e2e/fixtures')

function loadFixture(name: string): File {
  const bytes = readFileSync(path.join(FIXTURES_DIR, name))
  return new File([bytes], name)
}

function renderPage() {
  return render(
    <MemoryRouter>
      <WordToPdfPage />
    </MemoryRouter>,
  )
}

async function uploadSample() {
  const input = screen.getByLabelText(/choose a \.docx word document/i) as HTMLInputElement
  fireEvent.change(input, { target: { files: [loadFixture('sample.docx')] } })
  await waitFor(
    () => {
      expect(screen.getByRole('heading', { level: 1, name: /sample report/i })).toBeInTheDocument()
    },
    // Parsing now also reads the docx's raw XML for layout hints (page
    // size/margins/font) alongside mammoth, which is a little slower under
    // load than mammoth conversion alone — give this more headroom than
    // waitFor's ~1s default.
    { timeout: 5000 },
  )
}

describe('WordToPdfPage', () => {
  it('replaces the current document with a newly chosen file', async () => {
    renderPage()
    await uploadSample()

    expect(screen.getByText('sample.docx')).toBeInTheDocument()

    const replaceInput = screen.getByLabelText(/replace with a different \.docx file/i) as HTMLInputElement
    const nextFile = loadFixture('sample.docx')
    Object.defineProperty(nextFile, 'name', { value: 'replacement.docx' })
    fireEvent.change(replaceInput, { target: { files: [nextFile] } })

    await waitFor(
      () => {
        expect(screen.getByText('replacement.docx')).toBeInTheDocument()
      },
      { timeout: 5000 },
    )
  })

  it('clears the document after confirming the clear dialog', async () => {
    renderPage()
    await uploadSample()

    fireEvent.click(screen.getByRole('button', { name: /clear the current word document/i }))
    expect(screen.getByText(/clear this document\?/i)).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: /^clear$/i }))

    await waitFor(() => {
      expect(screen.queryByText('sample.docx')).not.toBeInTheDocument()
    })
    expect(screen.getByLabelText(/choose a \.docx word document/i)).toBeInTheDocument()
  })

  it('rejects a legacy .doc file with a clear, non-blocking error and keeps the upload zone available', async () => {
    renderPage()
    const input = screen.getByLabelText(/choose a \.docx word document/i) as HTMLInputElement
    fireEvent.change(input, { target: { files: [loadFixture('legacy.doc')] } })

    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent(/save the document as \.docx/i)
    })
    expect(screen.getByLabelText(/choose a \.docx word document/i)).toBeInTheDocument()
  })
})
