import { useCallback, useState } from 'react'

import { runExport } from '@/services/export/exportService'
import type { DocumentSettings } from '@/types/settings'
import type { DocumentTemplate } from '@/types/template'
import type { ExportFormat, ExportProgress } from '@/types/export'

export function useExport() {
  const [progress, setProgress] = useState<ExportProgress | null>(null)
  const [isExporting, setIsExporting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const startExport = useCallback(
    async (
      format: ExportFormat,
      markdown: string,
      settings: DocumentSettings,
      template: DocumentTemplate,
    ) => {
      if (isExporting) return
      setIsExporting(true)
      setError(null)
      setProgress({ status: 'preparing', message: 'Starting export…', percent: 0 })

      const result = await runExport({
        format,
        markdown,
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
