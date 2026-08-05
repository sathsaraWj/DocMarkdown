import { EditorState } from '@codemirror/state'
import { EditorView } from '@codemirror/view'
import { describe, expect, it } from 'vitest'

import {
  applyLinePrefix,
  insertBlock,
  insertCodeBlock,
  insertFootnote,
  insertImage,
  insertLink,
  insertMath,
  insertMermaid,
  insertPageBreak,
  insertTable,
  toggleHeading,
  wrapSelection,
} from '@/services/editor/markdownCommands'

function makeView(doc: string, selection?: { anchor: number; head?: number }): EditorView {
  const state = EditorState.create({
    doc,
    selection: selection
      ? { anchor: selection.anchor, head: selection.head ?? selection.anchor }
      : undefined,
  })
  // No `parent` — these commands only touch state/dispatch, not layout, so a
  // detached view (no DOM measurement) is enough and keeps these tests fast.
  return new EditorView({ state })
}

function text(view: EditorView): string {
  return view.state.doc.toString()
}

describe('wrapSelection', () => {
  it('wraps the current selection', () => {
    const view = makeView('hello world', { anchor: 0, head: 5 })
    wrapSelection(view, '**', '**', 'placeholder')
    expect(text(view)).toBe('**hello** world')
  })

  it('inserts a placeholder and selects it when nothing is selected', () => {
    const view = makeView('', { anchor: 0 })
    wrapSelection(view, '**', '**', 'bold text')
    expect(text(view)).toBe('**bold text**')
    const { from, to } = view.state.selection.main
    expect(view.state.doc.sliceString(from, to)).toBe('bold text')
  })
})

describe('applyLinePrefix', () => {
  it('prefixes every line touched by the selection', () => {
    const view = makeView('one\ntwo\nthree', { anchor: 0, head: 6 })
    applyLinePrefix(view, () => '> ')
    expect(text(view)).toBe('> one\n> two\nthree')
  })

  it('numbers lines sequentially for ordered lists', () => {
    const view = makeView('a\nb\nc', { anchor: 0, head: 5 })
    applyLinePrefix(view, (index) => `${index + 1}. `)
    expect(text(view)).toBe('1. a\n2. b\n3. c')
  })
})

describe('toggleHeading', () => {
  it('adds a heading marker to a plain line', () => {
    const view = makeView('Title', { anchor: 0 })
    toggleHeading(view, 2)
    expect(text(view)).toBe('## Title')
  })

  it('removes the marker when the same level is toggled again', () => {
    const view = makeView('## Title', { anchor: 0 })
    toggleHeading(view, 2)
    expect(text(view)).toBe('Title')
  })

  it('replaces an existing heading level with a different one', () => {
    const view = makeView('## Title', { anchor: 0 })
    toggleHeading(view, 1)
    expect(text(view)).toBe('# Title')
  })
})

describe('insertLink and insertImage', () => {
  it('wraps the selection as link text and selects the placeholder URL', () => {
    const view = makeView('click here', { anchor: 0, head: 10 })
    insertLink(view)
    expect(text(view)).toBe('[click here](https://example.com)')
  })

  it('inserts placeholder link text when nothing is selected', () => {
    const view = makeView('', { anchor: 0 })
    insertLink(view)
    expect(text(view)).toBe('[link text](https://example.com)')
  })

  it('inserts placeholder image markdown when nothing is selected', () => {
    const view = makeView('', { anchor: 0 })
    insertImage(view)
    expect(text(view)).toBe('![image description](https://example.com/image.png)')
  })
})

describe('insertCodeBlock', () => {
  it('wraps the selection in a fenced code block', () => {
    const view = makeView('const x = 1', { anchor: 0, head: 11 })
    insertCodeBlock(view)
    expect(text(view)).toBe('```\nconst x = 1\n```\n')
  })
})

describe('insertBlock leading-newline handling', () => {
  it('adds a blank line before the block when not already at a line start', () => {
    const view = makeView('some text', { anchor: 9 })
    insertBlock(view, '---\n')
    expect(text(view)).toBe('some text\n\n---\n')
  })

  it('does not add extra blank lines when already at the start of a line', () => {
    const view = makeView('', { anchor: 0 })
    insertBlock(view, '---\n')
    expect(text(view)).toBe('---\n')
  })
})

describe('insertTable', () => {
  it('inserts a 3x3 markdown table', () => {
    const view = makeView('', { anchor: 0 })
    insertTable(view)
    expect(text(view)).toContain('| Column 1 | Column 2 | Column 3 |')
    expect(text(view)).toContain('| -------- | -------- | -------- |')
  })
})

describe('insertMermaid and insertMath', () => {
  it('inserts a starter mermaid fenced block', () => {
    const view = makeView('', { anchor: 0 })
    insertMermaid(view)
    expect(text(view)).toContain('```mermaid')
    expect(text(view)).toContain('flowchart LR')
  })

  it('inserts a starter math block', () => {
    const view = makeView('', { anchor: 0 })
    insertMath(view)
    expect(text(view)).toBe('$$\nE = mc^2\n$$\n')
  })
})

describe('insertFootnote', () => {
  it('inserts a reference at the cursor and a definition at the end of the document', () => {
    const view = makeView('See this claim.', { anchor: 15 })
    insertFootnote(view)
    expect(text(view)).toBe('See this claim.[^1]\n\n[^1]: Footnote text.')
  })

  it('increments the label past the highest existing footnote number', () => {
    const view = makeView('First[^1] second.\n\n[^1]: One.', { anchor: 17 })
    insertFootnote(view)
    expect(text(view)).toContain('[^2]')
    expect(text(view)).toMatch(/\[\^2\]: Footnote text\.$/)
  })
})

describe('insertPageBreak', () => {
  it('inserts the \\pagebreak marker line', () => {
    const view = makeView('', { anchor: 0 })
    insertPageBreak(view)
    expect(text(view)).toBe('\\pagebreak\n')
  })
})
