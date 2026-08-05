import { HeaderFooterSettingsSection } from '@/components/settings/HeaderFooterSettingsSection'
import { PageSettingsSection } from '@/components/settings/PageSettingsSection'
import { TemplateSelectSection } from '@/components/settings/TemplateSelectSection'
import { NumberField, SectionHeading, SelectField, TextField, ToggleField } from '@/components/settings/fields'
import { FONT_FAMILY_OPTIONS, TYPOGRAPHY_LIMITS } from '@/types/typography'
import type { FontFamilyId } from '@/types/typography'
import type { HeaderFooterSettings } from '@/types/headerFooter'
import type { PageSettings } from '@/types/page'
import type { TemplateId } from '@/types/template'
import { WORD_IMAGE_QUALITY_LIMITS, type WordConversionSettings } from '@/types/word'
import { WordExportPanel } from './WordExportPanel'

const FONT_OPTIONS: { value: FontFamilyId; label: string }[] = FONT_FAMILY_OPTIONS.map((f) => ({
  value: f.id,
  label: f.label,
}))

interface WordSettingsPanelProps {
  html: string
  ready: boolean
  settings: WordConversionSettings
  onChange: (updater: (prev: WordConversionSettings) => WordConversionSettings) => void
}

export function WordSettingsPanel({ html, ready, settings, onChange }: WordSettingsPanelProps) {
  const { document, normalizeStyling, images } = settings
  const limits = TYPOGRAPHY_LIMITS

  const updatePage = (updater: (prev: PageSettings) => PageSettings) => {
    onChange((prev) => ({ ...prev, document: { ...prev.document, page: updater(prev.document.page) } }))
  }

  const updateHeaderFooter = (updater: (prev: HeaderFooterSettings) => HeaderFooterSettings) => {
    onChange((prev) => ({
      ...prev,
      document: { ...prev.document, headerFooter: updater(prev.document.headerFooter) },
    }))
  }

  const updateTemplateId = (templateId: TemplateId) => {
    onChange((prev) => ({ ...prev, document: { ...prev.document, templateId } }))
  }

  return (
    <div className="flex h-full min-h-0 flex-col overflow-y-auto">
      <div className="border-b border-neutral-200 px-3 py-2 dark:border-neutral-800">
        <h2 className="text-sm font-semibold text-neutral-700 dark:text-neutral-200">
          Conversion settings
        </h2>
      </div>

      <div className="flex flex-col gap-6 divide-y divide-neutral-200 px-4 py-4 dark:divide-neutral-800 [&>*:not(:first-child)]:pt-6">
        <div className="flex flex-col gap-3">
          <SectionHeading>Document title</SectionHeading>
          <TextField
            label="Document title (used for the PDF file name)"
            value={document.metadata.title}
            placeholder="Untitled Document"
            onChange={(title) =>
              onChange((prev) => ({
                ...prev,
                document: { ...prev.document, metadata: { ...prev.document.metadata, title } },
              }))
            }
          />
        </div>

        <PageSettingsSection page={document.page} onChange={updatePage} />

        <div className="flex flex-col gap-3">
          <ToggleField
            label="Normalize document styling"
            description="Apply a DocMarkdown template and typography instead of the extracted look"
            checked={normalizeStyling}
            onChange={(normalizeStyling) => onChange((prev) => ({ ...prev, normalizeStyling }))}
          />

          {normalizeStyling && (
            <>
              <TemplateSelectSection templateId={document.templateId} onChange={updateTemplateId} />

              <SectionHeading>Typography</SectionHeading>
              <SelectField
                label="Font family"
                value={document.typography.fontFamily}
                options={FONT_OPTIONS}
                onChange={(fontFamily) =>
                  onChange((prev) => ({
                    ...prev,
                    document: {
                      ...prev.document,
                      typography: { ...prev.document.typography, fontFamily },
                    },
                  }))
                }
              />
              <div className="grid grid-cols-2 gap-3">
                <NumberField
                  label="Body font size"
                  suffix="pt"
                  value={document.typography.bodyFontSize}
                  min={limits.bodyFontSize.min}
                  max={limits.bodyFontSize.max}
                  step={0.5}
                  onChange={(bodyFontSize) =>
                    onChange((prev) => ({
                      ...prev,
                      document: {
                        ...prev.document,
                        typography: { ...prev.document.typography, bodyFontSize },
                      },
                    }))
                  }
                />
                <NumberField
                  label="Line height"
                  value={document.typography.lineHeight}
                  min={limits.lineHeight.min}
                  max={limits.lineHeight.max}
                  step={0.05}
                  onChange={(lineHeight) =>
                    onChange((prev) => ({
                      ...prev,
                      document: {
                        ...prev.document,
                        typography: { ...prev.document.typography, lineHeight },
                      },
                    }))
                  }
                />
              </div>
            </>
          )}
        </div>

        <HeaderFooterSettingsSection headerFooter={document.headerFooter} onChange={updateHeaderFooter} />

        <div className="flex flex-col gap-3">
          <SectionHeading>Images</SectionHeading>
          <ToggleField
            label="Include document images"
            checked={images.includeImages}
            onChange={(includeImages) =>
              onChange((prev) => ({ ...prev, images: { ...prev.images, includeImages } }))
            }
          />
          {images.includeImages && (
            <>
              <ToggleField
                label="Compress images"
                description="Re-encodes images to reduce PDF file size"
                checked={images.compressImages}
                onChange={(compressImages) =>
                  onChange((prev) => ({ ...prev, images: { ...prev.images, compressImages } }))
                }
              />
              {images.compressImages && (
                <NumberField
                  label="Image quality"
                  value={images.imageQuality}
                  min={WORD_IMAGE_QUALITY_LIMITS.min}
                  max={WORD_IMAGE_QUALITY_LIMITS.max}
                  step={0.1}
                  onChange={(imageQuality) =>
                    onChange((prev) => ({ ...prev, images: { ...prev.images, imageQuality } }))
                  }
                />
              )}
            </>
          )}
        </div>

        <WordExportPanel html={html} ready={ready} images={images} settings={document} />
      </div>
    </div>
  )
}
