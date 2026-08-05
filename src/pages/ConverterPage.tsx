import { useRef, useState } from 'react'

import { useDocument } from '@/app/DocumentContext'
import { EditorPanel } from '@/components/editor/EditorPanel'
import { ResizableSplit } from '@/components/editor/ResizableSplit'
import { ExportMenu } from '@/components/export/ExportMenu'
import { Hero } from '@/components/layout/Hero'
import { PreviewPanel } from '@/components/preview/PreviewPanel'
import { SettingsPanel } from '@/components/settings/SettingsPanel'
import { useFileUpload } from '@/hooks/useFileUpload'
import { useMediaQuery } from '@/hooks/useMediaQuery'
import { usePageMeta } from '@/hooks/usePageMeta'

type MobileTab = 'editor' | 'preview' | 'settings'

const MOBILE_TABS: { id: MobileTab; label: string }[] = [
  { id: 'editor', label: 'Editor' },
  { id: 'preview', label: 'Preview' },
  { id: 'settings', label: 'Settings' },
]

export function ConverterPage() {
  usePageMeta({
    title: 'Markdown to PDF Converter',
    description:
      'Convert Markdown into clean, professional PDF, HTML, and text documents directly in your browser. Private by design.',
    path: '/',
  })

  const { setMarkdown } = useDocument()
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const upload = useFileUpload(setMarkdown)
  const [mobileTab, setMobileTab] = useState<MobileTab>('editor')
  const [settingsOpen, setSettingsOpen] = useState(false)
  const isDesktop = useMediaQuery('(min-width: 768px)')

  const handleStartWriting = () => {
    textareaRef.current?.focus()
    setMobileTab('editor')
  }

  const handleUploadClick = () => {
    setMobileTab('editor')
    upload.openFilePicker()
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <Hero onStartWriting={handleStartWriting} onUploadClick={handleUploadClick} />

      <div className="flex items-center justify-between gap-2 border-b border-neutral-200 bg-white px-4 py-2 dark:border-neutral-800 dark:bg-neutral-950">
        {isDesktop ? (
          <button
            type="button"
            onClick={() => setSettingsOpen((v) => !v)}
            aria-pressed={settingsOpen}
            className={`rounded-md px-3 py-1.5 text-sm font-medium ${
              settingsOpen
                ? 'bg-accent-100 text-accent-700 dark:bg-accent-950/50 dark:text-accent-300'
                : 'text-neutral-600 hover:bg-neutral-100 dark:text-neutral-300 dark:hover:bg-neutral-800'
            }`}
          >
            {settingsOpen ? 'Hide settings' : 'Settings'}
          </button>
        ) : (
          <div className="flex gap-1" role="tablist" aria-label="Workspace view">
            {MOBILE_TABS.map((tab) => (
              <button
                key={tab.id}
                type="button"
                role="tab"
                aria-selected={mobileTab === tab.id}
                onClick={() => setMobileTab(tab.id)}
                className={`rounded-md px-3 py-1.5 text-sm font-medium ${
                  mobileTab === tab.id
                    ? 'bg-accent-100 text-accent-700 dark:bg-accent-950/50 dark:text-accent-300'
                    : 'text-neutral-600 dark:text-neutral-300'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        )}
        <ExportMenu />
      </div>

      <div className="min-h-0 flex-1">
        {isDesktop ? (
          <div className="flex h-full min-h-0">
            <div className="min-h-0 flex-1">
              <ResizableSplit
                storageKey="docmarkdown:split-ratio"
                left={<EditorPanel textareaRef={textareaRef} upload={upload} />}
                right={<PreviewPanel />}
              />
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
              <EditorPanel textareaRef={textareaRef} upload={upload} />
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
