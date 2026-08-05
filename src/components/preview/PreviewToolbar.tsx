interface PreviewToolbarProps {
  zoomPercent: number
  fitToWidthActive: boolean
  onZoomIn: () => void
  onZoomOut: () => void
  onResetZoom: () => void
  onFitToWidth: () => void
}

export function PreviewToolbar({
  zoomPercent,
  fitToWidthActive,
  onZoomIn,
  onZoomOut,
  onResetZoom,
  onFitToWidth,
}: PreviewToolbarProps) {
  return (
    <div className="flex items-center justify-between gap-2 border-b border-neutral-200 px-3 py-2 dark:border-neutral-800">
      <h2 className="text-sm font-semibold text-neutral-700 dark:text-neutral-200">Preview</h2>
      <div className="flex items-center gap-1">
        <button
          type="button"
          onClick={onZoomOut}
          aria-label="Zoom out"
          className="flex h-7 w-7 items-center justify-center rounded-md text-neutral-500 hover:bg-neutral-100 dark:text-neutral-400 dark:hover:bg-neutral-800"
        >
          −
        </button>
        <button
          type="button"
          onClick={onResetZoom}
          className="min-w-12 rounded-md px-1.5 py-1 text-center text-xs font-medium text-neutral-600 hover:bg-neutral-100 dark:text-neutral-300 dark:hover:bg-neutral-800"
          title="Reset zoom to 100%"
        >
          {Math.round(zoomPercent)}%
        </button>
        <button
          type="button"
          onClick={onZoomIn}
          aria-label="Zoom in"
          className="flex h-7 w-7 items-center justify-center rounded-md text-neutral-500 hover:bg-neutral-100 dark:text-neutral-400 dark:hover:bg-neutral-800"
        >
          +
        </button>
        <button
          type="button"
          onClick={onFitToWidth}
          aria-pressed={fitToWidthActive}
          className={`ml-1 rounded-md px-2 py-1 text-xs font-medium ${
            fitToWidthActive
              ? 'bg-accent-100 text-accent-700 dark:bg-accent-950/50 dark:text-accent-300'
              : 'text-neutral-600 hover:bg-neutral-100 dark:text-neutral-300 dark:hover:bg-neutral-800'
          }`}
        >
          Fit width
        </button>
      </div>
    </div>
  )
}
