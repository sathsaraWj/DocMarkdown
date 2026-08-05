export type ExportFormat = 'pdf' | 'docx' | 'html' | 'markdown' | 'text'

export type ExportStatus = 'idle' | 'preparing' | 'rendering' | 'saving' | 'success' | 'error'

export interface ExportProgress {
  status: ExportStatus
  message: string
  percent: number
}

export interface ExportResult {
  success: boolean
  format: ExportFormat
  filename?: string
  error?: string
}
