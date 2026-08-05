import { useEffect, useMemo, useRef } from 'react'

/** Returns a stable debounced wrapper around `callback`; pending calls are flushed via the returned `flush`. */
export function useDebouncedCallback<Args extends unknown[]>(
  callback: (...args: Args) => void,
  delayMs: number,
): { call: (...args: Args) => void; flush: () => void; cancel: () => void } {
  const callbackRef = useRef(callback)
  callbackRef.current = callback

  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const pendingArgsRef = useRef<Args | null>(null)

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current)
    }
  }, [])

  return useMemo(
    () => ({
      call: (...args: Args) => {
        pendingArgsRef.current = args
        if (timeoutRef.current) clearTimeout(timeoutRef.current)
        timeoutRef.current = setTimeout(() => {
          timeoutRef.current = null
          const pending = pendingArgsRef.current
          pendingArgsRef.current = null
          if (pending) callbackRef.current(...pending)
        }, delayMs)
      },
      flush: () => {
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current)
          timeoutRef.current = null
        }
        const pending = pendingArgsRef.current
        pendingArgsRef.current = null
        if (pending) callbackRef.current(...pending)
      },
      cancel: () => {
        if (timeoutRef.current) clearTimeout(timeoutRef.current)
        timeoutRef.current = null
        pendingArgsRef.current = null
      },
    }),
    [delayMs],
  )
}
