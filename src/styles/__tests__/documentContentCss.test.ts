import { describe, expect, it } from 'vitest'

import { getTemplate } from '@/templates'
import { DEFAULT_DOCUMENT_SETTINGS } from '@/types/settings'
import { buildContentCss } from '@/styles/documentContentCss'

describe('buildContentCss', () => {
  it('uses the template accent color when there are no overrides', () => {
    const template = getTemplate('clean')
    const css = buildContentCss(DEFAULT_DOCUMENT_SETTINGS, template)
    expect(css).toContain('--doc-accent: #3b66f5')
  })

  it('applies a document color override on top of the template palette', () => {
    const template = getTemplate('clean')
    const settings = {
      ...DEFAULT_DOCUMENT_SETTINGS,
      colors: { accentColor: '#ff0000' },
    }
    const css = buildContentCss(settings, template)
    expect(css).toContain('--doc-accent: #ff0000')
    // Non-overridden colors still come from the template.
    expect(css).toContain(`--doc-heading-color: ${template.style.headingColor}`)
  })
})
