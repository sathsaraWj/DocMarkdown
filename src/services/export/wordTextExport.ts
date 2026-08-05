import { wordHtmlToPlainText } from '@/services/word/wordToPlainText'
import { buildFilename } from '@/utils/filename'

export interface WordTextExportResult {
  content: string
  filename: string
}

export function buildWordTextExport(html: string, title: string): WordTextExportResult {
  return { content: wordHtmlToPlainText(html), filename: buildFilename(title, 'txt') }
}
