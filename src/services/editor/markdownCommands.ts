import type { EditorView } from '@codemirror/view'

/**
 * Framework-agnostic Markdown formatting transforms for a CodeMirror
 * EditorView. Kept separate from React (useMarkdownFormatting.ts) so the
 * exact same logic drives both the formatting toolbar's onClick handlers and
 * the editor's own keyboard-shortcut keymap, without duplicating either.
 */

function currentLineBounds(doc: EditorView['state']['doc'], from: number, to: number) {
  const startLine = doc.lineAt(from)
  const endLine = doc.lineAt(to)
  return { from: startLine.from, to: endLine.to }
}

export function wrapSelection(
  view: EditorView,
  before: string,
  after: string,
  placeholder: string,
): boolean {
  const { from, to } = view.state.selection.main
  const hasSelection = from !== to
  const text = hasSelection ? view.state.doc.sliceString(from, to) : placeholder
  view.dispatch({
    changes: { from, to, insert: `${before}${text}${after}` },
    selection: { anchor: from + before.length, head: from + before.length + text.length },
  })
  view.focus()
  return true
}

export function applyLinePrefix(
  view: EditorView,
  prefixFor: (lineIndex: number) => string,
): boolean {
  const { from, to } = view.state.selection.main
  const { from: start, to: end } = currentLineBounds(view.state.doc, from, to)
  const segment = view.state.doc.sliceString(start, end)
  const lines = segment.length > 0 ? segment.split('\n') : ['']
  const prefixed = lines.map((line, index) => `${prefixFor(index)}${line}`).join('\n')
  view.dispatch({
    changes: { from: start, to: end, insert: prefixed },
    selection: { anchor: start, head: start + prefixed.length },
  })
  view.focus()
  return true
}

export function insertBlock(view: EditorView, text: string, cursorOffset?: number): boolean {
  const { from, to } = view.state.selection.main
  const value = view.state.doc.toString()
  const needsLeadingBreak = from > 0 && value[from - 1] !== '\n'
  const prefix = needsLeadingBreak ? '\n\n' : ''
  const insert = `${prefix}${text}`
  view.dispatch({
    changes: { from, to, insert },
    selection: { anchor: from + prefix.length + (cursorOffset ?? insert.length - prefix.length) },
  })
  view.focus()
  return true
}

export function toggleHeading(view: EditorView, level: 1 | 2 | 3): boolean {
  const { head } = view.state.selection.main
  const line = view.state.doc.lineAt(head)
  const match = /^(#{1,6})\s?/.exec(line.text)
  const currentLevel = match ? (match[1]?.length ?? 0) : 0
  const stripped = match ? line.text.slice(match[0].length) : line.text
  const nextLevel = currentLevel === level ? 0 : level
  const newText = nextLevel === 0 ? stripped : `${'#'.repeat(nextLevel)} ${stripped}`
  view.dispatch({
    changes: { from: line.from, to: line.to, insert: newText },
    selection: { anchor: line.from + newText.length },
  })
  view.focus()
  return true
}

export function insertLink(view: EditorView): boolean {
  const { from, to } = view.state.selection.main
  const hasSelection = from !== to
  const label = hasSelection ? view.state.doc.sliceString(from, to) : 'link text'
  const url = 'https://example.com'
  const text = `[${label}](${url})`
  const urlStart = from + label.length + 3
  view.dispatch({
    changes: { from, to, insert: text },
    selection: { anchor: urlStart, head: urlStart + url.length },
  })
  view.focus()
  return true
}

export function insertImage(view: EditorView): boolean {
  const { from, to } = view.state.selection.main
  const hasSelection = from !== to
  const alt = hasSelection ? view.state.doc.sliceString(from, to) : 'image description'
  const url = 'https://example.com/image.png'
  const text = `![${alt}](${url})`
  const urlStart = from + alt.length + 4
  view.dispatch({
    changes: { from, to, insert: text },
    selection: { anchor: urlStart, head: urlStart + url.length },
  })
  view.focus()
  return true
}

export function insertCodeBlock(view: EditorView): boolean {
  const { from, to } = view.state.selection.main
  const hasSelection = from !== to
  const code = hasSelection ? view.state.doc.sliceString(from, to) : 'code here'
  const value = view.state.doc.toString()
  const needsLeadingBreak = from > 0 && value[from - 1] !== '\n'
  const prefix = needsLeadingBreak ? '\n\n' : ''
  const text = `${prefix}\`\`\`\n${code}\n\`\`\`\n`
  const codeStart = from + prefix.length + 4
  view.dispatch({
    changes: { from, to, insert: text },
    selection: { anchor: codeStart, head: codeStart + code.length },
  })
  view.focus()
  return true
}

export function insertTable(view: EditorView): boolean {
  const table = [
    '| Column 1 | Column 2 | Column 3 |',
    '| -------- | -------- | -------- |',
    '| Cell     | Cell     | Cell     |',
  ].join('\n')
  return insertBlock(view, `${table}\n`, table.length)
}

export function insertMermaid(view: EditorView): boolean {
  const block = ['```mermaid', 'flowchart LR', '    A[Start] --> B[End]', '```', ''].join('\n')
  return insertBlock(view, block)
}

export function insertMath(view: EditorView): boolean {
  const block = ['$$', 'E = mc^2', '$$', ''].join('\n')
  return insertBlock(view, block)
}

export function insertFootnote(view: EditorView): boolean {
  const value = view.state.doc.toString()
  const usedLabels = Array.from(value.matchAll(/\[\^(\d+)\]/g))
    .map((m) => Number(m[1]))
    .filter((n) => Number.isFinite(n))
  const nextLabel = usedLabels.length > 0 ? Math.max(...usedLabels) + 1 : 1
  const { from, to } = view.state.selection.main
  const refText = `[^${nextLabel}]`
  const docEnd = view.state.doc.length
  const needsLeadingBreak = docEnd > 0 && value[docEnd - 1] !== '\n'
  const defText = `${needsLeadingBreak ? '\n\n' : '\n'}[^${nextLabel}]: Footnote text.`
  view.dispatch({
    changes: [
      { from, to, insert: refText },
      { from: docEnd, to: docEnd, insert: defText },
    ],
    selection: { anchor: from + refText.length },
  })
  view.focus()
  return true
}

export function insertPageBreak(view: EditorView): boolean {
  return insertBlock(view, '\\pagebreak\n')
}
