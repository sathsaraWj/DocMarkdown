export interface PlaceholderContext {
  page: number
  pages: number
  title: string
  date: string
}

const TOKEN_RE = /\{(page|pages|title|date)\}/g

export function resolvePlaceholders(template: string, ctx: PlaceholderContext): string {
  return template.replace(TOKEN_RE, (_match, token: keyof PlaceholderContext) => String(ctx[token]))
}

export function buildAutoText(
  ctx: PlaceholderContext,
  showTitle: boolean,
  showDate: boolean,
  showPageNumber: boolean,
): string {
  const parts: string[] = []
  if (showTitle) parts.push(ctx.title)
  if (showDate) parts.push(ctx.date)
  if (showPageNumber) parts.push(`Page ${String(ctx.page)} of ${String(ctx.pages)}`)
  return parts.join(' • ')
}
