/// <reference types="vitest/config" />
import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { fileURLToPath, URL } from 'node:url'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')

  return {
    // Lets a single config serve both root-domain hosts (Netlify/Vercel/
    // Cloudflare Pages) and subpath hosts (GitHub Pages project sites) by
    // setting VITE_BASE_PATH only in the environment that needs it.
    base: env.VITE_BASE_PATH || '/',
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url)),
        // Vitest executes test files through Vite's SSR/Node module runner,
        // which does not apply package.json's "browser" field remapping the
        // way a real client build does — so plain `import 'mammoth'` would
        // resolve to mammoth's Node-only entry (which rejects the
        // {arrayBuffer} input our code uses) during tests. Point tests at
        // mammoth's own bundled standalone browser build instead; the real
        // app build is unaffected since this alias only applies under
        // Vitest (process.env.VITEST).
        ...(process.env.VITEST ? { mammoth: 'mammoth/mammoth.browser.js' } : {}),
      },
    },
    build: {
      sourcemap: false,
      rollupOptions: {
        output: {
          manualChunks(id: string) {
            if (id.includes('marked') || id.includes('dompurify') || id.includes('highlight.js')) {
              return 'markdown'
            }
            if (id.includes('jspdf')) {
              return 'pdf'
            }
            return undefined
          },
        },
      },
    },
    test: {
      environment: 'jsdom',
      globals: true,
      setupFiles: ['./src/test/setup.ts'],
      css: true,
      exclude: ['**/node_modules/**', '**/dist/**', '**/e2e/**'],
      coverage: {
        provider: 'v8',
        reporter: ['text', 'html'],
        exclude: ['e2e/**', 'src/test/**', '**/*.d.ts'],
      },
    },
  }
})
