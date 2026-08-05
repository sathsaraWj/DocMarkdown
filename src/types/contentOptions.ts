export interface ContentOptions {
  generateToc: boolean
  headingNumbering: boolean
  styleLinksForPrint: boolean
  codeBlockBackgrounds: boolean
  preserveChecklistSymbols: boolean
}

export const DEFAULT_CONTENT_OPTIONS: ContentOptions = {
  generateToc: false,
  headingNumbering: false,
  styleLinksForPrint: true,
  codeBlockBackgrounds: true,
  preserveChecklistSymbols: true,
}
