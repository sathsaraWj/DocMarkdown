export interface NavLinkItem {
  to: string
  label: string
}

export const NAV_LINKS: NavLinkItem[] = [
  { to: '/', label: 'Converter' },
  { to: '/templates', label: 'Templates' },
  { to: '/markdown-guide', label: 'Markdown Guide' },
]
