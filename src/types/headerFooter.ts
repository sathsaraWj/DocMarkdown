export interface HeaderFooterSettings {
  headerEnabled: boolean
  footerEnabled: boolean
  headerText: string
  footerText: string
  showPageNumber: boolean
  showDocTitle: boolean
  showExportDate: boolean
}

export const DEFAULT_HEADER_FOOTER: HeaderFooterSettings = {
  headerEnabled: false,
  footerEnabled: true,
  headerText: '',
  footerText: '',
  showPageNumber: true,
  showDocTitle: false,
  showExportDate: false,
}
