import type { HeaderFooterSettings } from '@/types/headerFooter'
import { SectionHeading, TextField, ToggleField } from './fields'

export interface HeaderFooterSettingsSectionProps {
  headerFooter: HeaderFooterSettings
  onChange: (updater: (prev: HeaderFooterSettings) => HeaderFooterSettings) => void
}

/** Pure, prop-driven header/footer controls shared by the Markdown and Word converters. */
export function HeaderFooterSettingsSection({ headerFooter, onChange }: HeaderFooterSettingsSectionProps) {
  return (
    <div className="flex flex-col gap-3">
      <SectionHeading>Header &amp; footer</SectionHeading>

      <ToggleField
        label="Enable header"
        checked={headerFooter.headerEnabled}
        onChange={(headerEnabled) => onChange((prev) => ({ ...prev, headerEnabled }))}
      />
      {headerFooter.headerEnabled && (
        <TextField
          label="Custom header text"
          value={headerFooter.headerText}
          placeholder="Leave blank to use the options below"
          onChange={(headerText) => onChange((prev) => ({ ...prev, headerText }))}
        />
      )}

      <ToggleField
        label="Enable footer"
        checked={headerFooter.footerEnabled}
        onChange={(footerEnabled) => onChange((prev) => ({ ...prev, footerEnabled }))}
      />
      {headerFooter.footerEnabled && (
        <TextField
          label="Custom footer text"
          value={headerFooter.footerText}
          placeholder="Leave blank to use the options below"
          onChange={(footerText) => onChange((prev) => ({ ...prev, footerText }))}
        />
      )}

      <div className="mt-1 border-t border-neutral-200 pt-2 dark:border-neutral-800">
        <ToggleField
          label="Show page number"
          checked={headerFooter.showPageNumber}
          onChange={(showPageNumber) => onChange((prev) => ({ ...prev, showPageNumber }))}
        />
        <ToggleField
          label="Show document title"
          checked={headerFooter.showDocTitle}
          onChange={(showDocTitle) => onChange((prev) => ({ ...prev, showDocTitle }))}
        />
        <ToggleField
          label="Show export date"
          checked={headerFooter.showExportDate}
          onChange={(showExportDate) => onChange((prev) => ({ ...prev, showExportDate }))}
        />
      </div>
    </div>
  )
}
