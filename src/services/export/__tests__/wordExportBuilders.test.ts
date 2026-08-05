import { describe, expect, it } from 'vitest'

import { getTemplate } from '@/templates'
import { DEFAULT_DOCUMENT_SETTINGS } from '@/types/settings'
import { buildWordStandaloneHtml } from '@/services/export/wordHtmlExport'
import { buildWordTextExport } from '@/services/export/wordTextExport'

const SAMPLE_HTML = '<h1>Report</h1><p>Some <strong>bold</strong> content.</p>'

describe('buildWordStandaloneHtml', () => {
  it('produces a self-contained document with embedded styles and sanitized content', () => {
    const settings = {
      ...DEFAULT_DOCUMENT_SETTINGS,
      metadata: { ...DEFAULT_DOCUMENT_SETTINGS.metadata, title: 'Quarterly Report' },
    }
    const template = getTemplate(settings.templateId)
    const result = buildWordStandaloneHtml(SAMPLE_HTML, settings, template)

    expect(result.filename).toBe('quarterly-report.html')
    expect(result.html).toContain('<!doctype html>')
    expect(result.html).toContain('<style>')
    expect(result.html).toContain('<h1>Report</h1>')
    expect(result.html).not.toContain('<script>')
  })

  it('includes the docx-specific alignment/page-break CSS classes', () => {
    const template = getTemplate(DEFAULT_DOCUMENT_SETTINGS.templateId)
    const result = buildWordStandaloneHtml(SAMPLE_HTML, DEFAULT_DOCUMENT_SETTINGS, template)
    expect(result.html).toContain('.docx-align-center')
    expect(result.html).toContain('.docx-page-break')
  })
})

describe('buildWordTextExport', () => {
  it('produces plain text with a .txt filename', () => {
    const result = buildWordTextExport(SAMPLE_HTML, 'Quarterly Report')
    expect(result.content).toContain('Report')
    expect(result.content).not.toContain('<')
    expect(result.filename).toBe('quarterly-report.txt')
  })
})
