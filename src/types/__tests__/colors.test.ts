import { describe, expect, it } from 'vitest'

import { resolveTemplateColors } from '@/types/colors'
import type { TemplateStyle } from '@/types/template'

const STYLE: TemplateStyle = {
  accentColor: '#111111',
  headingColor: '#222222',
  bodyColor: '#333333',
  mutedColor: '#444444',
  borderColor: '#555555',
  codeBackground: '#666666',
  fontFamily: 'sans',
  headingWeight: 700,
  headingUppercase: false,
  ruleAfterH1: false,
  tableHeaderBackground: '#777777',
}

describe('resolveTemplateColors', () => {
  it('returns the template style unchanged when there are no overrides', () => {
    expect(resolveTemplateColors(STYLE, undefined)).toEqual(STYLE)
    expect(resolveTemplateColors(STYLE, {})).toEqual(STYLE)
  })

  it('applies only the overridden keys, leaving the rest at the template value', () => {
    const result = resolveTemplateColors(STYLE, { accentColor: '#abcabc' })
    expect(result.accentColor).toBe('#abcabc')
    expect(result.headingColor).toBe(STYLE.headingColor)
    expect(result.bodyColor).toBe(STYLE.bodyColor)
  })

  it('overrides every color field when all are provided', () => {
    const overrides = {
      accentColor: '#a1a1a1',
      headingColor: '#a2a2a2',
      bodyColor: '#a3a3a3',
      mutedColor: '#a4a4a4',
      borderColor: '#a5a5a5',
      codeBackground: '#a6a6a6',
      tableHeaderBackground: '#a7a7a7',
    }
    const result = resolveTemplateColors(STYLE, overrides)
    expect(result).toEqual({ ...STYLE, ...overrides })
  })

  it('preserves non-color template fields untouched', () => {
    const result = resolveTemplateColors(STYLE, { accentColor: '#000000' })
    expect(result.fontFamily).toBe(STYLE.fontFamily)
    expect(result.headingWeight).toBe(STYLE.headingWeight)
    expect(result.headingUppercase).toBe(STYLE.headingUppercase)
    expect(result.ruleAfterH1).toBe(STYLE.ruleAfterH1)
  })
})
