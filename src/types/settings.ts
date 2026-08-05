import type { ColorOverrides } from './colors'
import { DEFAULT_CONTENT_OPTIONS, type ContentOptions } from './contentOptions'
import { DEFAULT_METADATA, type DocumentMetadata } from './document'
import { DEFAULT_HEADER_FOOTER, type HeaderFooterSettings } from './headerFooter'
import { DEFAULT_PAGE_SETTINGS, type PageSettings } from './page'
import type { TemplateId } from './template'
import { DEFAULT_TYPOGRAPHY, type TypographySettings } from './typography'

export type ThemePreference = 'light' | 'dark' | 'system'

export interface DocumentSettings {
  templateId: TemplateId
  page: PageSettings
  typography: TypographySettings
  metadata: DocumentMetadata
  headerFooter: HeaderFooterSettings
  content: ContentOptions
  /** Per-document color overrides on top of the selected template's fixed palette; unset keys fall back to the template. */
  colors: ColorOverrides
}

export const DEFAULT_DOCUMENT_SETTINGS: DocumentSettings = {
  templateId: 'clean',
  page: DEFAULT_PAGE_SETTINGS,
  typography: DEFAULT_TYPOGRAPHY,
  metadata: DEFAULT_METADATA,
  headerFooter: DEFAULT_HEADER_FOOTER,
  content: DEFAULT_CONTENT_OPTIONS,
  colors: {},
}
