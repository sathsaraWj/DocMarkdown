import type { ToolbarActionId } from '@/hooks/useMarkdownFormatting'

interface ToolbarButtonSpec {
  action: ToolbarActionId
  label: string
  glyph: string
  glyphClassName?: string
  shortcut?: string
}

const GROUPS: ToolbarButtonSpec[][] = [
  [
    { action: 'bold', label: 'Bold', glyph: 'B', glyphClassName: 'font-bold', shortcut: 'Ctrl+B' },
    { action: 'italic', label: 'Italic', glyph: 'I', glyphClassName: 'italic', shortcut: 'Ctrl+I' },
    { action: 'underline', label: 'Underline', glyph: 'U', glyphClassName: 'underline' },
    { action: 'strikethrough', label: 'Strikethrough', glyph: 'S', glyphClassName: 'line-through' },
  ],
  [
    {
      action: 'heading1',
      label: 'Heading 1',
      glyph: 'H1',
      glyphClassName: 'font-bold text-[11px]',
    },
    {
      action: 'heading2',
      label: 'Heading 2',
      glyph: 'H2',
      glyphClassName: 'font-bold text-[11px]',
    },
    {
      action: 'heading3',
      label: 'Heading 3',
      glyph: 'H3',
      glyphClassName: 'font-bold text-[11px]',
    },
  ],
  [
    { action: 'blockquote', label: 'Blockquote', glyph: '❝' },
    { action: 'inlineCode', label: 'Inline code', glyph: '</>' },
    { action: 'codeBlock', label: 'Code block', glyph: '{ }' },
  ],
  [
    { action: 'link', label: 'Link', glyph: '🔗', shortcut: 'Ctrl+K' },
    { action: 'image', label: 'Image', glyph: '🖼' },
  ],
  [
    { action: 'orderedList', label: 'Ordered list', glyph: '1.', shortcut: 'Ctrl+Shift+7' },
    { action: 'unorderedList', label: 'Unordered list', glyph: '•', shortcut: 'Ctrl+Shift+8' },
    { action: 'checklist', label: 'Checklist', glyph: '☑' },
  ],
  [
    { action: 'table', label: 'Table', glyph: '⊞' },
    { action: 'horizontalRule', label: 'Horizontal rule', glyph: '—' },
    { action: 'pageBreak', label: 'Page break', glyph: '⤓' },
  ],
  [
    { action: 'mermaid', label: 'Mermaid diagram', glyph: '◇' },
    { action: 'math', label: 'Math block', glyph: '∑' },
    { action: 'footnote', label: 'Footnote', glyph: 'n¹' },
  ],
]

interface EditorToolbarProps {
  onAction: (action: ToolbarActionId) => void
  disabled?: boolean
}

export function EditorToolbar({ onAction, disabled }: EditorToolbarProps) {
  return (
    <div
      role="toolbar"
      aria-label="Markdown formatting"
      className="flex shrink-0 flex-nowrap items-center gap-1 overflow-x-auto border-b border-neutral-200 bg-neutral-50 px-2 py-1.5 dark:border-neutral-800 dark:bg-neutral-900"
    >
      {GROUPS.map((group, groupIndex) => (
        <div
          key={groupIndex}
          className="flex shrink-0 items-center gap-0.5 border-r border-neutral-200 pr-1 last:border-r-0 dark:border-neutral-700"
        >
          {group.map(({ action, label, glyph, glyphClassName, shortcut }) => (
            <button
              key={action}
              type="button"
              disabled={disabled}
              onClick={() => onAction(action)}
              title={shortcut ? `${label} (${shortcut})` : label}
              aria-label={label}
              className="flex h-8 min-w-8 shrink-0 items-center justify-center rounded-md px-1.5 text-sm text-neutral-600 hover:bg-neutral-200 disabled:pointer-events-none disabled:opacity-40 dark:text-neutral-300 dark:hover:bg-neutral-700"
            >
              <span className={glyphClassName} aria-hidden="true">
                {glyph}
              </span>
            </button>
          ))}
        </div>
      ))}
    </div>
  )
}
