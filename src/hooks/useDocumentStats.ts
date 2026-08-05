import { useMemo } from 'react'

import { countWords, estimateReadingTimeMinutes } from '@/utils/text'

export interface DocumentStats {
  words: number
  characters: number
  readingTimeMinutes: number
}

export function useDocumentStats(markdown: string): DocumentStats {
  return useMemo(
    () => ({
      words: countWords(markdown),
      characters: markdown.length,
      readingTimeMinutes: estimateReadingTimeMinutes(markdown),
    }),
    [markdown],
  )
}
