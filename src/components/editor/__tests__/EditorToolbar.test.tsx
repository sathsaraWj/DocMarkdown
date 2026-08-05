import { describe, expect, it, vi } from 'vitest'
import { fireEvent, render, screen } from '@testing-library/react'

import { EditorToolbar } from '../EditorToolbar'

describe('EditorToolbar', () => {
  it('renders a toolbar with formatting controls', () => {
    render(<EditorToolbar onAction={() => {}} />)
    expect(screen.getByRole('toolbar', { name: /markdown formatting/i })).toBeInTheDocument()
  })

  it('invokes onAction with the correct action id for bold', () => {
    const onAction = vi.fn()
    render(<EditorToolbar onAction={onAction} />)
    fireEvent.click(screen.getByRole('button', { name: 'Bold' }))
    expect(onAction).toHaveBeenCalledWith('bold')
  })

  it('invokes onAction for every documented formatting action', () => {
    const onAction = vi.fn()
    render(<EditorToolbar onAction={onAction} />)
    const labels: [string, string][] = [
      ['Heading', 'heading'],
      ['Italic', 'italic'],
      ['Strikethrough', 'strikethrough'],
      ['Link', 'link'],
      ['Image', 'image'],
      ['Blockquote', 'blockquote'],
      ['Inline code', 'inlineCode'],
      ['Code block', 'codeBlock'],
      ['Ordered list', 'orderedList'],
      ['Unordered list', 'unorderedList'],
      ['Checklist', 'checklist'],
      ['Table', 'table'],
      ['Horizontal rule', 'horizontalRule'],
    ]
    for (const [label, action] of labels) {
      fireEvent.click(screen.getByRole('button', { name: label }))
      expect(onAction).toHaveBeenCalledWith(action)
    }
  })

  it('disables all buttons when disabled prop is set', () => {
    render(<EditorToolbar onAction={() => {}} disabled />)
    for (const button of screen.getAllByRole('button')) {
      expect(button).toBeDisabled()
    }
  })
})
