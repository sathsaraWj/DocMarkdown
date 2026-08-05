/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_GITHUB_URL?: string
  readonly VITE_SITE_URL?: string
  readonly VITE_ENABLE_ANALYTICS?: string
  readonly VITE_MAX_UPLOAD_SIZE_MB?: string
  readonly VITE_MAX_WORD_UPLOAD_SIZE_MB?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
