import { useEffect, useRef } from 'react'
import { NavLink } from 'react-router-dom'

import { CloseIcon, GitHubIcon } from '@/components/common/icons'
import { GITHUB_URL } from '@/utils/env'
import { ThemeSwitcher } from './ThemeSwitcher'
import { NAV_LINKS } from './navLinks'

interface MobileNavProps {
  open: boolean
  onClose: () => void
}

export function MobileNav({ open, onClose }: MobileNavProps) {
  const dialogRef = useRef<HTMLDialogElement>(null)

  useEffect(() => {
    const dialog = dialogRef.current
    if (!dialog) return
    if (open && !dialog.open) dialog.showModal()
    if (!open && dialog.open) dialog.close()
  }, [open])

  return (
    <dialog
      ref={dialogRef}
      onClose={onClose}
      onCancel={onClose}
      aria-label="Mobile navigation"
      className="m-0 h-full max-h-none w-full max-w-none bg-transparent p-0 backdrop:bg-neutral-900/50 md:hidden"
    >
      <div className="ml-auto flex h-full w-full max-w-xs flex-col gap-6 bg-white p-6 shadow-xl dark:bg-neutral-900">
        <div className="flex items-center justify-between">
          <span className="text-sm font-semibold text-neutral-500 dark:text-neutral-400">Menu</span>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close menu"
            className="flex h-9 w-9 items-center justify-center rounded-full text-neutral-500 hover:bg-neutral-100 dark:text-neutral-400 dark:hover:bg-neutral-800"
          >
            <CloseIcon className="h-5 w-5" />
          </button>
        </div>
        <nav className="flex flex-col gap-1" aria-label="Primary">
          {NAV_LINKS.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              onClick={onClose}
              className={({ isActive }) =>
                `rounded-lg px-3 py-2.5 text-base font-medium ${
                  isActive
                    ? 'bg-accent-50 text-accent-700 dark:bg-accent-950/40 dark:text-accent-300'
                    : 'text-neutral-700 hover:bg-neutral-100 dark:text-neutral-200 dark:hover:bg-neutral-800'
                }`
              }
            >
              {link.label}
            </NavLink>
          ))}
        </nav>
        <a
          href={GITHUB_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 rounded-lg px-3 py-2.5 text-base font-medium text-neutral-700 hover:bg-neutral-100 dark:text-neutral-200 dark:hover:bg-neutral-800"
        >
          <GitHubIcon className="h-5 w-5" /> GitHub
        </a>
        <div className="mt-auto flex items-center justify-between border-t border-neutral-200 pt-4 dark:border-neutral-800">
          <span className="text-sm text-neutral-500 dark:text-neutral-400">Theme</span>
          <ThemeSwitcher />
        </div>
      </div>
    </dialog>
  )
}
