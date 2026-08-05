export const APP_NAME = 'DocMarkdown'

export const GITHUB_URL: string = import.meta.env.VITE_GITHUB_URL || 'https://github.com'

export const SITE_URL: string = import.meta.env.VITE_SITE_URL || 'https://docmarkdown.app'

export const ANALYTICS_ENABLED: boolean = import.meta.env.VITE_ENABLE_ANALYTICS === 'true'

export const MAX_UPLOAD_SIZE_BYTES: number =
  Number(import.meta.env.VITE_MAX_UPLOAD_SIZE_MB ?? 5) * 1024 * 1024

export const MAX_WORD_UPLOAD_SIZE_BYTES: number =
  Number(import.meta.env.VITE_MAX_WORD_UPLOAD_SIZE_MB ?? 10) * 1024 * 1024
