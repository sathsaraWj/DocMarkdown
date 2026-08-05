import { HighlightStyle, syntaxHighlighting } from '@codemirror/language'
import { EditorView } from '@codemirror/view'
import { tags as t } from '@lezer/highlight'

/**
 * Structural styling (colors, spacing, gutter) for the CodeMirror editor.
 * Reads CSS custom properties defined in src/index.css (--cm-*) rather than
 * hardcoding colors, so it automatically follows the app's existing
 * light/dark toggle (the `.dark` class on <html>) without needing its own
 * separate dark-mode plumbing.
 */
export const editorTheme = EditorView.theme({
  '&': {
    height: '100%',
    color: 'var(--cm-fg)',
    backgroundColor: 'var(--cm-bg)',
    fontSize: '13px',
  },
  '.cm-scroller': {
    fontFamily: "'JetBrains Mono', ui-monospace, 'Cascadia Code', Menlo, Consolas, monospace",
    lineHeight: '1.6',
  },
  '.cm-content': {
    padding: '16px',
    caretColor: 'var(--cm-caret)',
  },
  '.cm-cursor, .cm-dropCursor': {
    borderLeftColor: 'var(--cm-caret)',
  },
  '&.cm-focused .cm-selectionBackground, .cm-selectionBackground, .cm-content ::selection': {
    backgroundColor: 'var(--cm-selection)',
  },
  '.cm-gutters': {
    backgroundColor: 'var(--cm-gutter-bg)',
    color: 'var(--cm-gutter-fg)',
    border: 'none',
    borderRight: '1px solid var(--cm-border)',
  },
  '.cm-activeLineGutter': {
    backgroundColor: 'var(--cm-active-line)',
    color: 'var(--cm-fg)',
  },
  '.cm-activeLine': {
    backgroundColor: 'var(--cm-active-line)',
  },
  '.cm-matchingBracket, .cm-nonmatchingBracket': {
    backgroundColor: 'var(--cm-selection)',
    outline: 'none',
  },
  '.cm-panels': {
    backgroundColor: 'var(--cm-gutter-bg)',
    color: 'var(--cm-fg)',
  },
  '.cm-panels.cm-panels-top': {
    borderBottom: '1px solid var(--cm-border)',
  },
  '.cm-searchMatch': {
    backgroundColor: 'var(--cm-selection)',
  },
  '.cm-searchMatch-selected': {
    backgroundColor: 'var(--cm-caret)',
    color: 'var(--cm-bg)',
  },
})

/** Markdown token colors — also driven by the --cm-* custom properties for the same dark-mode reason. */
const markdownHighlightStyle = HighlightStyle.define([
  { tag: t.heading1, color: 'var(--cm-heading)', fontWeight: '700', fontSize: '1.2em' },
  { tag: t.heading2, color: 'var(--cm-heading)', fontWeight: '700', fontSize: '1.12em' },
  { tag: t.heading3, color: 'var(--cm-heading)', fontWeight: '700', fontSize: '1.06em' },
  { tag: [t.heading4, t.heading5, t.heading6], color: 'var(--cm-heading)', fontWeight: '700' },
  { tag: t.strong, fontWeight: '700', color: 'var(--cm-emphasis)' },
  { tag: t.emphasis, fontStyle: 'italic', color: 'var(--cm-emphasis)' },
  { tag: t.strikethrough, textDecoration: 'line-through' },
  { tag: t.link, color: 'var(--cm-link)', textDecoration: 'underline' },
  { tag: t.url, color: 'var(--cm-link)' },
  { tag: t.monospace, color: 'var(--cm-code)' },
  { tag: t.quote, color: 'var(--cm-quote)', fontStyle: 'italic' },
  { tag: t.list, color: 'var(--cm-emphasis)' },
  { tag: t.contentSeparator, color: 'var(--cm-quote)' },
  { tag: t.meta, color: 'var(--cm-quote)' },
  { tag: t.processingInstruction, color: 'var(--cm-quote)' },
])

export const editorSyntaxHighlighting = syntaxHighlighting(markdownHighlightStyle)
