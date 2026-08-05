import { closeBrackets, closeBracketsKeymap } from '@codemirror/autocomplete'
import {
  defaultKeymap,
  history,
  historyKeymap,
  indentWithTab,
  redo as cmRedo,
  undo as cmUndo,
} from '@codemirror/commands'
import { markdown, markdownLanguage } from '@codemirror/lang-markdown'
import { bracketMatching, foldGutter, indentOnInput } from '@codemirror/language'
import { highlightSelectionMatches, search, searchKeymap } from '@codemirror/search'
import { Compartment, EditorState } from '@codemirror/state'
import type { KeyBinding } from '@codemirror/view'
import {
  drawSelection,
  dropCursor,
  EditorView,
  highlightActiveLine,
  highlightActiveLineGutter,
  keymap,
  lineNumbers,
  rectangularSelection,
} from '@codemirror/view'
import { forwardRef, useEffect, useImperativeHandle, useRef } from 'react'

import { applyLinePrefix, insertLink, wrapSelection } from '@/services/editor/markdownCommands'
import { editorSyntaxHighlighting, editorTheme } from '@/styles/codemirrorTheme'

export interface EditorCursorPosition {
  line: number
  column: number
}

export interface MarkdownEditorHandle {
  focus: () => void
  getView: () => EditorView | null
  undo: () => void
  redo: () => void
}

/**
 * Text-formatting shortcuts scoped to the editor itself (as opposed to the
 * page-level shortcuts for save/preview/export, which live outside
 * CodeMirror since they affect surrounding UI, not the document text).
 */
const formattingKeymap: KeyBinding[] = [
  { key: 'Mod-b', run: (view) => wrapSelection(view, '**', '**', 'bold text') },
  { key: 'Mod-i', run: (view) => wrapSelection(view, '*', '*', 'italic text') },
  { key: 'Mod-k', run: (view) => insertLink(view) },
  { key: 'Mod-Shift-7', run: (view) => applyLinePrefix(view, (index) => `${index + 1}. `) },
  { key: 'Mod-Shift-8', run: (view) => applyLinePrefix(view, () => '- ') },
]

interface MarkdownEditorProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  lineWrapping: boolean
  spellCheck: boolean
  onCursorChange?: (position: EditorCursorPosition) => void
  /** A short id/counter — bump it to force-refocus the editor (e.g. entering fullscreen). */
  autoFocusKey?: number
}

const lineWrapCompartment = new Compartment()
const spellcheckCompartment = new Compartment()

function cursorPosition(state: EditorState): EditorCursorPosition {
  const pos = state.selection.main.head
  const line = state.doc.lineAt(pos)
  return { line: line.number, column: pos - line.from + 1 }
}

/**
 * A CodeMirror 6 based Markdown source editor. CodeMirror manages its own
 * DOM imperatively, so this wraps a single EditorView instance in a ref
 * rather than rendering CodeMirror declaratively from `value` on every
 * render — the `value`/`onChange` props are synced into/out of that
 * instance instead of driving React's virtual DOM directly.
 */
export const MarkdownEditor = forwardRef<MarkdownEditorHandle, MarkdownEditorProps>(
  function MarkdownEditor(
    { value, onChange, placeholder, lineWrapping, spellCheck, onCursorChange, autoFocusKey },
    ref,
  ) {
    const hostRef = useRef<HTMLDivElement>(null)
    const viewRef = useRef<EditorView | null>(null)
    const onChangeRef = useRef(onChange)
    const onCursorChangeRef = useRef(onCursorChange)
    onChangeRef.current = onChange
    onCursorChangeRef.current = onCursorChange

    useImperativeHandle(
      ref,
      () => ({
        focus: () => viewRef.current?.focus(),
        getView: () => viewRef.current,
        undo: () => {
          if (viewRef.current) cmUndo(viewRef.current)
        },
        redo: () => {
          if (viewRef.current) cmRedo(viewRef.current)
        },
      }),
      [],
    )

    // Create the view once. `value`/callbacks are read from refs inside the
    // update listener so this effect never needs to tear down and recreate
    // the editor (which would drop undo history and cursor position).
    useEffect(() => {
      const host = hostRef.current
      if (!host) return

      const state = EditorState.create({
        doc: value,
        extensions: [
          lineNumbers(),
          foldGutter(),
          highlightActiveLineGutter(),
          highlightActiveLine(),
          history(),
          drawSelection(),
          dropCursor(),
          rectangularSelection(),
          indentOnInput(),
          bracketMatching(),
          closeBrackets(),
          search({ top: true }),
          highlightSelectionMatches(),
          markdown({ base: markdownLanguage }),
          editorSyntaxHighlighting,
          editorTheme,
          lineWrapCompartment.of(lineWrapping ? EditorView.lineWrapping : []),
          spellcheckCompartment.of(
            EditorView.contentAttributes.of({ spellcheck: spellCheck ? 'true' : 'false' }),
          ),
          EditorView.contentAttributes.of({
            'aria-label': 'Markdown source',
            role: 'textbox',
            'aria-multiline': 'true',
          }),
          keymap.of([
            ...formattingKeymap,
            indentWithTab,
            ...closeBracketsKeymap,
            ...defaultKeymap,
            ...searchKeymap,
            ...historyKeymap,
          ]),
          EditorView.updateListener.of((update) => {
            if (update.docChanged) {
              onChangeRef.current(update.state.doc.toString())
            }
            if (update.docChanged || update.selectionSet) {
              onCursorChangeRef.current?.(cursorPosition(update.state))
            }
          }),
          EditorView.theme({
            '.cm-content[data-placeholder]::before': {
              content: 'attr(data-placeholder)',
            },
          }),
        ],
      })

      const view = new EditorView({ state, parent: host })
      viewRef.current = view
      if (placeholder && value === '') {
        view.contentDOM.setAttribute('data-placeholder', placeholder)
      }

      return () => {
        view.destroy()
        viewRef.current = null
      }
      // Intentionally created once — see comment above. `placeholder` on its
      // own genuinely only matters at creation time (an empty initial doc).
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    // Keep the view's content in sync with external `value` changes (file
    // upload, "Beautify", undo/redo from outside the editor, draft restore)
    // without fighting the user's own typing or losing cursor position.
    useEffect(() => {
      const view = viewRef.current
      if (!view) return
      const current = view.state.doc.toString()
      if (current === value) return
      view.dispatch({
        changes: { from: 0, to: current.length, insert: value },
      })
    }, [value])

    useEffect(() => {
      const view = viewRef.current
      if (!view) return
      view.dispatch({
        effects: lineWrapCompartment.reconfigure(lineWrapping ? EditorView.lineWrapping : []),
      })
    }, [lineWrapping])

    useEffect(() => {
      const view = viewRef.current
      if (!view) return
      view.dispatch({
        effects: spellcheckCompartment.reconfigure(
          EditorView.contentAttributes.of({ spellcheck: spellCheck ? 'true' : 'false' }),
        ),
      })
    }, [spellCheck])

    useEffect(() => {
      if (autoFocusKey !== undefined) viewRef.current?.focus()
    }, [autoFocusKey])

    return (
      <div
        ref={hostRef}
        className="h-full min-h-0 flex-1 overflow-hidden bg-white dark:bg-neutral-950 [&_.cm-editor]:h-full [&_.cm-scroller]:overflow-auto"
      />
    )
  },
)
