// GitHub Pages serves 404.html for any unmatched path. Copying the built
// index.html there lets the client-side router take over and render the
// correct route instead of showing a raw 404 page. Harmless on other hosts.
import { copyFileSync, existsSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import path from 'node:path'

const distDir = path.resolve(fileURLToPath(new URL('.', import.meta.url)), '..', 'dist')
const indexPath = path.join(distDir, 'index.html')
const notFoundPath = path.join(distDir, '404.html')

if (existsSync(indexPath)) {
  copyFileSync(indexPath, notFoundPath)
  console.log('Copied dist/index.html to dist/404.html for GitHub Pages SPA routing.')
}
