import { useCallback } from 'react'
import type { RefObject } from 'react'

import type { MarkdownEditorHandle } from '@/components/editor/MarkdownEditor'
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

export type ToolbarActionId =
  | 'heading1'
  | 'heading2'
  | 'heading3'
  | 'bold'
  | 'italic'
  | 'underline'
  | 'strikethrough'
  | 'link'
  | 'image'
  | 'blockquote'
  | 'inlineCode'
  | 'codeBlock'
  | 'orderedList'
  | 'unorderedList'
  | 'checklist'
  | 'table'
  | 'horizontalRule'
  | 'mermaid'
  | 'math'
  | 'footnote'
  | 'pageBreak'

/**
 * Toolbar/keyboard-shortcut formatting actions for the CodeMirror-based
 * editor. Each action either transforms the current selection or, when
 * nothing is selected, inserts a placeholder with the cursor positioned
 * usefully. The actual transforms live in services/editor/markdownCommands.ts
 * so the same logic also backs the editor's own keyboard shortcuts.
 */
export function useMarkdownFormatting(editorRef: RefObject<MarkdownEditorHandle | null>) {
  const runAction = useCallback(
    (action: ToolbarActionId) => {
      const view = editorRef.current?.getView()
      if (!view) return

      switch (action) {
        case 'heading1':
          toggleHeading(view, 1)
          break
        case 'heading2':
          toggleHeading(view, 2)
          break
        case 'heading3':
          toggleHeading(view, 3)
          break
        case 'bold':
          wrapSelection(view, '**', '**', 'bold text')
          break
        case 'italic':
          wrapSelection(view, '*', '*', 'italic text')
          break
        case 'underline':
          wrapSelection(view, '<u>', '</u>', 'underlined text')
          break
        case 'strikethrough':
          wrapSelection(view, '~~', '~~', 'strikethrough text')
          break
        case 'inlineCode':
          wrapSelection(view, '`', '`', 'code')
          break
        case 'codeBlock':
          insertCodeBlock(view)
          break
        case 'link':
          insertLink(view)
          break
        case 'image':
          insertImage(view)
          break
        case 'blockquote':
          applyLinePrefix(view, () => '> ')
          break
        case 'orderedList':
          applyLinePrefix(view, (index) => `${index + 1}. `)
          break
        case 'unorderedList':
          applyLinePrefix(view, () => '- ')
          break
        case 'checklist':
          applyLinePrefix(view, () => '- [ ] ')
          break
        case 'table':
          insertTable(view)
          break
        case 'horizontalRule':
          insertBlock(view, '---\n')
          break
        case 'mermaid':
          insertMermaid(view)
          break
        case 'math':
          insertMath(view)
          break
        case 'footnote':
          insertFootnote(view)
          break
        case 'pageBreak':
          insertPageBreak(view)
          break
      }
    },
    [editorRef],
  )

  return { runAction }
}
