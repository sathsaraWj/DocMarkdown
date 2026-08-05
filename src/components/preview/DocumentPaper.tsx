import { useEffect, useRef, useState } from 'react'

import { getPageDimensionsMm } from '@/types/page'
import type { DocumentSettings } from '@/types/settings'
import type { DocumentTemplate } from '@/types/template'
import { buildContentCss } from '@/styles/documentContentCss'
import { mmToPx } from '@/utils/pageMath'

interface DocumentPaperProps {
  html: string
  settings: DocumentSettings
  template: DocumentTemplate
  onNaturalHeightChange?: (heightPx: number) => void
}

function resolveHeaderFooterPreview(
  text: string,
  title: string,
  showTitle: boolean,
  showDate: boolean,
  showPage: boolean,
): string {
  const parts: string[] = []
  if (text) parts.push(text)
  if (showTitle) parts.push(title || 'Untitled Document')
  if (showDate) parts.push(new Date().toLocaleDateString())
  if (showPage) parts.push('Page 1 of 1')
  return parts.join(' • ')
}

export function DocumentPaper({
  html,
  settings,
  template,
  onNaturalHeightChange,
}: DocumentPaperProps) {
  const { page, headerFooter, metadata } = settings
  const { width, height } = getPageDimensionsMm(page)
  const widthPx = mmToPx(width)
  const heightPx = mmToPx(height)
  const marginTopPx = mmToPx(page.margins.top)
  const marginRightPx = mmToPx(page.margins.right)
  const marginBottomPx = mmToPx(page.margins.bottom)
  const marginLeftPx = mmToPx(page.margins.left)

  const contentRef = useRef<HTMLDivElement>(null)
  const [contentHeightPx, setContentHeightPx] = useState(0)

  useEffect(() => {
    const node = contentRef.current
    if (!node) return
    const observer = new ResizeObserver((entries) => {
      const entry = entries[0]
      if (entry) setContentHeightPx(entry.contentRect.height)
    })
    observer.observe(node)
    return () => observer.disconnect()
  }, [])

  const pageContentHeightPx = heightPx - marginTopPx - marginBottomPx
  const pageCount =
    pageContentHeightPx > 0 ? Math.max(1, Math.ceil(contentHeightPx / pageContentHeightPx)) : 1
  const breakOffsets =
    pageCount > 1
      ? Array.from({ length: pageCount - 1 }, (_, i) => (i + 1) * pageContentHeightPx)
      : []

  const naturalHeightPx = marginTopPx + marginBottomPx + contentHeightPx
  useEffect(() => {
    onNaturalHeightChange?.(Math.max(heightPx, naturalHeightPx))
  }, [naturalHeightPx, heightPx, onNaturalHeightChange])

  const contentCss = buildContentCss(settings, template)

  return (
    <div
      className="relative bg-white shadow-lg ring-1 ring-neutral-900/5 dark:ring-white/10"
      style={{ width: widthPx }}
      data-testid="document-paper"
    >
      <style>{contentCss}</style>

      {headerFooter.headerEnabled && (
        <div
          className="absolute left-0 right-0 border-b border-dashed border-neutral-300 text-[10px] text-neutral-400 dark:border-neutral-700"
          style={{ top: marginTopPx / 2 - 6, left: marginLeftPx, right: marginRightPx }}
        >
          {resolveHeaderFooterPreview(
            headerFooter.headerText,
            metadata.title,
            headerFooter.showDocTitle,
            headerFooter.showExportDate,
            false,
          )}
        </div>
      )}

      <div
        style={{
          paddingTop: marginTopPx,
          paddingRight: marginRightPx,
          paddingBottom: marginBottomPx,
          paddingLeft: marginLeftPx,
          minHeight: heightPx,
        }}
      >
        <div ref={contentRef} className="doc-content" dangerouslySetInnerHTML={{ __html: html }} />
      </div>

      {headerFooter.footerEnabled && (
        <div
          className="absolute left-0 right-0 border-t border-dashed border-neutral-300 text-center text-[10px] text-neutral-400 dark:border-neutral-700"
          style={{ bottom: marginBottomPx / 2 - 6, left: marginLeftPx, right: marginRightPx }}
        >
          {resolveHeaderFooterPreview(
            headerFooter.footerText,
            metadata.title,
            headerFooter.showDocTitle,
            headerFooter.showExportDate,
            headerFooter.showPageNumber,
          )}
        </div>
      )}

      {breakOffsets.map((offset) => (
        <div
          key={offset}
          aria-hidden="true"
          className="pointer-events-none absolute left-0 right-0 flex items-center"
          style={{ top: marginTopPx + offset }}
        >
          <div className="w-full border-t border-dashed border-neutral-300 dark:border-neutral-600" />
          <span className="absolute right-2 -translate-y-1/2 bg-white px-1 text-[10px] text-neutral-400 dark:bg-neutral-950">
            page break
          </span>
        </div>
      ))}
    </div>
  )
}
