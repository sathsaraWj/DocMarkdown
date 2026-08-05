/** Revokes an object URL if one was created; a safe no-op for null/undefined or an already-revoked URL. */
export function revokeObjectUrlSafely(url: string | null | undefined): void {
  if (!url) return
  try {
    URL.revokeObjectURL(url)
  } catch {
    // Already revoked, or never a real blob: URL — nothing left to clean up.
  }
}

/**
 * The single documented release point for merge-pdf in-memory resources:
 * revokes any outstanding object URL and returns the empty file list state
 * should reset to. Called when the user clears all files, starts a new
 * merge, or the page unmounts, so cleanup never depends on remembering to
 * inline it at each of those call sites.
 */
export function releaseMergeResources(objectUrl?: string | null): [] {
  revokeObjectUrlSafely(objectUrl)
  return []
}
