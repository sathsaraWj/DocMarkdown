import { useEffect, useRef, useState } from 'react'

import { useDocument } from '@/app/DocumentContext'
import {
  ColumnsIcon,
  CopyIcon,
  EditIcon,
  EyeIcon,
  MoreIcon,
  RedoIcon,
  SparklesIcon,
  UndoIcon,
} from '@/components/common/icons'
import { ExportMenu } from '@/components/export/ExportMenu'
import { Logo } from '@/components/layout/Logo'
import { ThemeSwitcher } from '@/components/layout/ThemeSwitcher'
import { beautifyMarkdown } from '@/services/markdown/beautify'
import { SaveStatusIndicator } from './SaveStatusIndicator'

export type WorkspaceMode = 'editor' | 'split' | 'preview'
export type MobileTab = 'editor' | 'preview' | 'settings'

const MOBILE_TABS: { id: MobileTab; label: string }[] = [
  { id: 'editor', label: 'Write' },
  { id: 'preview', label: 'Preview' },
  { id: 'settings', label: 'Style' },
]

const DESKTOP_MODES: { id: WorkspaceMode; label: string; icon: typeof EditIcon }[] = [
  { id: 'editor', label: 'Editor only', icon: EditIcon },
  { id: 'split', label: 'Split', icon: ColumnsIcon },
  { id: 'preview', label: 'Preview only', icon: EyeIcon },
]

interface EditorTopBarProps {
  isDesktop: boolean
  mode: WorkspaceMode
  onModeChange: (mode: WorkspaceMode) => void
  mobileTab: MobileTab
  onMobileTabChange: (tab: MobileTab) => void
  settingsOpen: boolean
  onToggleSettings: () => void
  onUndo: () => void
  onRedo: () => void
  exportOpenSignal: number
}

function IconButton({
  label,
  onClick,
  children,
}: {
  label: string
  onClick: () => void
  children: React.ReactNode
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={label}
      aria-label={label}
      className="flex h-8 w-8 items-center justify-center rounded-md text-neutral-500 hover:bg-neutral-100 dark:text-neutral-400 dark:hover:bg-neutral-800"
    >
      {children}
    </button>
  )
}

function MoreMenu() {
  const { markdown, setMarkdown } = useDocument()
  const [open, setOpen] = useState(false)
  const [copied, setCopied] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClick(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) setOpen(false)
    }
    function handleKey(event: KeyboardEvent) {
      if (event.key === 'Escape') setOpen(false)
    }
    document.addEventListener('mousedown', handleClick)
    document.addEventListener('keydown', handleKey)
    return () => {
      document.removeEventListener('mousedown', handleClick)
      document.removeEventListener('keydown', handleKey)
    }
  }, [])

  const handleBeautify = () => {
    setMarkdown(beautifyMarkdown(markdown))
    setOpen(false)
  }

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(markdown)
      setCopied(true)
      setTimeout(() => setCopied(false), 1600)
    } catch {
      setCopied(false)
    }
  }

  return (
    <div className="relative" ref={menuRef}>
      <IconButton label="More options" onClick={() => setOpen((v) => !v)}>
        <MoreIcon className="h-4 w-4" />
      </IconButton>
      {open && (
        <div
          role="menu"
          aria-label="More options"
          className="absolute right-0 z-20 mt-1 w-56 rounded-lg border border-neutral-200 bg-white p-1 shadow-lg dark:border-neutral-700 dark:bg-neutral-900"
        >
          <button
            type="button"
            role="menuitem"
            onClick={handleBeautify}
            className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-sm text-neutral-700 hover:bg-neutral-100 dark:text-neutral-200 dark:hover:bg-neutral-800"
          >
            <SparklesIcon className="h-4 w-4 text-neutral-500 dark:text-neutral-400" />
            Beautify Markdown
          </button>
          <button
            type="button"
            role="menuitem"
            onClick={() => void handleCopy()}
            className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-sm text-neutral-700 hover:bg-neutral-100 dark:text-neutral-200 dark:hover:bg-neutral-800"
          >
            <CopyIcon className="h-4 w-4 text-neutral-500 dark:text-neutral-400" />
            {copied ? 'Copied!' : 'Copy Markdown to clipboard'}
          </button>
        </div>
      )}
    </div>
  )
}

