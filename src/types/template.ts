import type { FontFamilyId } from './typography'

export type TemplateId = 'clean' | 'technical' | 'business' | 'academic' | 'resume'

export const TEMPLATE_IDS: readonly TemplateId[] = [
  'clean',
  'technical',
  'business',
  'academic',
  'resume',
]

export interface TemplateStyle {
  /** CSS custom properties applied to the document surface (preview + export). */
  accentColor: string
  headingColor: string
  bodyColor: string
  mutedColor: string
  borderColor: string
  codeBackground: string
  fontFamily: FontFamilyId
  headingWeight: number
  headingUppercase: boolean
  ruleAfterH1: boolean
  tableHeaderBackground: string
}

export interface DocumentTemplate {
  id: TemplateId
  name: string
  description: string
  bestFor: string
  starterContent: string
  style: TemplateStyle
}
