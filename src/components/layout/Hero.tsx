import { Link } from 'react-router-dom'

import { FileTextIcon, LockIcon, UploadIcon } from '@/components/common/icons'

interface HeroProps {
  onStartWriting: () => void
  onUploadClick: () => void
}

export function Hero({ onStartWriting, onUploadClick }: HeroProps) {
  return (
    <section className="border-b border-neutral-200 bg-white px-4 py-5 dark:border-neutral-800 dark:bg-neutral-950 sm:px-6">
      <div className="mx-auto flex max-w-7xl flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-neutral-900 dark:text-white sm:text-2xl">
            Convert Markdown into clean, professional PDFs
          </h1>
          <p className="mt-1 max-w-2xl text-sm text-neutral-600 dark:text-neutral-300">
            Write or paste Markdown and export polished PDF, HTML, or text documents — directly in
            your browser. Your documents never leave your device.
          </p>
          <p className="mt-2 text-sm text-neutral-500 dark:text-neutral-400">
            Have a Word document instead?{' '}
            <Link
              to="/word-to-pdf"
              className="inline-flex items-center gap-1 font-medium text-accent-600 underline underline-offset-2 hover:text-accent-700 dark:text-accent-400"
            >
              <FileTextIcon className="h-3.5 w-3.5" />
              Convert Word to PDF
            </Link>
          </p>
        </div>
        <div className="flex shrink-0 flex-wrap items-center gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-medium text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300">
            <LockIcon className="h-3.5 w-3.5" />
            Processed locally — nothing is uploaded
          </span>
          <button
            type="button"
            onClick={onStartWriting}
            className="rounded-md bg-accent-600 px-3.5 py-2 text-sm font-semibold text-white hover:bg-accent-700"
          >
            Start writing
          </button>
          <button
            type="button"
            onClick={onUploadClick}
            className="flex items-center gap-1.5 rounded-md border border-neutral-300 px-3.5 py-2 text-sm font-semibold text-neutral-700 hover:bg-neutral-50 dark:border-neutral-700 dark:text-neutral-200 dark:hover:bg-neutral-800"
          >
            <UploadIcon className="h-4 w-4" />
            Upload Markdown
          </button>
        </div>
      </div>
    </section>
  )
}
