import { useCallback, useEffect, useRef, useState } from 'react'

const MIN_ZOOM = 0.4
const MAX_ZOOM = 2
const STEP = 0.1

export function usePreviewZoom(pageWidthPx: number) {
  const [mode, setMode] = useState<'fixed' | 'fit-width'>('fit-width')
  const [zoom, setZoom] = useState(1)
  const containerRef = useRef<HTMLDivElement>(null)

  const recomputeFit = useCallback(() => {
    const container = containerRef.current
    if (!container || pageWidthPx === 0) return
    const available = container.clientWidth - 48
    const next = Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, available / pageWidthPx))
    setZoom(next)
  }, [pageWidthPx])

  useEffect(() => {
    if (mode !== 'fit-width') return
    recomputeFit()
    const container = containerRef.current
    if (!container) return
    const observer = new ResizeObserver(() => recomputeFit())
    observer.observe(container)
    return () => observer.disconnect()
  }, [mode, recomputeFit])

  const zoomIn = useCallback(() => {
    setMode('fixed')
    setZoom((z) => Math.min(MAX_ZOOM, Math.round((z + STEP) * 100) / 100))
  }, [])

  const zoomOut = useCallback(() => {
    setMode('fixed')
    setZoom((z) => Math.max(MIN_ZOOM, Math.round((z - STEP) * 100) / 100))
  }, [])

  const resetZoom = useCallback(() => {
    setMode('fixed')
    setZoom(1)
  }, [])

  const fitToWidth = useCallback(() => {
    setMode('fit-width')
  }, [])

  return { containerRef, zoom, mode, zoomIn, zoomOut, resetZoom, fitToWidth }
}
