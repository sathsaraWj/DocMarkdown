import { useCallback, useState } from 'react'

import { runWordExport } from '@/services/export/wordExportService'
import type { DocumentSettings } from '@/types/settings'
import type { DocumentTemplate } from '@/types/template'
import type { ExportProgress } from '@/types/export'
import type { WordExportFormat, WordImageOptions } from '@/types/word'

export function useWordExport() {
  const [progress, setProgress] = useState<ExportProgress | null>(null)
  const [isExporting, setIsExporting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const startExport = useCallback(
    async (
      format: WordExportFormat,
      html: string,
      images: WordImageOptions,
      settings: DocumentSettings,
      template: DocumentTemplate,
    ) => {
      if (isExporting) return
      setIsExporting(true)
      setError(null)
      setProgress({ status: 'preparing', message: 'Starting export…', percent: 0 })

      const result = await runWordExport({
        format,
        html,
        images,
        settings,
        template,
        onProgress: setProgress,
      })

      if (!result.success) {
        setError(result.error ?? 'Export failed.')
      }
      setIsExporting(false)
      setTimeout(() => setProgress(null), 1500)
    },
    [isExporting],
  )

  return { startExport, isExporting, progress, error, clearError: () => setError(null) }
}
