export interface NavLinkItem {
  to: string
  label: string
}

export const NAV_LINKS: NavLinkItem[] = [
  { to: '/', label: 'Converter' },
  { to: '/word-to-pdf', label: 'Word to PDF' },
  { to: '/templates', label: 'Templates' },
  { to: '/markdown-guide', label: 'Markdown Guide' },
]
