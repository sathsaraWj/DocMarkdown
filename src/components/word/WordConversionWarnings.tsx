import { AlertTriangleIcon } from '@/components/common/icons'
import { WORD_FORMATTING_LIMITATIONS } from '@/types/word'
import type { WordParseMessage } from '@/types/word'

interface WordConversionWarningsProps {
  warnings: WordParseMessage[]
}

/**
 * A non-blocking panel: parser-reported warnings (if any) plus the standing
 * list of formatting features browser-based conversion can't fully
 * reproduce. Never hidden or collapsed away entirely — see the "Formatting
 * limitations" requirement — only the general list is behind <details> to
 * avoid always showing seventeen bullet points up front.
 */
export function WordConversionWarnings({ warnings }: WordConversionWarningsProps) {
  return (
    <div
      role="region"
      aria-label="Conversion warnings and formatting limitations"
      className="flex flex-col gap-3 border-b border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900 dark:border-amber-900/50 dark:bg-amber-950/30 dark:text-amber-200"
    >
      <div className="flex items-start gap-2">
        <AlertTriangleIcon className="mt-0.5 h-4 w-4 shrink-0" />
        <div className="flex flex-col gap-1">
          <p className="font-medium">
            This conversion is not pixel-perfect. Complex Word formatting is simplified.
          </p>
          {warnings.length > 0 && (
            <ul className="list-disc space-y-0.5 pl-5 text-xs">
              {warnings.map((warning, index) => (
                <li key={index}>{warning.message}</li>
              ))}
            </ul>
          )}
        </div>
      </div>

      <details className="text-xs">
        <summary className="cursor-pointer font-medium text-amber-800 hover:underline dark:text-amber-300">
          What might not convert exactly
        </summary>
        <ul className="mt-2 grid grid-cols-2 gap-x-4 gap-y-1 pl-4 sm:grid-cols-3">
          {WORD_FORMATTING_LIMITATIONS.map((item) => (
            <li key={item} className="list-disc">
              {item}
            </li>
          ))}
        </ul>
      </details>
    </div>
  )
}
