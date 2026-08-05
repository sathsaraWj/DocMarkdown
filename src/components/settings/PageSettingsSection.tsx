import { MARGIN_PRESETS_MM } from '@/types/page'
import type { MarginPreset, Orientation, PageSettings, PageSize } from '@/types/page'
import { NumberField, SectionHeading, SelectField } from './fields'

const PAGE_SIZE_OPTIONS: { value: PageSize; label: string }[] = [
  { value: 'A4', label: 'A4 (210 × 297 mm)' },
  { value: 'Letter', label: 'Letter (8.5 × 11 in)' },
  { value: 'Legal', label: 'Legal (8.5 × 14 in)' },
  { value: 'A5', label: 'A5 (148 × 210 mm)' },
]

const ORIENTATION_OPTIONS: { value: Orientation; label: string }[] = [
  { value: 'portrait', label: 'Portrait' },
  { value: 'landscape', label: 'Landscape' },
]

const MARGIN_PRESET_OPTIONS: { value: MarginPreset; label: string }[] = [
  { value: 'narrow', label: 'Narrow' },
  { value: 'normal', label: 'Normal' },
  { value: 'wide', label: 'Wide' },
  { value: 'custom', label: 'Custom' },
]

export interface PageSettingsSectionProps {
  page: PageSettings
  onChange: (updater: (prev: PageSettings) => PageSettings) => void
}

/** Pure, prop-driven page/margin controls shared by the Markdown and Word converters. */
export function PageSettingsSection({ page, onChange }: PageSettingsSectionProps) {
  return (
    <div className="flex flex-col gap-4">
      <SectionHeading>Page</SectionHeading>
      <div className="grid grid-cols-2 gap-3">
        <SelectField
          label="Page size"
          value={page.size}
          options={PAGE_SIZE_OPTIONS}
          onChange={(size) => onChange((prev) => ({ ...prev, size }))}
        />
        <SelectField
          label="Orientation"
          value={page.orientation}
          options={ORIENTATION_OPTIONS}
          onChange={(orientation) => onChange((prev) => ({ ...prev, orientation }))}
        />
      </div>

      <SelectField
        label="Margins"
        value={page.marginPreset}
        options={MARGIN_PRESET_OPTIONS}
        onChange={(marginPreset) =>
          onChange((prev) => ({
            ...prev,
            marginPreset,
            margins: marginPreset === 'custom' ? prev.margins : MARGIN_PRESETS_MM[marginPreset],
          }))
        }
      />

      <div className="grid grid-cols-2 gap-3">
        <NumberField
          label="Top"
          suffix="mm"
          value={page.margins.top}
          min={0}
          max={100}
          onChange={(top) =>
            onChange((prev) => ({
              ...prev,
              marginPreset: 'custom',
              margins: { ...prev.margins, top },
            }))
          }
        />
        <NumberField
          label="Right"
          suffix="mm"
          value={page.margins.right}
          min={0}
          max={100}
          onChange={(right) =>
            onChange((prev) => ({
              ...prev,
              marginPreset: 'custom',
              margins: { ...prev.margins, right },
            }))
          }
        />
        <NumberField
          label="Bottom"
          suffix="mm"
          value={page.margins.bottom}
          min={0}
          max={100}
          onChange={(bottom) =>
            onChange((prev) => ({
              ...prev,
              marginPreset: 'custom',
              margins: { ...prev.margins, bottom },
            }))
          }
        />
        <NumberField
          label="Left"
          suffix="mm"
          value={page.margins.left}
          min={0}
          max={100}
          onChange={(left) =>
            onChange((prev) => ({
              ...prev,
              marginPreset: 'custom',
              margins: { ...prev.margins, left },
            }))
          }
        />
      </div>
    </div>
  )
}
