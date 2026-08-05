import { useCallback, useState } from 'react'

import { useDocument } from '@/app/DocumentContext'
import { getTemplate } from '@/templates'
import { getPageDimensionsMm } from '@/types/page'
import { useRenderedMarkdown } from '@/hooks/useRenderedMarkdown'
import { usePreviewZoom } from '@/hooks/usePreviewZoom'
import { mmToPx } from '@/utils/pageMath'
import { DocumentPaper } from './DocumentPaper'
import { PreviewToolbar } from './PreviewToolbar'

export function PreviewPanel() {
  const { markdown, settings } = useDocument()
  const template = getTemplate(settings.templateId)
  const { html, isRendering } = useRenderedMarkdown(
    markdown,
    settings.content.headingNumbering,
    settings.content.generateToc,
  )

  const { width } = getPageDimensionsMm(settings.page)
  const widthPx = mmToPx(width)
  const { containerRef, zoom, mode, zoomIn, zoomOut, resetZoom, fitToWidth } =
    usePreviewZoom(widthPx)
  const [naturalHeight, setNaturalHeight] = useState(0)

  const handleNaturalHeightChange = useCallback((heightPx: number) => {
    setNaturalHeight(heightPx)
  }, [])

  const isEmpty = markdown.trim().length === 0

  return (
    <div className="flex h-full min-h-0 flex-col">
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
        {isEmpty ? (
          <div className="flex h-full flex-col items-center justify-center gap-2 text-center text-neutral-400 dark:text-neutral-500">
            <p className="text-sm font-medium">Nothing to preview yet</p>
            <p className="max-w-xs text-xs">
              Start writing Markdown on the other side and it will appear here.
            </p>
          </div>
        ) : (
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

        {isRendering && !isEmpty && (
          <div
            role="status"
            aria-live="polite"
            className="absolute right-4 top-4 flex items-center gap-2 rounded-full bg-white/90 px-3 py-1.5 text-xs font-medium text-neutral-600 shadow dark:bg-neutral-800/90 dark:text-neutral-300"
          >
            <span
              className="h-3 w-3 animate-spin rounded-full border-2 border-neutral-300 border-t-accent-600 dark:border-neutral-600"
              aria-hidden="true"
            />
            Rendering…
          </div>
        )}
      </div>
    </div>
  )
}
