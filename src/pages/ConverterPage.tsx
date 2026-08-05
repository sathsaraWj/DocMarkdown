import { useCallback, useEffect, useRef, useState } from 'react'

import { useDocument } from '@/app/DocumentContext'
import { EditorPanel } from '@/components/editor/EditorPanel'
import { EditorTopBar, type MobileTab, type WorkspaceMode } from '@/components/editor/EditorTopBar'
import type { MarkdownEditorHandle } from '@/components/editor/MarkdownEditor'
import { ResizableSplit } from '@/components/editor/ResizableSplit'
import { Hero } from '@/components/layout/Hero'
import { PreviewPanel } from '@/components/preview/PreviewPanel'
import { SettingsPanel } from '@/components/settings/SettingsPanel'
import { useFileUpload } from '@/hooks/useFileUpload'
import { useMediaQuery } from '@/hooks/useMediaQuery'
import { usePageMeta } from '@/hooks/usePageMeta'

const WORKSPACE_MODE_KEY = 'docmarkdown:workspace-mode'

function loadWorkspaceMode(): WorkspaceMode {
  if (typeof window === 'undefined') return 'split'
  const stored = window.sessionStorage.getItem(WORKSPACE_MODE_KEY)
  return stored === 'editor' || stored === 'split' || stored === 'preview' ? stored : 'split'
}

export function ConverterPage() {
  usePageMeta({
    title: 'Markdown Editor',
    description:
      'Write Markdown and export polished PDF, DOCX, HTML, or text documents directly in your browser. Private by design.',
    path: '/',
  })

  const { markdown, setMarkdown } = useDocument()
  const editorRef = useRef<MarkdownEditorHandle>(null)
  const upload = useFileUpload(setMarkdown)
  const [mobileTab, setMobileTab] = useState<MobileTab>('editor')
  const [mode, setMode] = useState<WorkspaceMode>(loadWorkspaceMode)
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [exportOpenSignal, setExportOpenSignal] = useState(0)
  const isDesktop = useMediaQuery('(min-width: 768px)')

  useEffect(() => {
    window.sessionStorage.setItem(WORKSPACE_MODE_KEY, mode)
  }, [mode])

  const handleStartWriting = () => {
    editorRef.current?.focus()
    setMobileTab('editor')
    setMode('editor')
  }

  const handleUploadClick = () => {
    setMobileTab('editor')
    upload.openFilePicker()
  }

  const handlePreview = useCallback(() => {
    setMode('preview')
    setMobileTab('preview')
  }, [])

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      const modifier = event.ctrlKey || event.metaKey
      if (!modifier) return
      const key = event.key.toLowerCase()
      if (key === 's') {
        // Autosave already runs continuously; just stop the browser's native save dialog.
        event.preventDefault()
      } else if (event.key === 'Enter') {
        event.preventDefault()
        handlePreview()
      } else if (event.shiftKey && key === 'p') {
        event.preventDefault()
        setExportOpenSignal((value) => value + 1)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [handlePreview])

  const showHero = markdown.trim() === '' && !isFullscreen

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      {showHero && <Hero onStartWriting={handleStartWriting} onUploadClick={handleUploadClick} />}

      {!isFullscreen && (
        <EditorTopBar
          isDesktop={isDesktop}
          mode={mode}
          onModeChange={setMode}
          mobileTab={mobileTab}
          onMobileTabChange={setMobileTab}
          settingsOpen={settingsOpen}
          onToggleSettings={() => setSettingsOpen((value) => !value)}
          onUndo={() => editorRef.current?.undo()}
          onRedo={() => editorRef.current?.redo()}
          exportOpenSignal={exportOpenSignal}
        />
      )}

      <div className="min-h-0 flex-1">
        {isFullscreen ? (
          <EditorPanel
            editorRef={editorRef}
            upload={upload}
            isFullscreen
            onToggleFullscreen={() => setIsFullscreen(false)}
          />
        ) : isDesktop ? (
          <div className="flex h-full min-h-0">
            <div className="min-h-0 flex-1">
              {mode === 'split' && (
                <ResizableSplit
                  storageKey="docmarkdown:split-ratio"
                  left={
                    <EditorPanel
                      editorRef={editorRef}
                      upload={upload}
                      onToggleFullscreen={() => setIsFullscreen(true)}
                    />
                  }
                  right={<PreviewPanel />}
                />
              )}
              {mode === 'editor' && (
                <EditorPanel
                  editorRef={editorRef}
                  upload={upload}
                  onToggleFullscreen={() => setIsFullscreen(true)}
                />
              )}
              {mode === 'preview' && <PreviewPanel />}
            </div>
            {settingsOpen && (
              <div className="w-80 shrink-0 border-l border-neutral-200 dark:border-neutral-800">
                <SettingsPanel />
              </div>
            )}
          </div>
        ) : (
          <div className="flex h-full min-h-0">
            <div
              className={mobileTab === 'editor' ? 'flex h-full min-h-0 w-full flex-col' : 'hidden'}
            >
              <EditorPanel
                editorRef={editorRef}
                upload={upload}
                onToggleFullscreen={() => setIsFullscreen(true)}
              />
            </div>
            <div
              className={mobileTab === 'preview' ? 'flex h-full min-h-0 w-full flex-col' : 'hidden'}
            >
              <PreviewPanel />
            </div>
            <div className={mobileTab === 'settings' ? 'h-full min-h-0 w-full' : 'hidden'}>
              <SettingsPanel />
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
