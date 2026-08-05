import { useDocument } from '@/app/DocumentContext'
import { SectionHeading, ToggleField } from './fields'

export function ContentOptionsSection() {
  const { settings, setSettings } = useDocument()
  const { content } = settings

  return (
    <div className="flex flex-col gap-1">
      <SectionHeading>Content options</SectionHeading>
      <ToggleField
        label="Generate table of contents"
        checked={content.generateToc}
        onChange={(generateToc) =>
          setSettings((prev) => ({ ...prev, content: { ...prev.content, generateToc } }))
        }
      />
      <ToggleField
        label="Heading numbering"
        checked={content.headingNumbering}
        onChange={(headingNumbering) =>
          setSettings((prev) => ({ ...prev, content: { ...prev.content, headingNumbering } }))
        }
      />
      <ToggleField
        label="Style links for print"
        checked={content.styleLinksForPrint}
        onChange={(styleLinksForPrint) =>
          setSettings((prev) => ({ ...prev, content: { ...prev.content, styleLinksForPrint } }))
        }
      />
      <ToggleField
        label="Code block backgrounds"
        checked={content.codeBlockBackgrounds}
        onChange={(codeBlockBackgrounds) =>
          setSettings((prev) => ({ ...prev, content: { ...prev.content, codeBlockBackgrounds } }))
        }
      />
      <ToggleField
        label="Preserve checklist symbols"
        checked={content.preserveChecklistSymbols}
        description="Uses ☑/☐ instead of [x]/[ ] in text and PDF exports"
        onChange={(preserveChecklistSymbols) =>
          setSettings((prev) => ({
            ...prev,
            content: { ...prev.content, preserveChecklistSymbols },
          }))
        }
      />
    </div>
  )
}
