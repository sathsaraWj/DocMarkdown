import JSZip from 'jszip'
import { describe, expect, it } from 'vitest'

import { getTemplate } from '@/templates'
import { DEFAULT_DOCUMENT_SETTINGS } from '@/types/settings'
import { generateDocx } from '@/services/docx/docxExportService'

async function readZipEntry(blob: Blob, path: string): Promise<string> {
  const zip = await JSZip.loadAsync(await blob.arrayBuffer())
  const entry = zip.file(path)
  if (!entry) throw new Error(`${path} missing from generated docx`)
  return entry.async('string')
}

function readDocumentXml(blob: Blob): Promise<string> {
  return readZipEntry(blob, 'word/document.xml')
}

const RICH_MARKDOWN = `# Report Title

## Section One

Some **bold**, *italic*, ~~strikethrough~~, and \`inline code\` text with a [link](https://example.com).

> A quoted remark with **emphasis** inside it.

- Unordered item
  - Nested item
- [x] Done task
- [ ] Pending task

1. First step
2. Second step

\`\`\`javascript
function greet() {
  return "hi"
}
\`\`\`

| Name | Role |
| ---- | ---- |
| Ada  | Engineer |
| Grace | Researcher |

---

Final paragraph after a rule.
`

describe('generateDocx', () => {
  it('produces a non-empty, valid zip-based docx blob for a rich document', async () => {
    const settings = {
      ...DEFAULT_DOCUMENT_SETTINGS,
      metadata: { ...DEFAULT_DOCUMENT_SETTINGS.metadata, title: 'Quarterly Report' },
    }
    const template = getTemplate(settings.templateId)

    const result = await generateDocx({ markdown: RICH_MARKDOWN, settings, template })

    expect(result.filename).toBe('quarterly-report.docx')
    expect(result.blob.size).toBeGreaterThan(0)
    expect(result.blob.type).toContain('officedocument.wordprocessingml.document')

    const bytes = new Uint8Array(await result.blob.arrayBuffer())
    // A .docx file is a zip archive; the first two bytes are the "PK" magic number.
    expect(bytes[0]).toBe(0x50)
    expect(bytes[1]).toBe(0x4b)

    const xml = await readDocumentXml(result.blob)
    expect(xml).toContain('Report Title')
    expect(xml).toContain('Section One')
    expect(xml).toContain('bold')
    expect(xml).toContain('Nested item')
    expect(xml).toContain('Done task')
    expect(xml).toContain('greet')
    expect(xml).toContain('Ada')
    expect(xml).toContain('Researcher')
    expect(xml).toContain('Final paragraph after a rule.')
    expect(xml).toContain('<w:hyperlink')
    expect(xml).not.toContain('<w:script')

    const rels = await readZipEntry(result.blob, 'word/_rels/document.xml.rels')
    expect(rels).toContain('https://example.com')
  })

  it('reports progress through preparing/rendering/saving/success stages', async () => {
    const settings = DEFAULT_DOCUMENT_SETTINGS
    const template = getTemplate(settings.templateId)
    const statuses: string[] = []

    await generateDocx({
      markdown: '# Hello\n\nWorld.',
      settings,
      template,
      onProgress: (p) => statuses.push(p.status),
    })

    expect(statuses).toContain('preparing')
    expect(statuses).toContain('rendering')
    expect(statuses).toContain('saving')
    expect(statuses[statuses.length - 1]).toBe('success')
  })

  it('reflects a document color override in the generated heading color', async () => {
    const defaultSettings = DEFAULT_DOCUMENT_SETTINGS
    const overriddenSettings = { ...DEFAULT_DOCUMENT_SETTINGS, colors: { headingColor: '#ff00ff' } }
    const template = getTemplate(defaultSettings.templateId)

    const defaultResult = await generateDocx({
      markdown: '# Title',
      settings: defaultSettings,
      template,
    })
    const overriddenResult = await generateDocx({
      markdown: '# Title',
      settings: overriddenSettings,
      template,
    })

    const defaultXml = await readDocumentXml(defaultResult.blob)
    const overriddenXml = await readDocumentXml(overriddenResult.blob)

    expect(overriddenXml).toContain('FF00FF')
    expect(defaultXml).not.toContain('FF00FF')
  })

  it('embeds a rasterized image for a data-URI image in the source', async () => {
    const settings = DEFAULT_DOCUMENT_SETTINGS
    const template = getTemplate(settings.templateId)
    // 1x1 transparent PNG.
    const pixel =
      'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII='
    const result = await generateDocx({
      markdown: `# Title\n\n![alt text](${pixel})`,
      settings,
      template,
    })
    expect(result.blob.size).toBeGreaterThan(0)
  })

  it('does not throw for a document containing a page break and an hr', async () => {
    const settings = DEFAULT_DOCUMENT_SETTINGS
    const template = getTemplate(settings.templateId)
    const result = await generateDocx({
      markdown: '# One\n\nFirst page.\n\n\\pagebreak\n\n---\n\nSecond page.',
      settings,
      template,
    })
    expect(result.blob.size).toBeGreaterThan(0)
  })
})
