import { useDocument } from '@/app/DocumentContext'
import { FONT_FAMILY_OPTIONS, TYPOGRAPHY_LIMITS } from '@/types/typography'
import type { FontFamilyId } from '@/types/typography'
import { NumberField, SectionHeading, SelectField } from './fields'

const FONT_OPTIONS: { value: FontFamilyId; label: string }[] = FONT_FAMILY_OPTIONS.map((f) => ({
  value: f.id,
  label: f.label,
}))

export function TypographySettingsSection() {
  const { settings, setSettings } = useDocument()
  const { typography } = settings
  const limits = TYPOGRAPHY_LIMITS

  return (
    <div className="flex flex-col gap-4">
      <SectionHeading>Typography</SectionHeading>
      <SelectField
        label="Font family"
        value={typography.fontFamily}
        options={FONT_OPTIONS}
        onChange={(fontFamily) =>
          setSettings((prev) => ({ ...prev, typography: { ...prev.typography, fontFamily } }))
        }
      />
      <div className="grid grid-cols-2 gap-3">
        <NumberField
          label="Body font size"
          suffix="pt"
          value={typography.bodyFontSize}
          min={limits.bodyFontSize.min}
          max={limits.bodyFontSize.max}
          step={0.5}
          onChange={(bodyFontSize) =>
            setSettings((prev) => ({ ...prev, typography: { ...prev.typography, bodyFontSize } }))
          }
        />
        <NumberField
          label="Heading scale"
          value={typography.headingScale}
          min={limits.headingScale.min}
          max={limits.headingScale.max}
          step={0.01}
          onChange={(headingScale) =>
            setSettings((prev) => ({ ...prev, typography: { ...prev.typography, headingScale } }))
          }
        />
        <NumberField
          label="Line height"
          value={typography.lineHeight}
          min={limits.lineHeight.min}
          max={limits.lineHeight.max}
          step={0.05}
          onChange={(lineHeight) =>
            setSettings((prev) => ({ ...prev, typography: { ...prev.typography, lineHeight } }))
          }
        />
        <NumberField
          label="Paragraph spacing"
          suffix="em"
          value={typography.paragraphSpacing}
          min={limits.paragraphSpacing.min}
          max={limits.paragraphSpacing.max}
          step={0.05}
          onChange={(paragraphSpacing) =>
            setSettings((prev) => ({
              ...prev,
              typography: { ...prev.typography, paragraphSpacing },
            }))
          }
        />
        <NumberField
          label="Code font size"
          suffix="pt"
          value={typography.codeFontSize}
          min={limits.codeFontSize.min}
          max={limits.codeFontSize.max}
          step={0.5}
          onChange={(codeFontSize) =>
            setSettings((prev) => ({ ...prev, typography: { ...prev.typography, codeFontSize } }))
          }
        />
      </div>
    </div>
  )
}
