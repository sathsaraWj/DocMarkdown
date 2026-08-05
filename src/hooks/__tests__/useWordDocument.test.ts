import { readFileSync } from 'node:fs'
import path from 'node:path'
import { act, renderHook, waitFor } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { useWordDocument } from '@/hooks/useWordDocument'

const FIXTURES_DIR = path.resolve(__dirname, '../../../e2e/fixtures')

function loadFixture(name: string): File {
  const bytes = readFileSync(path.join(FIXTURES_DIR, name))
  return new File([bytes], name)
}

describe('useWordDocument', () => {
  it('starts idle with no file', () => {
    const { result } = renderHook(() => useWordDocument())
    expect(result.current.status).toBe('idle')
    expect(result.current.file).toBeNull()
    expect(result.current.parseResult).toBeNull()
  })

  it('rejects an invalid file without ever entering the parsing state', async () => {
    const { result } = renderHook(() => useWordDocument())
    await act(async () => {
      await result.current.loadFile(new File(['hi'], 'notes.txt'))
    })
    expect(result.current.status).toBe('invalid')
    expect(result.current.errorMessage).toContain('.docx')
    expect(result.current.file).toBeNull()
  })

  it('successfully parses a valid .docx and populates the title from the first heading', async () => {
    const { result } = renderHook(() => useWordDocument())
    await act(async () => {
      await result.current.loadFile(loadFixture('sample.docx'))
    })

    await waitFor(() => {
      expect(['ready', 'ready-with-warnings']).toContain(result.current.status)
    })
    expect(result.current.parseResult?.html).toContain('Sample Report')
    expect(result.current.settings.document.metadata.title).toBe('Sample Report')
  })

  it('applies the source document\'s detected page size and margins automatically', async () => {
    const { result } = renderHook(() => useWordDocument())
    await act(async () => {
      await result.current.loadFile(loadFixture('sample.docx'))
    })
    await waitFor(() => {
      expect(['ready', 'ready-with-warnings']).toContain(result.current.status)
    })

    expect(result.current.settings.document.page).toEqual({
      size: 'Letter',
      orientation: 'portrait',
      marginPreset: 'custom',
      margins: { top: 25.4, right: 25.4, bottom: 25.4, left: 25.4 },
    })
  })

  it('clearDocument resets everything back to idle', async () => {
    const { result } = renderHook(() => useWordDocument())
    await act(async () => {
      await result.current.loadFile(loadFixture('sample.docx'))
    })
    await waitFor(() => {
      expect(['ready', 'ready-with-warnings']).toContain(result.current.status)
    })

    act(() => {
      result.current.clearDocument()
    })

    expect(result.current.status).toBe('idle')
    expect(result.current.file).toBeNull()
    expect(result.current.parseResult).toBeNull()
    expect(result.current.errorMessage).toBeNull()
  })

  it('reports a friendly error status for a corrupt file that passes the extension check', async () => {
    const { result } = renderHook(() => useWordDocument())
    await act(async () => {
      await result.current.loadFile(loadFixture('corrupt.docx'))
    })
    expect(result.current.status).toBe('invalid')
    expect(result.current.errorMessage).toMatch(/could not be read/i)
  })
})
