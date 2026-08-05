import { SectionHeading, TextField } from '@/components/settings/fields'
import type { MergePdfOutputMetadata, MergePdfSettings as MergePdfSettingsType } from '@/types/mergePdf'

interface MergePdfSettingsProps {
  settings: MergePdfSettingsType
  onFilenameChange: (filename: string) => void
  onMetadataFieldChange: (field: keyof MergePdfOutputMetadata, value: string) => void
  suggestedTitle?: string | null
  suggestedAuthor?: string | null
  disabled?: boolean
}

/** Filename + optional output metadata for the merged PDF. Suggested title/author (from the first ready file) are shown, never applied silently. */
export function MergePdfSettings({
  settings,
  onFilenameChange,
  onMetadataFieldChange,
  suggestedTitle,
  suggestedAuthor,
  disabled,
}: MergePdfSettingsProps) {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-2">
        <SectionHeading>Output file</SectionHeading>
        <fieldset disabled={disabled} className="contents">
          <TextField
            label="Output filename"
            value={settings.filename}
            placeholder="merged-document.pdf"
            onChange={onFilenameChange}
          />
        </fieldset>
      </div>

      <div className="flex flex-col gap-2">
        <SectionHeading>Document metadata (optional)</SectionHeading>
        <fieldset disabled={disabled} className="flex flex-col gap-2">
          <TextField
            label="Title"
            value={settings.metadata.title}
            placeholder={suggestedTitle ?? 'Untitled'}
            onChange={(value) => onMetadataFieldChange('title', value)}
          />
          {suggestedTitle && !settings.metadata.title && (
            <button
              type="button"
              onClick={() => onMetadataFieldChange('title', suggestedTitle)}
              className="self-start text-xs font-medium text-accent-600 underline underline-offset-2 dark:text-accent-400"
            >
              Use "{suggestedTitle}" from the first file
            </button>
          )}

          <TextField
            label="Author"
            value={settings.metadata.author}
            placeholder={suggestedAuthor ?? ''}
            onChange={(value) => onMetadataFieldChange('author', value)}
          />
          {suggestedAuthor && !settings.metadata.author && (
            <button
              type="button"
              onClick={() => onMetadataFieldChange('author', suggestedAuthor)}
              className="self-start text-xs font-medium text-accent-600 underline underline-offset-2 dark:text-accent-400"
            >
              Use "{suggestedAuthor}" from the first file
            </button>
          )}

          <TextField
            label="Subject"
            value={settings.metadata.subject}
            onChange={(value) => onMetadataFieldChange('subject', value)}
          />
          <TextField
            label="Keywords"
            value={settings.metadata.keywords}
            placeholder="comma, separated, keywords"
            onChange={(value) => onMetadataFieldChange('keywords', value)}
          />
        </fieldset>
      </div>
    </div>
  )
}
