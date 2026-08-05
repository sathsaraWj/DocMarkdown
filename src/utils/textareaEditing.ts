/**
 * Programmatic textarea editing that preserves the browser's native undo
 * stack (via document.execCommand where still supported) and always
 * dispatches a real 'input' event so a controlled React value stays in sync.
 */

function setNativeValue(element: HTMLTextAreaElement, value: string): void {
  const setter = Object.getOwnPropertyDescriptor(window.HTMLTextAreaElement.prototype, 'value')?.set
  setter?.call(element, value)
  element.dispatchEvent(new Event('input', { bubbles: true }))
}

function supportsExecCommand(): boolean {
  return typeof document.execCommand === 'function'
}

/** Replaces `[start, end)` in the textarea with `text`, leaving the caret after the inserted text. */
export function replaceRange(
  textarea: HTMLTextAreaElement,
  start: number,
  end: number,
  text: string,
): void {
  textarea.focus()
  textarea.setSelectionRange(start, end)

  if (supportsExecCommand()) {
    try {
      if (document.execCommand('insertText', false, text)) return
    } catch {
      // fall through to manual replace
    }
  }

  const next = textarea.value.slice(0, start) + text + textarea.value.slice(end)
  setNativeValue(textarea, next)
  textarea.setSelectionRange(start + text.length, start + text.length)
}

export function insertAtCursor(textarea: HTMLTextAreaElement, text: string): void {
  replaceRange(textarea, textarea.selectionStart, textarea.selectionEnd, text)
}
