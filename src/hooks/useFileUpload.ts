import { useCallback, useRef, useState } from 'react'
import type { ChangeEvent, DragEvent } from 'react'

import { readFileAsText } from '@/utils/fileUpload'

export function useFileUpload(onLoaded: (text: string) => void) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const dragCounter = useRef(0)

  const loadFile = useCallback(
    async (file: File) => {
      setError(null)
      const result = await readFileAsText(file)
      if (!result.ok) {
        setError(result.error ?? 'Could not read that file.')
        return
      }
      onLoaded(result.text ?? '')
    },
    [onLoaded],
  )

  const openFilePicker = useCallback(() => {
    inputRef.current?.click()
  }, [])

  const handleInputChange = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0]
      event.target.value = ''
      if (file) void loadFile(file)
    },
    [loadFile],
  )

  const handleDragEnter = useCallback((event: DragEvent<HTMLElement>) => {
    event.preventDefault()
    dragCounter.current += 1
    if (event.dataTransfer.types.includes('Files')) setIsDragging(true)
  }, [])

  const handleDragOver = useCallback((event: DragEvent<HTMLElement>) => {
    event.preventDefault()
  }, [])

  const handleDragLeave = useCallback((event: DragEvent<HTMLElement>) => {
    event.preventDefault()
    dragCounter.current = Math.max(0, dragCounter.current - 1)
    if (dragCounter.current === 0) setIsDragging(false)
  }, [])

  const handleDrop = useCallback(
    (event: DragEvent<HTMLElement>) => {
      event.preventDefault()
      dragCounter.current = 0
      setIsDragging(false)
      const file = event.dataTransfer.files[0]
      if (file) void loadFile(file)
    },
    [loadFile],
  )

  return {
    inputRef,
    isDragging,
    error,
    clearError: () => setError(null),
    openFilePicker,
    handleInputChange,
    dragHandlers: {
      onDragEnter: handleDragEnter,
      onDragOver: handleDragOver,
      onDragLeave: handleDragLeave,
      onDrop: handleDrop,
    },
  }
}
