import { describe, expect, it } from 'vitest'

import { getTemplate, TEMPLATE_LIST, TEMPLATES } from '@/templates'
import { TEMPLATE_IDS } from '@/types/template'

describe('templates registry', () => {
  it('provides exactly five templates', () => {
    expect(TEMPLATE_LIST).toHaveLength(5)
  })

  it('matches the declared TEMPLATE_IDS list', () => {
    expect(TEMPLATE_LIST.map((t) => t.id).sort()).toEqual([...TEMPLATE_IDS].sort())
  })

  it('gives every template non-empty starter content and description', () => {
    for (const template of TEMPLATE_LIST) {
      expect(template.starterContent.trim().length).toBeGreaterThan(0)
      expect(template.description.trim().length).toBeGreaterThan(0)
      expect(template.bestFor.trim().length).toBeGreaterThan(0)
    }
  })

  it('resolves a template by id via getTemplate', () => {
    expect(getTemplate('resume').name).toBe('Resume')
    expect(getTemplate('technical')).toBe(TEMPLATES.technical)
  })

  it('gives each template a valid accent color', () => {
    for (const template of TEMPLATE_LIST) {
      expect(template.style.accentColor).toMatch(/^#[0-9a-f]{6}$/i)
    }
  })
})
