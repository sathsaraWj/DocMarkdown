import { Outlet, useLocation } from 'react-router-dom'

import { Footer } from './Footer'
import { Header } from './Header'

const WORKSPACE_ROUTES = new Set(['/', '/word-to-pdf', '/merge-pdf'])

export function SiteLayout() {
  const location = useLocation()
  const isWorkspace = WORKSPACE_ROUTES.has(location.pathname)

  return (
    <div
      className={`flex flex-col bg-neutral-50 dark:bg-neutral-950 ${isWorkspace ? 'h-svh overflow-hidden' : 'min-h-svh'}`}
    >
      <a
        href="#main-content"
        className="sr-only-focusable fixed left-4 top-4 z-50 rounded-md bg-accent-600 px-4 py-2 text-white"
      >
        Skip to main content
      </a>
      <Header />
      <main
        id="main-content"
        className={`flex flex-1 flex-col ${isWorkspace ? 'min-h-0 overflow-hidden' : ''}`}
      >
        <Outlet />
      </main>
      <Footer />
    </div>
  )
}
