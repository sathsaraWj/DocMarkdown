import { Link } from 'react-router-dom'

import { usePageMeta } from '@/hooks/usePageMeta'

export default function NotFoundPage() {
  usePageMeta({
    title: 'Page Not Found',
    description: 'The page you were looking for could not be found.',
    path: '/404',
  })

  return (
    <div className="mx-auto flex w-full max-w-lg flex-1 flex-col items-center justify-center px-4 py-16 text-center">
      <p className="text-sm font-semibold text-accent-600 dark:text-accent-400">404</p>
      <h1 className="mt-2 text-2xl font-bold text-neutral-900 dark:text-white sm:text-3xl">
        Page not found
      </h1>
      <p className="mt-3 text-neutral-600 dark:text-neutral-300">
        The page you're looking for doesn't exist or may have moved.
      </p>
      <Link
        to="/"
        className="mt-6 rounded-md bg-accent-600 px-4 py-2 text-sm font-semibold text-white hover:bg-accent-700"
      >
        Back to the editor
      </Link>
    </div>
  )
}
