import type { DocumentTemplate, TemplateId } from '@/types/template'
import { academicTemplate } from './academic'
import { businessTemplate } from './business'
import { cleanTemplate } from './clean'
import { resumeTemplate } from './resume'
import { technicalTemplate } from './technical'

export const TEMPLATES: Record<TemplateId, DocumentTemplate> = {
  clean: cleanTemplate,
  technical: technicalTemplate,
  business: businessTemplate,
  academic: academicTemplate,
  resume: resumeTemplate,
}

export const TEMPLATE_LIST: DocumentTemplate[] = [
  cleanTemplate,
  technicalTemplate,
  businessTemplate,
  academicTemplate,
  resumeTemplate,
]

export function getTemplate(id: TemplateId): DocumentTemplate {
  return TEMPLATES[id]
}
