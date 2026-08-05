import { describe, expect, it } from 'vitest'

import { applyWordImageOptions } from '@/services/word/wordImageProcessing'
import { DEFAULT_WORD_IMAGE_OPTIONS } from '@/types/word'

const SAMPLE_HTML = '<p>Before</p><p><img src="data:image/png;base64,AAAA" alt="A logo"></p><p>After</p>'

describe('applyWordImageOptions', () => {
  it('leaves HTML untouched when images are included and not compressed', async () => {
    const result = await applyWordImageOptions(SAMPLE_HTML, DEFAULT_WORD_IMAGE_OPTIONS)
    expect(result).toBe(SAMPLE_HTML)
  })

  it('replaces images with a placeholder when includeImages is false', async () => {
    const result = await applyWordImageOptions(SAMPLE_HTML, {
      ...DEFAULT_WORD_IMAGE_OPTIONS,
      includeImages: false,
    })
    expect(result).not.toContain('<img')
    expect(result).toContain('Image omitted: A logo')
  })

  it('returns HTML unchanged when there are no images', async () => {
    const html = '<p>No pictures here</p>'
    const result = await applyWordImageOptions(html, {
      ...DEFAULT_WORD_IMAGE_OPTIONS,
      includeImages: false,
    })
    expect(result).toBe(html)
  })

  it(
    'does not throw when asked to compress images in an environment without canvas support',
    async () => {
      // jsdom doesn't fire load/error for <img>/Image src assignments and has
      // no 2D canvas rendering, so this exercises the timeout fallback path
      // (see IMAGE_LOAD_TIMEOUT_MS) rather than crashing or hanging forever.
      const result = await applyWordImageOptions(SAMPLE_HTML, {
        includeImages: true,
        compressImages: true,
        imageQuality: 0.5,
      })
      expect(result).toContain('<img')
    },
    8000,
  )
})
