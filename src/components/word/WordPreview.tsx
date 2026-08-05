import { useCallback, useState } from 'react'

import { DocumentPaper } from '@/components/preview/DocumentPaper'
import { PreviewToolbar } from '@/components/preview/PreviewToolbar'
import { usePreviewZoom } from '@/hooks/usePreviewZoom'
import { getTemplate } from '@/templates'
import type { DocumentSettings } from '@/types/settings'
import { getPageDimensionsMm } from '@/types/page'
import type { WordConversionStatus } from '@/types/word'
import { WORD_EXTRA_CONTENT_CSS } from '@/styles/wordContentCss'
import { mmToPx } from '@/utils/pageMath'

interface WordPreviewProps {
  html: string
  settings: DocumentSettings
  status: WordConversionStatus
  errorMessage: string | null
}

/**
 * Reuses the Markdown converter's paper/zoom preview surface (DocumentPaper,
 * PreviewToolbar, usePreviewZoom) for converted Word content. Unlike the
 * Markdown preview, content here is parsed once (not re-rendered on every
 * keystroke), so there's no debounce — only upload/parsing/error states.
 */
export function WordPreview({ html, settings, status, errorMessage }: WordPreviewProps) {
  const template = getTemplate(settings.templateId)
  const { width } = getPageDimensionsMm(settings.page)
  const widthPx = mmToPx(width)
  const { containerRef, zoom, mode, zoomIn, zoomOut, resetZoom, fitToWidth } = usePreviewZoom(widthPx)
  const [naturalHeight, setNaturalHeight] = useState(0)

  const handleNaturalHeightChange = useCallback((heightPx: number) => {
    setNaturalHeight(heightPx)
  }, [])

  const isParsing = status === 'validating' || status === 'parsing'
  const isEmpty = status === 'idle'
  const isError = status === 'invalid' || status === 'error'
  const isReady = status === 'ready' || status === 'ready-with-warnings'

  return (
    <div className="flex h-full min-h-0 flex-col">
      <style>{WORD_EXTRA_CONTENT_CSS}</style>
      <PreviewToolbar
        zoomPercent={zoom * 100}
        fitToWidthActive={mode === 'fit-width'}
        onZoomIn={zoomIn}
        onZoomOut={zoomOut}
        onResetZoom={resetZoom}
        onFitToWidth={fitToWidth}
      />
      <div
        ref={containerRef}
        className="relative min-h-0 flex-1 overflow-auto bg-neutral-100 px-6 py-8 dark:bg-neutral-900"
      >
        {isEmpty && (
          <div className="flex h-full flex-col items-center justify-center gap-2 text-center text-neutral-400 dark:text-neutral-500">
            <p className="text-sm font-medium">No document loaded yet</p>
            <p className="max-w-xs text-xs">Upload a .docx file to see the converted preview here.</p>
          </div>
        )}

        {isParsing && (
          <div
            role="status"
            aria-live="polite"
            className="flex h-full flex-col items-center justify-center gap-3 text-center text-neutral-500 dark:text-neutral-400"
          >
            <span
              className="h-8 w-8 animate-spin rounded-full border-2 border-neutral-300 border-t-accent-600 dark:border-neutral-600"
              aria-hidden="true"
            />
            <p className="text-sm font-medium">Converting your document…</p>
          </div>
        )}

        {isError && (
          <div
            role="alert"
            className="flex h-full flex-col items-center justify-center gap-2 text-center text-red-600 dark:text-red-400"
          >
            <p className="text-sm font-semibold">Could not show a preview</p>
            <p className="max-w-sm text-xs text-neutral-500 dark:text-neutral-400">{errorMessage}</p>
          </div>
        )}

        {isReady && (
          <div style={{ width: widthPx * zoom, height: naturalHeight * zoom }} className="mx-auto">
            <div
              style={{ width: widthPx, transform: `scale(${zoom})`, transformOrigin: 'top left' }}
            >
              <DocumentPaper
                html={html}
                settings={settings}
                template={template}
                onNaturalHeightChange={handleNaturalHeightChange}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
