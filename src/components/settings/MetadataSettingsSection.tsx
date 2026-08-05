import { useDocument } from '@/app/DocumentContext'
import { SectionHeading, TextField } from './fields'

export function MetadataSettingsSection() {
  const { settings, setSettings } = useDocument()
  const { metadata } = settings

  return (
    <div className="flex flex-col gap-4">
      <SectionHeading>Document metadata</SectionHeading>
      <TextField
        label="Title"
        value={metadata.title}
        onChange={(title) =>
          setSettings((prev) => ({ ...prev, metadata: { ...prev.metadata, title } }))
        }
        placeholder="Untitled Document"
      />
      <TextField
        label="Author"
        value={metadata.author}
        onChange={(author) =>
          setSettings((prev) => ({ ...prev, metadata: { ...prev.metadata, author } }))
        }
        placeholder="Your name"
      />
      <TextField
        label="Subject"
        value={metadata.subject}
        onChange={(subject) =>
          setSettings((prev) => ({ ...prev, metadata: { ...prev.metadata, subject } }))
        }
        placeholder="What this document is about"
      />
      <TextField
        label="Keywords"
        value={metadata.keywords}
        onChange={(keywords) =>
          setSettings((prev) => ({ ...prev, metadata: { ...prev.metadata, keywords } }))
        }
        placeholder="comma, separated, keywords"
      />
    </div>
  )
}
