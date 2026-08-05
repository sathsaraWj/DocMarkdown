export function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = filename
  document.body.appendChild(anchor)
  anchor.click()
  document.body.removeChild(anchor)
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}

export function downloadText(content: string, filename: string, mimeType: string): void {
  downloadBlob(new Blob([content], { type: `${mimeType};charset=utf-8` }), filename)
}
