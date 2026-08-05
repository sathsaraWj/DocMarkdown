import { createRef } from 'react'
import { describe, expect, it } from 'vitest'
import { fireEvent, screen, waitFor } from '@testing-library/react'

import { renderWithProviders } from '@/test/testUtils'
import { useFileUpload } from '@/hooks/useFileUpload'
import { EditorPanel } from '../EditorPanel'

function Harness() {
  const textareaRef = createRef<HTMLTextAreaElement>()
  const upload = useFileUpload((text) => {
    const textarea = textareaRef.current
    if (textarea) {
      const setter = Object.getOwnPropertyDescriptor(
        window.HTMLTextAreaElement.prototype,
        'value',
      )?.set
      setter?.call(textarea, text)
      textarea.dispatchEvent(new Event('input', { bubbles: true }))
    }
  })
  return <EditorPanel textareaRef={textareaRef} upload={upload} />
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
      expect(screen.getByRole('textbox', { name: /markdown source/i })).toHaveValue(
        '# Uploaded content',
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
    const textarea = screen.getByRole('textbox', {
      name: /markdown source/i,
    }) as HTMLTextAreaElement
    fireEvent.change(textarea, { target: { value: 'Some content' } })
    expect(textarea).toHaveValue('Some content')

    fireEvent.click(screen.getByRole('button', { name: /clear editor content/i }))
    expect(screen.getByText(/clear editor content\?/i)).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: 'Cancel' }))
    expect(textarea).toHaveValue('Some content')

    fireEvent.click(screen.getByRole('button', { name: /clear editor content/i }))
    fireEvent.click(screen.getByRole('button', { name: 'Clear' }))
    expect(textarea).toHaveValue('')
  })
})
