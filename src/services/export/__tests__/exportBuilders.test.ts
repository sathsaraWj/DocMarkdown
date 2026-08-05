import { describe, expect, it } from 'vitest'

import { getTemplate } from '@/templates'
import { DEFAULT_DOCUMENT_SETTINGS } from '@/types/settings'
import { buildStandaloneHtml } from '@/services/export/htmlExport'
import { buildMarkdownExport } from '@/services/export/markdownExport'
import { buildTextExport } from '@/services/export/textExport'

const SAMPLE_MARKDOWN = '# Report\n\nSome **content** here.'

describe('buildMarkdownExport', () => {
  it('returns the source unchanged with a .md filename derived from the title', () => {
    const result = buildMarkdownExport(SAMPLE_MARKDOWN, 'Quarterly Report')
    expect(result.content).toBe(SAMPLE_MARKDOWN)
    expect(result.filename).toBe('quarterly-report.md')
  })
})

describe('buildTextExport', () => {
  it('produces plain text with a .txt filename', () => {
    const result = buildTextExport(SAMPLE_MARKDOWN, 'Quarterly Report')
    expect(result.content).toContain('Report')
    expect(result.content).not.toContain('**')
    expect(result.filename).toBe('quarterly-report.txt')
  })
})

describe('buildStandaloneHtml', () => {
  it('produces a self-contained document with embedded styles and sanitized content', () => {
    const settings = {
      ...DEFAULT_DOCUMENT_SETTINGS,
      metadata: { ...DEFAULT_DOCUMENT_SETTINGS.metadata, title: 'Quarterly Report' },
    }
    const template = getTemplate(settings.templateId)
    const result = buildStandaloneHtml(SAMPLE_MARKDOWN, settings, template)

    expect(result.filename).toBe('quarterly-report.html')
    expect(result.html).toContain('<!doctype html>')
    expect(result.html).toContain('<style>')
    expect(result.html).toContain('<h1')
    expect(result.html).not.toContain('<script>')
  })

  it('includes a table of contents when generateToc is enabled', () => {
    const settings = {
      ...DEFAULT_DOCUMENT_SETTINGS,
      content: { ...DEFAULT_DOCUMENT_SETTINGS.content, generateToc: true },
    }
    const template = getTemplate(settings.templateId)
    const result = buildStandaloneHtml('# One\n\n## Two', settings, template)
    expect(result.html).toContain('doc-toc')
  })
})
