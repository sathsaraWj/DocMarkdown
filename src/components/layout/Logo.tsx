import { Link } from 'react-router-dom'

export function Logo() {
  return (
    <Link
      to="/"
      className="flex items-center gap-2 rounded-md text-lg font-bold tracking-tight text-neutral-900 dark:text-white"
    >
      <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent-600 text-white">
        <svg viewBox="0 0 24 24" className="h-4.5 w-4.5" fill="none" aria-hidden="true">
          <path
            d="M5 4h9l5 5v11a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V5a1 1 0 0 1 1-1Z"
            stroke="currentColor"
            strokeWidth={1.8}
            strokeLinejoin="round"
          />
          <path
            d="M9 13l2 2 4-4"
            stroke="currentColor"
            strokeWidth={1.8}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </span>
      DocMarkdown
    </Link>
  )
}
