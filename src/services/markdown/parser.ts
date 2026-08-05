import { Marked, Parser, TextRenderer, type Tokens } from 'marked'

import { slugify } from '@/utils/text'
import { highlightCode } from './highlight'

export interface TocItem {
  id: string
  text: string
  depth: number
}

interface RenderContext {
  toc: TocItem[]
  slugSeen: Map<string, number>
  numbering: number[]
  numberingEnabled: boolean
  tocMaxDepth: number
}

function createContext(numberingEnabled: boolean): RenderContext {
  return {
    toc: [],
    slugSeen: new Map(),
    numbering: [],
    numberingEnabled,
    tocMaxDepth: 4,
  }
}

let activeContext: RenderContext = createContext(false)
const plainTextRenderer = new TextRenderer()
const inlineParser = new Parser()

function nextNumbering(numbering: number[], depth: number): number[] {
  const next = numbering.slice(0, depth)
  while (next.length < depth) next.push(0)
  next[depth - 1] = (next[depth - 1] ?? 0) + 1
  return next
}

const markedInstance = new Marked({
  gfm: true,
  breaks: false,
  pedantic: false,
})

markedInstance.use({
  renderer: {
    heading(this: { parser: Parser }, { tokens, depth }: Tokens.Heading) {
      const html = this.parser.parseInline(tokens)
      const plain = inlineParser.parseInline(tokens, plainTextRenderer)
      const id = slugify(plain, activeContext.slugSeen)

      let prefix = ''
      if (depth === 1) {
        activeContext.numbering = []
      } else if (activeContext.numberingEnabled && depth >= 2 && depth <= 6) {
        activeContext.numbering = nextNumbering(activeContext.numbering, depth - 1)
        prefix = `${activeContext.numbering.join('.')}. `
      }

      if (depth <= activeContext.tocMaxDepth) {
        activeContext.toc.push({ id, text: plain, depth })
      }

      const prefixMarkup = prefix
        ? `<span class="heading-number" aria-hidden="true">${prefix}</span>`
        : ''
      return `<h${depth} id="${id}">${prefixMarkup}${html}</h${depth}>\n`
    },
    code({ text, lang }: Tokens.Code) {
      const { html, language } = highlightCode(text, lang)
      const languageClass = language ? ` language-${language}` : ''
      const langLabel = lang ? `<div class="code-block-lang" aria-hidden="true">${lang}</div>` : ''
      return `<div class="code-block">${langLabel}<pre><code class="hljs${languageClass}">${html}</code></pre></div>\n`
    },
    listitem(this: { parser: Parser }, item: Tokens.ListItem) {
      const classAttr = item.task ? ' class="task-list-item"' : ''
      return `<li${classAttr}>${this.parser.parse(item.tokens)}</li>\n`
    },
  },
})

export interface MarkdownRenderOptions {
  headingNumbering?: boolean
}

export interface MarkdownRenderResult {
  html: string
  toc: TocItem[]
}

/**
 * Runs the configured Marked instance. Callers are responsible for running the
 * result through {@link sanitizeHtml} before inserting it into the DOM.
 */
export function renderMarkdownToHtml(
  source: string,
  options: MarkdownRenderOptions = {},
): MarkdownRenderResult {
  activeContext = createContext(options.headingNumbering ?? false)
  let html: string
  try {
    html = markedInstance.parse(source, { async: false }) as string
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown parsing error'
    html = `<p class="markdown-error">Unable to render Markdown: ${message}</p>`
  }
  return { html, toc: activeContext.toc }
}
