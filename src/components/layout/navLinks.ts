export interface NavLinkItem {
  to: string
  label: string
}

export const NAV_LINKS: NavLinkItem[] = [
  { to: '/', label: 'Editor' },
  { to: '/word-to-pdf', label: 'Word to PDF' },
  { to: '/merge-pdf', label: 'Merge PDF' },
  { to: '/templates', label: 'Templates' },
  { to: '/markdown-guide', label: 'Markdown Guide' },
]
