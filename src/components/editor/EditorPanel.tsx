import { useCallback, useState } from 'react'
import type { RefObject } from 'react'

import { useDocument } from '@/app/DocumentContext'
import { ConfirmDialog } from '@/components/common/ConfirmDialog'
import { CopyIcon, DownloadIcon, TrashIcon, UploadIcon } from '@/components/common/icons'
import { useDocumentStats } from '@/hooks/useDocumentStats'
import type { useFileUpload } from '@/hooks/useFileUpload'
import { useMarkdownFormatting } from '@/hooks/useMarkdownFormatting'
import { downloadText } from '@/utils/download'
import { buildFilename } from '@/utils/filename'
import { EditorStatusBar } from './EditorStatusBar'
import { EditorToolbar } from './EditorToolbar'
import { MarkdownEditor } from './MarkdownEditor'

interface EditorPanelProps {
  textareaRef: RefObject<HTMLTextAreaElement | null>
  upload: ReturnType<typeof useFileUpload>
}

export function EditorPanel({ textareaRef, upload }: EditorPanelProps) {
  const { markdown, setMarkdown, saveStatus, lastEditedAt, settings } = useDocument()
  const stats = useDocumentStats(markdown)
  const { runAction } = useMarkdownFormatting(textareaRef, setMarkdown)
  const [clearOpen, setClearOpen] = useState(false)
  const [copyState, setCopyState] = useState<'idle' | 'copied'>('idle')

  const {
    inputRef,
    isDragging,
    error,
    clearError,
    openFilePicker,
    handleInputChange,
    dragHandlers,
  } = upload

  const handleDownloadMarkdown = useCallback(() => {
    downloadText(markdown, buildFilename(settings.metadata.title, 'md'), 'text/markdown')
  }, [markdown, settings.metadata.title])

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(markdown)
      setCopyState('copied')
      setTimeout(() => setCopyState('idle'), 1800)
    } catch {
      setCopyState('idle')
    }
  }, [markdown])

  const handleConfirmClear = useCallback(() => {
    setMarkdown('')
    setClearOpen(false)
  }, [setMarkdown])

  return (
    <div className="flex h-full min-h-0 flex-col" data-testid="editor-dropzone" {...dragHandlers}>
      <div className="flex items-center justify-between gap-2 border-b border-neutral-200 px-3 py-2 dark:border-neutral-800">
        <h2 className="text-sm font-semibold text-neutral-700 dark:text-neutral-200">Markdown</h2>
        <div className="flex items-center gap-1">
          <input
            ref={inputRef}
            type="file"
            accept=".md,.markdown,.txt"
            onChange={handleInputChange}
            className="sr-only"
            aria-label="Choose a Markdown or text file to upload"
          />
          <button
            type="button"
            onClick={openFilePicker}
            title="Upload .md or .txt file"
            aria-label="Upload a Markdown or text file"
            className="flex h-8 w-8 items-center justify-center rounded-md text-neutral-500 hover:bg-neutral-100 dark:text-neutral-400 dark:hover:bg-neutral-800"
          >
            <UploadIcon className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={handleDownloadMarkdown}
            title="Download source as .md"
            aria-label="Download Markdown source file"
            className="flex h-8 w-8 items-center justify-center rounded-md text-neutral-500 hover:bg-neutral-100 dark:text-neutral-400 dark:hover:bg-neutral-800"
          >
            <DownloadIcon className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => void handleCopy()}
            title="Copy Markdown to clipboard"
            aria-label="Copy Markdown to clipboard"
            className="flex h-8 w-8 items-center justify-center rounded-md text-neutral-500 hover:bg-neutral-100 dark:text-neutral-400 dark:hover:bg-neutral-800"
          >
            <CopyIcon className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => setClearOpen(true)}
            title="Clear editor"
            aria-label="Clear editor content"
            className="flex h-8 w-8 items-center justify-center rounded-md text-neutral-500 hover:bg-red-50 hover:text-red-600 dark:text-neutral-400 dark:hover:bg-red-950/40 dark:hover:text-red-400"
          >
            <TrashIcon className="h-4 w-4" />
          </button>
          <span aria-live="polite" className="sr-only">
            {copyState === 'copied' ? 'Markdown copied to clipboard' : ''}
          </span>
        </div>
      </div>

      <EditorToolbar onAction={runAction} />

      <div className="relative min-h-0 flex-1">
        <MarkdownEditor
          value={markdown}
          onChange={setMarkdown}
          textareaRef={textareaRef}
          onAction={runAction}
          placeholder="Start writing Markdown…"
        />
        {isDragging && (
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center border-4 border-dashed border-accent-400 bg-accent-50/90 dark:bg-accent-950/80">
            <p className="text-sm font-medium text-accent-700 dark:text-accent-300">
              Drop your .md or .txt file to load it
            </p>
          </div>
        )}
      </div>

      {error && (
        <div
          role="alert"
          className="flex items-center justify-between gap-2 border-t border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/50 dark:text-red-300"
        >
          <span>{error}</span>
          <button type="button" onClick={clearError} className="font-medium underline">
            Dismiss
          </button>
        </div>
      )}

      <EditorStatusBar stats={stats} saveStatus={saveStatus} lastEditedAt={lastEditedAt} />

      <ConfirmDialog
        open={clearOpen}
        title="Clear editor content?"
        description="This removes all text from the editor. This cannot be undone once confirmed."
        confirmLabel="Clear"
        onConfirm={handleConfirmClear}
        onCancel={() => setClearOpen(false)}
      />
    </div>
  )
}
