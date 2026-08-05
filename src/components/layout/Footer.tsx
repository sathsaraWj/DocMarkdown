import { Link } from 'react-router-dom'

const FOOTER_LINKS = [
  { to: '/about', label: 'About' },
  { to: '/privacy', label: 'Privacy' },
  { to: '/terms', label: 'Terms' },
  { to: '/contact', label: 'Contact' },
]

export function Footer() {
  const year = new Date().getFullYear()

  return (
    <footer className="border-t border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-950">
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-4 py-8 text-sm text-neutral-500 sm:flex-row sm:px-6 lg:px-8 dark:text-neutral-400">
        <p>&copy; {year} DocMarkdown. Your documents never leave your device.</p>
        <nav className="flex flex-wrap items-center gap-x-6 gap-y-2" aria-label="Footer">
          {FOOTER_LINKS.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className="hover:text-neutral-900 dark:hover:text-white"
            >
              {link.label}
            </Link>
          ))}
        </nav>
      </div>
    </footer>
  )
}
