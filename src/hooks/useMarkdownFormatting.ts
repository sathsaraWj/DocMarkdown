import { useCallback } from 'react'
import type { RefObject } from 'react'

import { replaceRange } from '@/utils/textareaEditing'

export type ToolbarActionId =
  | 'heading'
  | 'bold'
  | 'italic'
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

function currentLineBounds(value: string, selectionStart: number, selectionEnd: number) {
  const lineStart = value.lastIndexOf('\n', selectionStart - 1) + 1
  const nextBreak = value.indexOf('\n', selectionEnd)
  const lineEnd = nextBreak === -1 ? value.length : nextBreak
  return { lineStart, lineEnd }
}

export function useMarkdownFormatting(
  textareaRef: RefObject<HTMLTextAreaElement | null>,
  onChange: (value: string) => void,
) {
  const withTextarea = useCallback(
    (fn: (textarea: HTMLTextAreaElement) => void) => {
      const textarea = textareaRef.current
      if (!textarea) return
      fn(textarea)
      onChange(textarea.value)
    },
    [onChange, textareaRef],
  )

  const wrapSelection = useCallback(
    (before: string, after: string, placeholder: string) => {
      withTextarea((textarea) => {
        const { selectionStart, selectionEnd, value } = textarea
        const hasSelection = selectionStart !== selectionEnd
        const selected = hasSelection ? value.slice(selectionStart, selectionEnd) : placeholder
        replaceRange(textarea, selectionStart, selectionEnd, `${before}${selected}${after}`)
        const selectStart = selectionStart + before.length
        textarea.setSelectionRange(selectStart, selectStart + selected.length)
      })
    },
    [withTextarea],
  )

  const applyLinePrefix = useCallback(
    (prefixFor: (lineIndex: number) => string) => {
      withTextarea((textarea) => {
        const { selectionStart, selectionEnd, value } = textarea
        const { lineStart, lineEnd } = currentLineBounds(value, selectionStart, selectionEnd)
        const segment = value.slice(lineStart, lineEnd)
        const lines = segment.length > 0 ? segment.split('\n') : ['']
        const prefixed = lines.map((line, index) => `${prefixFor(index)}${line}`).join('\n')
        replaceRange(textarea, lineStart, lineEnd, prefixed)
        textarea.setSelectionRange(lineStart, lineStart + prefixed.length)
      })
    },
    [withTextarea],
  )

  const insertBlock = useCallback(
    (text: string) => {
      withTextarea((textarea) => {
        const { selectionStart, value } = textarea
        const needsLeadingBreak = selectionStart > 0 && value[selectionStart - 1] !== '\n'
        const prefix = needsLeadingBreak ? '\n\n' : ''
        replaceRange(textarea, textarea.selectionStart, textarea.selectionEnd, `${prefix}${text}`)
      })
    },
    [withTextarea],
  )

  const toggleHeading = useCallback(() => {
    withTextarea((textarea) => {
      const { selectionStart, selectionEnd, value } = textarea
      const { lineStart, lineEnd } = currentLineBounds(value, selectionStart, selectionEnd)
      const line = value.slice(lineStart, lineEnd)
      const match = /^(#{1,6})\s?/.exec(line)
      const level = match ? (match[1]?.length ?? 0) : 0
      const stripped = match ? line.slice(match[0].length) : line
      const nextLevel = level >= 6 ? 0 : level + 1
      const newLine = nextLevel === 0 ? stripped : `${'#'.repeat(nextLevel)} ${stripped}`
      replaceRange(textarea, lineStart, lineEnd, newLine)
      textarea.setSelectionRange(lineStart, lineStart + newLine.length)
    })
  }, [withTextarea])

  const insertLink = useCallback(() => {
    withTextarea((textarea) => {
      const { selectionStart, selectionEnd, value } = textarea
      const hasSelection = selectionStart !== selectionEnd
      const label = hasSelection ? value.slice(selectionStart, selectionEnd) : 'link text'
      const text = `[${label}](https://example.com)`
      replaceRange(textarea, selectionStart, selectionEnd, text)
      const urlStart = selectionStart + label.length + 3
      textarea.setSelectionRange(urlStart, urlStart + 'https://example.com'.length)
    })
  }, [withTextarea])

  const insertImage = useCallback(() => {
    withTextarea((textarea) => {
      const { selectionStart, selectionEnd, value } = textarea
      const hasSelection = selectionStart !== selectionEnd
      const alt = hasSelection ? value.slice(selectionStart, selectionEnd) : 'image description'
      const text = `![${alt}](https://example.com/image.png)`
      replaceRange(textarea, selectionStart, selectionEnd, text)
      const urlStart = selectionStart + alt.length + 4
      textarea.setSelectionRange(urlStart, urlStart + 'https://example.com/image.png'.length)
    })
  }, [withTextarea])

  const insertTable = useCallback(() => {
    const table = [
      '| Column 1 | Column 2 | Column 3 |',
      '| -------- | -------- | -------- |',
      '| Cell     | Cell     | Cell     |',
    ].join('\n')
    insertBlock(`${table}\n`)
  }, [insertBlock])

  const insertHorizontalRule = useCallback(() => {
    insertBlock('---\n')
  }, [insertBlock])

  const insertCodeBlock = useCallback(() => {
    withTextarea((textarea) => {
      const { selectionStart, selectionEnd, value } = textarea
      const hasSelection = selectionStart !== selectionEnd
      const code = hasSelection ? value.slice(selectionStart, selectionEnd) : 'code here'
      const needsLeadingBreak = selectionStart > 0 && value[selectionStart - 1] !== '\n'
      const prefix = needsLeadingBreak ? '\n\n' : ''
      const text = `${prefix}\`\`\`\n${code}\n\`\`\`\n`
      replaceRange(textarea, selectionStart, selectionEnd, text)
      const codeStart = selectionStart + prefix.length + 4
      textarea.setSelectionRange(codeStart, codeStart + code.length)
    })
  }, [withTextarea])

  const runAction = useCallback(
    (action: ToolbarActionId) => {
      switch (action) {
        case 'heading':
          toggleHeading()
          break
        case 'bold':
          wrapSelection('**', '**', 'bold text')
          break
        case 'italic':
          wrapSelection('*', '*', 'italic text')
          break
        case 'strikethrough':
          wrapSelection('~~', '~~', 'strikethrough text')
          break
        case 'inlineCode':
          wrapSelection('`', '`', 'code')
          break
        case 'codeBlock':
          insertCodeBlock()
          break
        case 'link':
          insertLink()
          break
        case 'image':
          insertImage()
          break
        case 'blockquote':
          applyLinePrefix(() => '> ')
          break
        case 'orderedList':
          applyLinePrefix((index) => `${index + 1}. `)
          break
        case 'unorderedList':
          applyLinePrefix(() => '- ')
          break
        case 'checklist':
          applyLinePrefix(() => '- [ ] ')
          break
        case 'table':
          insertTable()
          break
        case 'horizontalRule':
          insertHorizontalRule()
          break
      }
    },
    [
      applyLinePrefix,
      insertCodeBlock,
      insertHorizontalRule,
      insertImage,
      insertLink,
      insertTable,
      toggleHeading,
      wrapSelection,
    ],
  )

  return { runAction }
}
