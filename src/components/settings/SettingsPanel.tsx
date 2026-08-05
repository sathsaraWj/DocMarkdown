import { ContentOptionsSection } from './ContentOptionsSection'
import { HeaderFooterSettingsSection } from './HeaderFooterSettingsSection'
import { MetadataSettingsSection } from './MetadataSettingsSection'
import { PageSettingsSection } from './PageSettingsSection'
import { SettingsManagementSection } from './SettingsManagementSection'
import { TemplateSelectSection } from './TemplateSelectSection'
import { TypographySettingsSection } from './TypographySettingsSection'

export function SettingsPanel() {
  return (
    <div className="flex h-full min-h-0 flex-col overflow-y-auto">
      <div className="border-b border-neutral-200 px-3 py-2 dark:border-neutral-800">
        <h2 className="text-sm font-semibold text-neutral-700 dark:text-neutral-200">
          Document settings
        </h2>
      </div>
      <div className="flex flex-col gap-6 divide-y divide-neutral-200 px-4 py-4 dark:divide-neutral-800 [&>*:not(:first-child)]:pt-6">
        <TemplateSelectSection />
        <PageSettingsSection />
        <TypographySettingsSection />
        <MetadataSettingsSection />
        <HeaderFooterSettingsSection />
        <ContentOptionsSection />
        <SettingsManagementSection />
      </div>
    </div>
  )
}
