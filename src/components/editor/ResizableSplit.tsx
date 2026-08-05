import { useCallback, useEffect, useRef, useState } from 'react'
import type { KeyboardEvent, ReactNode } from 'react'

interface ResizableSplitProps {
  left: ReactNode
  right: ReactNode
  storageKey?: string
}

const MIN_RATIO = 25
const MAX_RATIO = 75
const DEFAULT_RATIO = 50
const STEP = 4

export function ResizableSplit({ left, right, storageKey }: ResizableSplitProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const draggingRef = useRef(false)
  const [ratio, setRatio] = useState<number>(() => {
    if (!storageKey) return DEFAULT_RATIO
    const stored = Number(sessionStorage.getItem(storageKey))
    return Number.isFinite(stored) && stored >= MIN_RATIO && stored <= MAX_RATIO
      ? stored
      : DEFAULT_RATIO
  })

  useEffect(() => {
    if (storageKey) sessionStorage.setItem(storageKey, String(ratio))
  }, [ratio, storageKey])

  const clamp = useCallback((value: number) => Math.min(MAX_RATIO, Math.max(MIN_RATIO, value)), [])

  useEffect(() => {
    function handleMove(event: PointerEvent) {
      if (!draggingRef.current || !containerRef.current) return
      const rect = containerRef.current.getBoundingClientRect()
      const percent = ((event.clientX - rect.left) / rect.width) * 100
      setRatio(clamp(percent))
    }
    function handleUp() {
      draggingRef.current = false
    }
    window.addEventListener('pointermove', handleMove)
    window.addEventListener('pointerup', handleUp)
    return () => {
      window.removeEventListener('pointermove', handleMove)
      window.removeEventListener('pointerup', handleUp)
    }
  }, [clamp])

  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (event.key === 'ArrowLeft') {
        event.preventDefault()
        setRatio((r) => clamp(r - STEP))
      } else if (event.key === 'ArrowRight') {
        event.preventDefault()
        setRatio((r) => clamp(r + STEP))
      } else if (event.key === 'Home') {
        event.preventDefault()
        setRatio(MIN_RATIO)
      } else if (event.key === 'End') {
        event.preventDefault()
        setRatio(MAX_RATIO)
      }
    },
    [clamp],
  )

  return (
    <div ref={containerRef} className="flex h-full min-h-0 flex-1">
      <div className="min-h-0 overflow-hidden" style={{ width: `${ratio}%` }}>
        {left}
      </div>
      {/* ARIA "window splitter" pattern: role="separator" with tabIndex/keydown is the documented
          accessible implementation of a resize handle, so the jsx-a11y non-interactive-element
          warnings below are false positives for this specific widget role. */}
      {/* eslint-disable jsx-a11y/no-noninteractive-element-interactions, jsx-a11y/no-noninteractive-tabindex */}
      <div
        role="separator"
        aria-orientation="vertical"
        aria-label="Resize editor and preview panels"
        aria-valuenow={Math.round(ratio)}
        aria-valuemin={MIN_RATIO}
        aria-valuemax={MAX_RATIO}
        tabIndex={0}
        onKeyDown={handleKeyDown}
        onPointerDown={() => {
          draggingRef.current = true
        }}
        className="group relative w-1.5 shrink-0 cursor-col-resize bg-neutral-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-500 dark:bg-neutral-800"
      >
        <span className="absolute inset-y-0 left-1/2 w-3 -translate-x-1/2 group-hover:bg-accent-400/30" />
      </div>
      {/* eslint-enable jsx-a11y/no-noninteractive-element-interactions, jsx-a11y/no-noninteractive-tabindex */}
      <div className="min-h-0 flex-1 overflow-hidden">{right}</div>
    </div>
  )
}
