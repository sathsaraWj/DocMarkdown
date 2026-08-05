import { createRef } from 'react'
import { describe, expect, it } from 'vitest'
import { fireEvent, screen, waitFor } from '@testing-library/react'

import { useDocument } from '@/app/DocumentContext'
import { renderWithProviders } from '@/test/testUtils'
import { useFileUpload } from '@/hooks/useFileUpload'
import { EditorPanel } from '../EditorPanel'
import type { MarkdownEditorHandle } from '../MarkdownEditor'

function Harness() {
  const editorRef = createRef<MarkdownEditorHandle>()
  const { setMarkdown } = useDocument()
  const upload = useFileUpload(setMarkdown)
  return <EditorPanel editorRef={editorRef} upload={upload} />
}

function makeFile(name: string, content: string, type = 'text/markdown'): File {
  return new File([content], name, { type })
}

describe('EditorPanel upload interface', () => {
  it('exposes a labeled file input accepting Markdown and text files', () => {
    renderWithProviders(<Harness />)
    const input = screen.getByLabelText(
      /choose a markdown or text file to upload/i,
    ) as HTMLInputElement
    expect(input.accept).toContain('.md')
    expect(input.accept).toContain('.txt')
  })

  it('loads a valid uploaded file into the editor', async () => {
    renderWithProviders(<Harness />)
    const input = screen.getByLabelText(
      /choose a markdown or text file to upload/i,
    ) as HTMLInputElement
    const file = makeFile('notes.md', '# Uploaded content')
    fireEvent.change(input, { target: { files: [file] } })

    await waitFor(() => {
      expect(screen.getByRole('textbox', { name: /markdown source/i }).textContent).toContain(
        'Uploaded content',
      )
    })
  })

  it('shows an error message for an unsupported file type', async () => {
    renderWithProviders(<Harness />)
    const input = screen.getByLabelText(
      /choose a markdown or text file to upload/i,
    ) as HTMLInputElement
    const file = makeFile('image.png', 'binary', 'image/png')
    fireEvent.change(input, { target: { files: [file] } })

    expect(await screen.findByRole('alert')).toHaveTextContent(/not a supported file type/i)
  })

  it('shows a drag overlay while a file is dragged over the editor', () => {
    renderWithProviders(<Harness />)
    const dropzone = screen.getByTestId('editor-dropzone')
    fireEvent.dragEnter(dropzone, { dataTransfer: { types: ['Files'] } })
    expect(screen.getByText(/drop your \.md or \.txt file/i)).toBeInTheDocument()
  })
})

describe('EditorPanel clear confirmation', () => {
  it('requires confirmation before clearing the editor content', async () => {
    renderWithProviders(<Harness />)
    const editor = screen.getByRole('textbox', { name: /markdown source/i })

    fireEvent.click(screen.getByRole('button', { name: /clear editor content/i }))
    expect(screen.getByText(/clear editor content\?/i)).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: 'Cancel' }))
    expect(editor.textContent).toContain('DocMarkdown')

    fireEvent.click(screen.getByRole('button', { name: /clear editor content/i }))
    fireEvent.click(screen.getByRole('button', { name: 'Clear' }))
    await waitFor(() => {
      expect(screen.getByRole('textbox', { name: /markdown source/i }).textContent).toBe('')
    })
  })
})

describe('EditorPanel editor controls', () => {
  it('toggles soft-wrap and spellcheck without crashing', () => {
    renderWithProviders(<Harness />)
    const wrapButton = screen.getByRole('button', { name: /toggle soft line wrapping/i })
    const spellButton = screen.getByRole('button', { name: /toggle spellcheck/i })
    expect(wrapButton).toHaveAttribute('aria-pressed', 'false')
    fireEvent.click(wrapButton)
    expect(wrapButton).toHaveAttribute('aria-pressed', 'true')

    expect(spellButton).toHaveAttribute('aria-pressed', 'true')
    fireEvent.click(spellButton)
    expect(spellButton).toHaveAttribute('aria-pressed', 'false')
  })

  it('shows a fullscreen toggle only when a handler is provided', () => {
    renderWithProviders(<Harness />)
    expect(
      screen.queryByRole('button', { name: /full-screen writing mode/i }),
    ).not.toBeInTheDocument()
  })

  it('beautifies the document content on click', async () => {
    renderWithProviders(<Harness />)
    const input = screen.getByLabelText(
      /choose a markdown or text file to upload/i,
    ) as HTMLInputElement
    const file = makeFile('messy.md', '* first item\n* second item   \n')
    fireEvent.change(input, { target: { files: [file] } })

    await waitFor(() => {
      expect(screen.getByRole('textbox', { name: /markdown source/i }).textContent).toContain(
        'first item',
      )
    })

    fireEvent.click(screen.getByRole('button', { name: /beautify markdown/i }))

    await waitFor(() => {
      const text = screen.getByRole('textbox', { name: /markdown source/i }).textContent ?? ''
      expect(text).toContain('- first item')
      expect(text).toContain('- second item')
      expect(text).not.toContain('* first item')
    })
  })
})
