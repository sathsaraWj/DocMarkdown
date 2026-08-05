import { useDocument } from '@/app/DocumentContext'
import { SectionHeading, TextField, ToggleField } from './fields'

export function HeaderFooterSettingsSection() {
  const { settings, setSettings } = useDocument()
  const { headerFooter } = settings

  return (
    <div className="flex flex-col gap-3">
      <SectionHeading>Header &amp; footer</SectionHeading>

      <ToggleField
        label="Enable header"
        checked={headerFooter.headerEnabled}
        onChange={(headerEnabled) =>
          setSettings((prev) => ({
            ...prev,
            headerFooter: { ...prev.headerFooter, headerEnabled },
          }))
        }
      />
      {headerFooter.headerEnabled && (
        <TextField
          label="Custom header text"
          value={headerFooter.headerText}
          placeholder="Leave blank to use the options below"
          onChange={(headerText) =>
            setSettings((prev) => ({ ...prev, headerFooter: { ...prev.headerFooter, headerText } }))
          }
        />
      )}

      <ToggleField
        label="Enable footer"
        checked={headerFooter.footerEnabled}
        onChange={(footerEnabled) =>
          setSettings((prev) => ({
            ...prev,
            headerFooter: { ...prev.headerFooter, footerEnabled },
          }))
        }
      />
      {headerFooter.footerEnabled && (
        <TextField
          label="Custom footer text"
          value={headerFooter.footerText}
          placeholder="Leave blank to use the options below"
          onChange={(footerText) =>
            setSettings((prev) => ({ ...prev, headerFooter: { ...prev.headerFooter, footerText } }))
          }
        />
      )}

      <div className="mt-1 border-t border-neutral-200 pt-2 dark:border-neutral-800">
        <ToggleField
          label="Show page number"
          checked={headerFooter.showPageNumber}
          onChange={(showPageNumber) =>
            setSettings((prev) => ({
              ...prev,
              headerFooter: { ...prev.headerFooter, showPageNumber },
            }))
          }
        />
        <ToggleField
          label="Show document title"
          checked={headerFooter.showDocTitle}
          onChange={(showDocTitle) =>
            setSettings((prev) => ({
              ...prev,
              headerFooter: { ...prev.headerFooter, showDocTitle },
            }))
          }
        />
        <ToggleField
          label="Show export date"
          checked={headerFooter.showExportDate}
          onChange={(showExportDate) =>
            setSettings((prev) => ({
              ...prev,
              headerFooter: { ...prev.headerFooter, showExportDate },
            }))
          }
        />
      </div>
    </div>
  )
}
