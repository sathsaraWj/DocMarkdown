import { buildFilename } from '@/utils/filename'

export interface MarkdownExportResult {
  content: string
  filename: string
}

export function buildMarkdownExport(markdown: string, title: string): MarkdownExportResult {
  return { content: markdown, filename: buildFilename(title, 'md') }
}
