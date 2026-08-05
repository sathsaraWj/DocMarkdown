import { useCallback, useRef, useState } from 'react'
import type { ChangeEvent, DragEvent } from 'react'

/**
 * Drag-and-drop + click-to-browse wiring for the Word upload zone. Mirrors
 * useFileUpload.ts's drag-tracking pattern, but hands back the raw File
 * (mammoth needs an ArrayBuffer, not text) instead of reading it itself.
 */
export function useWordFileDrop(onFile: (file: File) => void) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [isDragging, setIsDragging] = useState(false)
  const dragCounter = useRef(0)

  const openFilePicker = useCallback(() => {
    inputRef.current?.click()
  }, [])

  const handleInputChange = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0]
      event.target.value = ''
      if (file) onFile(file)
    },
    [onFile],
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
      if (file) onFile(file)
    },
    [onFile],
  )

  return {
    inputRef,
    isDragging,
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
