import { useRef, useState } from 'react'
import type { ChangeEvent } from 'react'

import { useDocument } from '@/app/DocumentContext'
import { ConfirmDialog } from '@/components/common/ConfirmDialog'
import { parseSettingsJson, settingsToJson } from '@/services/storage'
import { downloadText } from '@/utils/download'
import { SectionHeading } from './fields'

export function SettingsManagementSection() {
  const { settings, setSettings, resetSettings, deleteAllLocalData } = useDocument()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [importError, setImportError] = useState<string | null>(null)
  const [importSuccess, setImportSuccess] = useState(false)
  const [resetOpen, setResetOpen] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)

  const handleExport = () => {
    downloadText(settingsToJson(settings), 'docmarkdown-settings.json', 'application/json')
  }

  const handleImportClick = () => fileInputRef.current?.click()

  const handleFileChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    event.target.value = ''
    if (!file) return
    const text = await file.text()
    const { settings: imported, error } = parseSettingsJson(text)
    if (error || !imported) {
      setImportError(error ?? 'Could not import settings.')
      setImportSuccess(false)
      return
    }
    setSettings(imported)
    setImportError(null)
    setImportSuccess(true)
    setTimeout(() => setImportSuccess(false), 2500)
  }

  return (
    <div className="flex flex-col gap-3">
      <SectionHeading>Manage settings</SectionHeading>
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => setResetOpen(true)}
          className="rounded-md border border-neutral-300 px-3 py-1.5 text-xs font-medium text-neutral-700 hover:bg-neutral-100 dark:border-neutral-700 dark:text-neutral-200 dark:hover:bg-neutral-800"
        >
          Reset to defaults
        </button>
        <button
          type="button"
          onClick={handleExport}
          className="rounded-md border border-neutral-300 px-3 py-1.5 text-xs font-medium text-neutral-700 hover:bg-neutral-100 dark:border-neutral-700 dark:text-neutral-200 dark:hover:bg-neutral-800"
        >
          Export settings (.json)
        </button>
        <button
          type="button"
          onClick={handleImportClick}
          className="rounded-md border border-neutral-300 px-3 py-1.5 text-xs font-medium text-neutral-700 hover:bg-neutral-100 dark:border-neutral-700 dark:text-neutral-200 dark:hover:bg-neutral-800"
        >
          Import settings (.json)
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept="application/json"
          className="sr-only"
          aria-label="Import settings JSON file"
          onChange={(e) => void handleFileChange(e)}
        />
      </div>
      {importError && <p className="text-xs text-red-600 dark:text-red-400">{importError}</p>}
      {importSuccess && (
        <p className="text-xs text-emerald-600 dark:text-emerald-400">Settings imported.</p>
      )}

      <div className="mt-2 border-t border-neutral-200 pt-3 dark:border-neutral-800">
        <button
          type="button"
          onClick={() => setDeleteOpen(true)}
          className="rounded-md border border-red-300 px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50 dark:border-red-900 dark:text-red-400 dark:hover:bg-red-950/40"
        >
          Delete all local data
        </button>
        <p className="mt-1 text-[11px] text-neutral-400 dark:text-neutral-500">
          Removes your draft, settings, and theme preference from this browser.
        </p>
      </div>

      <ConfirmDialog
        open={resetOpen}
        title="Reset settings to defaults?"
        description="Page, typography, header/footer, and content settings will return to their defaults. Your Markdown content is not affected."
        confirmLabel="Reset"
        destructive={false}
        onConfirm={() => {
          resetSettings()
          setResetOpen(false)
        }}
        onCancel={() => setResetOpen(false)}
      />

      <ConfirmDialog
        open={deleteOpen}
        title="Delete all local data?"
        description="This permanently removes your saved draft, settings, and theme preference from this browser's local storage. This cannot be undone."
        confirmLabel="Delete everything"
        onConfirm={() => {
          deleteAllLocalData()
          setDeleteOpen(false)
        }}
        onCancel={() => setDeleteOpen(false)}
      />
    </div>
  )
}
