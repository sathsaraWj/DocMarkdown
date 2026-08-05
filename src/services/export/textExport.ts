import { markdownToPlainText } from '@/services/markdown'
import { buildFilename } from '@/utils/filename'

export interface TextExportResult {
  content: string
  filename: string
}

export function buildTextExport(markdown: string, title: string): TextExportResult {
  return { content: markdownToPlainText(markdown), filename: buildFilename(title, 'txt') }
}
