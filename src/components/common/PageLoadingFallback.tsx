export function PageLoadingFallback() {
  return (
    <div className="flex flex-1 items-center justify-center py-24" role="status" aria-live="polite">
      <span className="sr-only">Loading page…</span>
      <div
        className="h-8 w-8 animate-spin rounded-full border-2 border-neutral-300 border-t-accent-600 dark:border-neutral-700"
        aria-hidden="true"
      />
    </div>
  )
}
