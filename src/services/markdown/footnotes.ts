export interface FootnoteDefinition {
  label: string
  text: string
}

export interface FootnoteExtractionResult {
  /** Markdown with definitions removed and references replaced by anchor markup. */
  content: string
  definitions: FootnoteDefinition[]
}

const DEFINITION_LINE = /^\[\^([^\]\s]+)\]:[ \t]?(.*)$/gm
const REFERENCE = /\[\^([^\]\s]+)\]/g

function escapeAttribute(value: string): string {
  return value.replace(/[^a-zA-Z0-9_-]/g, (char) => `_${char.charCodeAt(0)}_`)
}

/**
 * Lightweight footnote support: `[^label]` references and `[^label]: text` definitions.
 * Definitions must be stripped before marked's lexer runs, since marked treats
 * `[label]: ...` as a link reference definition and would otherwise swallow them.
 */
export function extractFootnotes(markdown: string): FootnoteExtractionResult {
  const definitions: FootnoteDefinition[] = []
  const withoutDefinitions = markdown.replace(
    DEFINITION_LINE,
    (_match, label: string, text: string) => {
      definitions.push({ label, text: text.trim() })
      return ''
    },
  )

  if (definitions.length === 0) {
    return { content: markdown, definitions: [] }
  }

  const definitionByLabel = new Map(definitions.map((d) => [d.label, d] as const))
  const orderedDefinitions: FootnoteDefinition[] = []
  const seen = new Map<string, number>()

  const content = withoutDefinitions.replace(REFERENCE, (match, label: string) => {
    const def = definitionByLabel.get(label)
    if (!def) return match
    let index = seen.get(label)
    if (index === undefined) {
      orderedDefinitions.push(def)
      index = orderedDefinitions.length
      seen.set(label, index)
    }
    const safe = escapeAttribute(label)
    return `<sup class="footnote-ref"><a href="#fn-${safe}" id="fnref-${safe}" aria-describedby="footnotes-label">${String(index)}</a></sup>`
  })

  return { content, definitions: orderedDefinitions }
}

export function renderFootnotesSection(
  definitions: FootnoteDefinition[],
  renderInline: (text: string) => string,
): string {
  if (definitions.length === 0) return ''

  const items = definitions
    .map((def) => {
      const safe = escapeAttribute(def.label)
      return `<li id="fn-${safe}">${renderInline(def.text)} <a href="#fnref-${safe}" class="footnote-backref" aria-label="Back to reference">↩</a></li>`
    })
    .join('\n')

  return `\n<section class="footnotes" role="doc-endnotes">\n<hr>\n<h2 id="footnotes-label" class="footnotes-title">Footnotes</h2>\n<ol>\n${items}\n</ol>\n</section>\n`
}
