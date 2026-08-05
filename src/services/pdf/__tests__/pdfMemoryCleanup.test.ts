import { describe, expect, it, vi } from 'vitest'

import { releaseMergeResources, revokeObjectUrlSafely } from '@/services/pdf/pdfMemoryCleanup'

describe('revokeObjectUrlSafely', () => {
  it('revokes a real object URL', () => {
    const spy = vi.spyOn(URL, 'revokeObjectURL').mockImplementation(() => {})
    revokeObjectUrlSafely('blob:mock-url')
    expect(spy).toHaveBeenCalledWith('blob:mock-url')
    spy.mockRestore()
  })

  it('is a no-op for null/undefined', () => {
    const spy = vi.spyOn(URL, 'revokeObjectURL').mockImplementation(() => {})
    revokeObjectUrlSafely(null)
    revokeObjectUrlSafely(undefined)
    expect(spy).not.toHaveBeenCalled()
    spy.mockRestore()
  })

  it('swallows errors from an already-revoked URL', () => {
    const spy = vi.spyOn(URL, 'revokeObjectURL').mockImplementation(() => {
      throw new Error('already revoked')
    })
    expect(() => revokeObjectUrlSafely('blob:mock-url')).not.toThrow()
    spy.mockRestore()
  })
})

describe('releaseMergeResources', () => {
  it('revokes the given URL and returns an empty array', () => {
    const spy = vi.spyOn(URL, 'revokeObjectURL').mockImplementation(() => {})
    const result = releaseMergeResources('blob:mock-url')
    expect(spy).toHaveBeenCalledWith('blob:mock-url')
    expect(result).toEqual([])
    spy.mockRestore()
  })

  it('returns an empty array when there is no URL to revoke', () => {
    expect(releaseMergeResources(null)).toEqual([])
    expect(releaseMergeResources()).toEqual([])
  })
})
