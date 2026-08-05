import { openSearchPanel } from '@codemirror/search'
import type { EditorView } from '@codemirror/view'

export function openEditorSearch(view: EditorView | null): void {
  if (view) openSearchPanel(view)
}
