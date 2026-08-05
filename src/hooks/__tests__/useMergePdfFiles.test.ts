import { readFileSync } from 'node:fs'
import path from 'node:path'
import { act, renderHook, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it } from 'vitest'

import { useMergePdfFiles } from '@/hooks/useMergePdfFiles'

const FIXTURES_DIR = path.resolve(__dirname, '../../../e2e/fixtures')

function loadFixture(name: string, rename?: string): File {
  const bytes = readFileSync(path.join(FIXTURES_DIR, name))
  return new File([bytes], rename ?? name, { type: 'application/pdf' })
}

describe('useMergePdfFiles', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('starts with no files and idle merge status', () => {
    const { result } = renderHook(() => useMergePdfFiles())
    expect(result.current.entries).toEqual([])
    expect(result.current.mergeStatus).toBe('idle')
    expect(result.current.isReadyToMerge).toBe(false)
  })

  it('adds valid PDFs and inspects them to a ready state with page counts', async () => {
    const { result } = renderHook(() => useMergePdfFiles())
    act(() => {
      result.current.addFiles([
        loadFixture('pdf-single-page.pdf'),
        loadFixture('pdf-multi-page.pdf'),
      ])
    })
    expect(result.current.entries).toHaveLength(2)

    await waitFor(() => {
      expect(result.current.entries.every((e) => e.status === 'ready')).toBe(true)
    })
    expect(result.current.entries[0]?.pageCount).toBe(1)
    expect(result.current.entries[1]?.pageCount).toBe(5)
    expect(result.current.isReadyToMerge).toBe(true)
  })

  it('rejects a non-PDF file while keeping valid files from the same batch', () => {
    const { result } = renderHook(() => useMergePdfFiles())
    act(() => {
      result.current.addFiles([loadFixture('pdf-single-page.pdf'), new File(['x'], 'notes.txt')])
    })
    expect(result.current.entries).toHaveLength(1)
    expect(result.current.rejected).toEqual([
      { name: 'notes.txt', reason: 'Only PDF files are supported.' },
    ])
  })

  it('treats duplicate filenames as distinct entries with unique ids', () => {
    const { result } = renderHook(() => useMergePdfFiles())
    act(() => {
      result.current.addFiles([
        loadFixture('pdf-single-page.pdf', 'dup.pdf'),
        loadFixture('pdf-multi-page.pdf', 'dup.pdf'),
      ])
    })
    expect(result.current.entries).toHaveLength(2)
    const ids = result.current.entries.map((e) => e.id)
    expect(new Set(ids).size).toBe(2)
  })

  it('reports a corrupt PDF as invalid without blocking the rest of the list', async () => {
    const { result } = renderHook(() => useMergePdfFiles())
    act(() => {
      result.current.addFiles([loadFixture('pdf-corrupt.pdf'), loadFixture('pdf-single-page.pdf')])
    })
    await waitFor(() => {
      expect(result.current.entries.every((e) => e.status !== 'validating')).toBe(true)
    })
    expect(result.current.entries[0]?.status).toBe('invalid')
    expect(result.current.entries[0]?.errorMessage).toMatch(/could not be read/i)
    expect(result.current.entries[1]?.status).toBe('ready')
    expect(result.current.isReadyToMerge).toBe(false)
  })

  it('removes a file by id', async () => {
    const { result } = renderHook(() => useMergePdfFiles())
    act(() => {
      result.current.addFiles([loadFixture('pdf-single-page.pdf')])
    })
    const id = result.current.entries[0]?.id as string
    act(() => {
      result.current.removeFile(id)
    })
    expect(result.current.entries).toHaveLength(0)
  })

  it('clears all files', async () => {
    const { result } = renderHook(() => useMergePdfFiles())
    act(() => {
      result.current.addFiles([loadFixture('pdf-single-page.pdf'), loadFixture('pdf-multi-page.pdf')])
    })
    act(() => {
      result.current.clearAll()
    })
    expect(result.current.entries).toHaveLength(0)
    expect(result.current.rejected).toHaveLength(0)
  })

  it('reorders files with moveUp/moveDown/moveToFirst/moveToLast', async () => {
    const { result } = renderHook(() => useMergePdfFiles())
    act(() => {
      result.current.addFiles([
        loadFixture('pdf-single-page.pdf', 'a.pdf'),
        loadFixture('pdf-single-page.pdf', 'b.pdf'),
        loadFixture('pdf-single-page.pdf', 'c.pdf'),
      ])
    })
    const [a, b, c] = result.current.entries

    act(() => result.current.moveDown(a!.id))
    expect(result.current.entries.map((e) => e.name)).toEqual(['b.pdf', 'a.pdf', 'c.pdf'])

    act(() => result.current.moveToLast(a!.id))
    expect(result.current.entries.map((e) => e.name)).toEqual(['b.pdf', 'c.pdf', 'a.pdf'])

    act(() => result.current.moveToFirst(a!.id))
    expect(result.current.entries.map((e) => e.name)).toEqual(['a.pdf', 'b.pdf', 'c.pdf'])

    act(() => result.current.moveUp(c!.id))
    expect(result.current.entries.map((e) => e.name)).toEqual(['a.pdf', 'c.pdf', 'b.pdf'])
    void b
  })

  it('reorders via drag-and-drop index swap', async () => {
    const { result } = renderHook(() => useMergePdfFiles())
    act(() => {
      result.current.addFiles([
        loadFixture('pdf-single-page.pdf', 'a.pdf'),
        loadFixture('pdf-single-page.pdf', 'b.pdf'),
      ])
    })
    act(() => result.current.reorder(0, 1))
    expect(result.current.entries.map((e) => e.name)).toEqual(['b.pdf', 'a.pdf'])
  })

  it('validates a custom page range against the inspected page count', async () => {
    const { result } = renderHook(() => useMergePdfFiles())
    act(() => {
      result.current.addFiles([loadFixture('pdf-multi-page.pdf')])
    })
    await waitFor(() => expect(result.current.entries[0]?.status).toBe('ready'))
    const id = result.current.entries[0]?.id as string

    act(() => result.current.setPageRangeMode(id, 'custom'))
    act(() => result.current.setPageRangeInput(id, '1-2,10'))
    expect(result.current.entries[0]?.pageRangeError).toMatch(/beyond this document's last page/i)
    expect(result.current.isReadyToMerge).toBe(false)

    act(() => result.current.setPageRangeInput(id, '2,1'))
    expect(result.current.entries[0]?.pageRangeError).toBeNull()
    expect(result.current.entries[0]?.resolvedPages).toEqual([1, 2])
    expect(result.current.isReadyToMerge).toBe(true)

    act(() => result.current.resetPageRange(id))
    expect(result.current.entries[0]?.pageRangeMode).toBe('all')
    expect(result.current.entries[0]?.resolvedPages).toEqual([1, 2, 3, 4, 5])
  })

  it('merges ready files end-to-end and produces a non-empty result', async () => {
    const originalCreateObjectURL = URL.createObjectURL
    const originalRevokeObjectURL = URL.revokeObjectURL
    URL.createObjectURL = () => 'blob:mock'
    URL.revokeObjectURL = () => {}

    const { result } = renderHook(() => useMergePdfFiles())
    act(() => {
      result.current.addFiles([loadFixture('pdf-single-page.pdf'), loadFixture('pdf-multi-page.pdf')])
    })
    await waitFor(() => expect(result.current.isReadyToMerge).toBe(true))

    await act(async () => {
      await result.current.startMerge()
    })

    expect(result.current.mergeStatus).toBe('success')
    expect(result.current.result?.pageCount).toBe(6)
    expect(result.current.result?.sourceFileCount).toBe(2)
    expect(result.current.result?.fileSize).toBeGreaterThan(0)

    URL.createObjectURL = originalCreateObjectURL
    URL.revokeObjectURL = originalRevokeObjectURL
  })

  it('does not start a merge while any file is still validating or blocked', async () => {
    const { result } = renderHook(() => useMergePdfFiles())
    act(() => {
      result.current.addFiles([loadFixture('pdf-single-page.pdf')])
    })
    await act(async () => {
      await result.current.startMerge()
    })
    expect(result.current.mergeStatus).toBe('idle')
  })
})