export function EditorTopBar({
  isDesktop,
  mode,
  onModeChange,
  mobileTab,
  onMobileTabChange,
  settingsOpen,
  onToggleSettings,
  onUndo,
  onRedo,
  exportOpenSignal,
}: EditorTopBarProps) {
  const { settings, setSettings, saveStatus, lastEditedAt } = useDocument()

  return (
    <div className="flex flex-wrap items-center gap-2 border-b border-neutral-200 bg-white px-3 py-2 dark:border-neutral-800 dark:bg-neutral-950 sm:px-4">
      <div className="hidden shrink-0 items-center sm:flex">
        <Logo />
      </div>

      <input
        type="text"
        value={settings.metadata.title}
        onChange={(event) =>
          setSettings((prev) => ({
            ...prev,
            metadata: { ...prev.metadata, title: event.target.value },
          }))
        }
        placeholder="Untitled Document"
        aria-label="Document title"
        className="min-w-0 flex-1 rounded-md border border-transparent bg-transparent px-2 py-1 text-sm font-medium text-neutral-800 hover:border-neutral-200 focus:border-neutral-300 focus-visible:outline-none dark:text-neutral-100 dark:hover:border-neutral-700 dark:focus:border-neutral-600 sm:max-w-xs"
      />

      <SaveStatusIndicator
        saveStatus={saveStatus}
        lastEditedAt={lastEditedAt}
        className="hidden shrink-0 text-xs text-neutral-500 dark:text-neutral-400 md:flex"
      />

      <div className="ml-auto flex shrink-0 flex-wrap items-center gap-2">
        {isDesktop ? (
          <>
            <button
              type="button"
              onClick={onToggleSettings}
              aria-pressed={settingsOpen}
              className={`rounded-md px-3 py-1.5 text-sm font-medium ${
                settingsOpen
                  ? 'bg-accent-100 text-accent-700 dark:bg-accent-950/50 dark:text-accent-300'
                  : 'text-neutral-600 hover:bg-neutral-100 dark:text-neutral-300 dark:hover:bg-neutral-800'
              }`}
            >
              {settingsOpen ? 'Hide style' : 'Style'}
            </button>
            <div
              role="radiogroup"
              aria-label="Workspace view"
              className="inline-flex items-center gap-0.5 rounded-full border border-neutral-200 bg-neutral-100 p-0.5 dark:border-neutral-700 dark:bg-neutral-800"
            >
              {DESKTOP_MODES.map(({ id, label, icon: IconComponent }) => {
                const active = mode === id
                return (
                  <button
                    key={id}
                    type="button"
                    role="radio"
                    aria-checked={active}
                    aria-label={label}
                    title={label}
                    onClick={() => onModeChange(id)}
                    className={`flex h-7 w-7 items-center justify-center rounded-full transition-colors ${
                      active
                        ? 'bg-white text-accent-600 shadow-sm dark:bg-neutral-900 dark:text-accent-400'
                        : 'text-neutral-500 hover:text-neutral-800 dark:text-neutral-400 dark:hover:text-neutral-100'
                    }`}
                  >
                    <IconComponent className="h-4 w-4" />
                  </button>
                )
              })}
            </div>
          </>
        ) : (
          <div className="flex gap-1" role="tablist" aria-label="Workspace view">
            {MOBILE_TABS.map((tab) => (
              <button
                key={tab.id}
                type="button"
                role="tab"
                aria-selected={mobileTab === tab.id}
                onClick={() => onMobileTabChange(tab.id)}
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

        <span className="mx-0.5 hidden h-5 w-px bg-neutral-200 dark:bg-neutral-700 sm:block" />

        <IconButton label="Undo" onClick={onUndo}>
          <UndoIcon className="h-4 w-4" />
        </IconButton>
        <IconButton label="Redo" onClick={onRedo}>
          <RedoIcon className="h-4 w-4" />
        </IconButton>
        {isDesktop && (
          <IconButton label="Preview" onClick={() => onModeChange('preview')}>
            <EyeIcon className="h-4 w-4" />
          </IconButton>
        )}

        <ExportMenu openSignal={exportOpenSignal} />
        <MoreMenu />

        <div className="hidden sm:block">
          <ThemeSwitcher />
        </div>
      </div>
    </div>
  )
}
