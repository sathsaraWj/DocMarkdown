export interface DocumentMetadata {
  title: string
  author: string
  subject: string
  keywords: string
}

export const DEFAULT_METADATA: DocumentMetadata = {
  title: 'Untitled Document',
  author: '',
  subject: '',
  keywords: '',
}
