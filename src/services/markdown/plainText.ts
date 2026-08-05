import { Lexer, Parser, TextRenderer, type Token, type Tokens } from 'marked'

const textRenderer = new TextRenderer()
const inlineParser = new Parser()

function inlineToText(tokens: Token[] | undefined): string {
  if (!tokens || tokens.length === 0) return ''
  return inlineParser.parseInline(tokens, textRenderer)
}

function stripLeadingCheckbox(tokens: Token[]): Token[] {
  if (tokens.length === 0) return tokens
  const [first, ...rest] = tokens
  if (first?.type === 'checkbox') return rest
  if (
    first &&
    'tokens' in first &&
    Array.isArray(first.tokens) &&
    first.tokens[0]?.type === 'checkbox'
  ) {
    return [{ ...first, tokens: first.tokens.slice(1) } as Token, ...rest]
  }
  return tokens
}

function listItemToText(item: Tokens.ListItem, depth: number): string {
  const tokens = stripLeadingCheckbox(item.tokens)
  return blockToText(tokens, depth).trimEnd()
}

function blockToText(tokens: Token[], depth = 0): string {
  const lines: string[] = []

  for (const token of tokens) {
    switch (token.type) {
      case 'heading': {
        lines.push(inlineToText(token.tokens), '')
        break
      }
      case 'paragraph': {
        lines.push(inlineToText(token.tokens), '')
        break
      }
      case 'text': {
        if ('tokens' in token && token.tokens) lines.push(inlineToText(token.tokens))
        else lines.push(token.raw)
        break
      }
      case 'blockquote': {
        const inner = blockToText(token.tokens ?? [], depth).trimEnd()
        for (const line of inner.split('\n')) lines.push(line ? `> ${line}` : '>')
        lines.push('')
        break
      }
      case 'code': {
        lines.push(token.text, '')
        break
      }
      case 'list': {
        const start = token.start === '' || token.start === undefined ? 1 : Number(token.start)
        token.items.forEach((item: Tokens.ListItem, index: number) => {
          const marker = token.ordered ? `${start + index}.` : '-'
          const checkboxPrefix = item.task === true ? `[${item.checked === true ? 'x' : ' '}] ` : ''
          const itemText = listItemToText(item, depth + 1)
          const [firstLine = '', ...rest] = itemText.split('\n')
          const indent = '  '.repeat(depth)
          lines.push(`${indent}${marker} ${checkboxPrefix}${firstLine}`)
          for (const line of rest) lines.push(line ? `${indent}  ${line}` : '')
        })
        lines.push('')
        break
      }
      case 'table': {
        const header = token.header.map((cell: Tokens.TableCell) => inlineToText(cell.tokens))
        lines.push(header.join(' | '), header.map(() => '---').join(' | '))
        for (const row of token.rows) {
          lines.push(row.map((cell: Tokens.TableCell) => inlineToText(cell.tokens)).join(' | '))
        }
        lines.push('')
        break
      }
      case 'hr': {
        lines.push('---', '')
        break
      }
      case 'space':
      case 'html':
      case 'def':
        break
      default: {
        if ('tokens' in token && Array.isArray(token.tokens)) {
          lines.push(inlineToText(token.tokens))
        } else if ('text' in token && typeof token.text === 'string') {
          lines.push(token.text)
        }
      }
    }
  }

  return lines.join('\n')
}

/**
 * Converts markdown source into readable plain text: headings and paragraphs
 * as text, lists as dashed/numbered lines, tables as pipe-delimited rows.
 */
export function markdownToPlainText(source: string): string {
  if (!source.trim()) return ''
  const tokens = Lexer.lex(source, { gfm: true, breaks: false })
  const text = blockToText(tokens)
  return `${text.replace(/\n{3,}/g, '\n\n').trim()}\n`
}
