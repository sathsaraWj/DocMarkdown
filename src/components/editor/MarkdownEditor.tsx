import { useCallback, useRef } from 'react'
import type { KeyboardEvent, RefObject } from 'react'

import { replaceRange } from '@/utils/textareaEditing'
import type { ToolbarActionId } from '@/hooks/useMarkdownFormatting'

interface MarkdownEditorProps {
  value: string
  onChange: (value: string) => void
  textareaRef: RefObject<HTMLTextAreaElement | null>
  onAction: (action: ToolbarActionId) => void
  placeholder?: string
}

const SHORTCUTS: Record<string, ToolbarActionId> = {
  b: 'bold',
  i: 'italic',
  k: 'link',
}

export function MarkdownEditor({
  value,
  onChange,
  textareaRef,
  onAction,
  placeholder,
}: MarkdownEditorProps) {
  const gutterRef = useRef<HTMLDivElement>(null)
  const lineCount = value.length === 0 ? 1 : value.split('\n').length

  const handleScroll = useCallback(() => {
    if (gutterRef.current && textareaRef.current) {
      gutterRef.current.scrollTop = textareaRef.current.scrollTop
    }
  }, [textareaRef])

  const handleKeyDown = useCallback(
    (event: KeyboardEvent<HTMLTextAreaElement>) => {
      const modifier = event.ctrlKey || event.metaKey
      if (modifier) {
        const action = SHORTCUTS[event.key.toLowerCase()]
        if (action) {
          event.preventDefault()
          onAction(action)
          return
        }
      }

      if (event.key === 'Tab') {
        event.preventDefault()
        const textarea = event.currentTarget
        const { selectionStart, selectionEnd } = textarea
        if (event.shiftKey) {
          const lineStart = textarea.value.lastIndexOf('\n', selectionStart - 1) + 1
          if (textarea.value.slice(lineStart, lineStart + 2) === '  ') {
            replaceRange(textarea, lineStart, lineStart + 2, '')
          }
        } else {
          replaceRange(textarea, selectionStart, selectionEnd, '  ')
        }
        onChange(textarea.value)
      }
    },
    [onAction, onChange],
  )

  return (
    <div className="flex h-full min-h-0 flex-1 overflow-hidden bg-white dark:bg-neutral-950">
      <div
        ref={gutterRef}
        aria-hidden="true"
        className="select-none overflow-hidden border-r border-neutral-200 bg-neutral-50 px-3 py-4 text-right font-mono text-[13px] leading-6 text-neutral-400 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-600"
      >
        {Array.from({ length: lineCount }, (_, index) => (
          <div key={index}>{index + 1}</div>
        ))}
      </div>
      <label htmlFor="markdown-source" className="sr-only">
        Markdown source
      </label>
      <textarea
        id="markdown-source"
        ref={textareaRef}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        onScroll={handleScroll}
        onKeyDown={handleKeyDown}
        spellCheck
        wrap="off"
        placeholder={placeholder}
        className="h-full min-h-0 flex-1 resize-none overflow-auto whitespace-pre bg-transparent px-4 py-4 font-mono text-[13px] leading-6 text-neutral-900 outline-none dark:text-neutral-100"
      />
    </div>
  )
}
