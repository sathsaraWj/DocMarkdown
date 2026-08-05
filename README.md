# DocMarkdown

**Convert Markdown into clean, professional PDFs directly in your browser. Your documents never leave your device.**

DocMarkdown is a privacy-focused, fully client-side Markdown to PDF converter.
Write or paste Markdown, watch a live paginated preview update as you type,
choose from five document templates, tune page/typography/header/footer
settings, and export to **PDF**, standalone **HTML**, **Markdown**, or **plain
text** — all without a network request. There is no backend, no account, and
no document upload step, because there is nowhere for your document to go.

## Table of contents

- [Product overview](#product-overview)
- [Feature list](#feature-list)
- [Technology stack](#technology-stack)
- [Local setup](#local-setup)
- [Development commands](#development-commands)
- [Testing](#testing)
- [Production build](#production-build)
- [Deployment](#deployment)
- [Environment variables](#environment-variables)
- [Privacy architecture](#privacy-architecture)
- [Export limitations](#export-limitations)
- [Browser support](#browser-support)
- [Project structure](#project-structure)
- [Future improvement ideas](#future-improvement-ideas)

## Product overview

DocMarkdown targets writers and developers who want to turn Markdown (a
README, a set of notes, a resume, a report) into a polished document without
uploading it anywhere. Everything — Markdown parsing, HTML sanitization,
syntax highlighting, and PDF layout — runs in the browser's JavaScript engine.

## Feature list

- Real-time Markdown editor with line numbers, tab indentation, formatting
  toolbar, word/character counts, reading time estimate, and keyboard
  shortcuts (Ctrl/Cmd+B, +I, +K, Tab/Shift+Tab)
- Drag-and-drop or click-to-browse upload of `.md`/`.txt` files, with file
  type and size validation
- Live, paginated preview with paper-boundary rendering for A4, Letter,
  Legal, and A5 in portrait or landscape, zoom controls, fit-to-width, and
  approximate page-break indicators
- Five templates (Clean, Technical, Business Report, Academic, Resume), each
  with its own starter content and visual style, applied consistently across
  the preview, HTML export, and PDF export
- Full document settings: page size/orientation/margins, typography (font
  family, sizes, line height, paragraph spacing), metadata (title, author,
  subject, keywords), header/footer with page numbers and placeholders,
  and content options (table of contents, heading numbering, print-styled
  links, code backgrounds, checklist symbols)
- Export to PDF (custom measurement-based layout engine — see
  [Export limitations](#export-limitations)), standalone HTML, Markdown, and
  plain text, each with sanitized filenames derived from the document title
- Local-only persistence: your draft, settings, and theme preference are
  saved to `localStorage` under a versioned schema, restored on reload, with
  an autosave indicator, JSON settings import/export, and a one-click
  "delete all local data" action
- Light/dark/system theme, fully responsive (desktop two-pane resizable
  layout; mobile/tablet Editor/Preview/Settings tabs)
- Interactive Markdown syntax guide with live rendered examples and copy
  buttons
- Privacy, Terms, About, and Contact pages; a custom 404 page

## Technology stack

| Concern                | Choice                                                                                   |
| ---------------------- | ---------------------------------------------------------------------------------------- |
| UI framework           | React 19 + TypeScript (strict mode)                                                      |
| Build tool             | Vite 8                                                                                   |
| Styling                | Tailwind CSS v4                                                                          |
| Routing                | React Router 7 (lazy-loaded secondary routes)                                            |
| Markdown parsing       | Marked, with a custom renderer for heading IDs/TOC/numbering and syntax highlighting     |
| Sanitization           | DOMPurify (every render path, no exceptions)                                             |
| Syntax highlighting    | highlight.js (core + a curated language set)                                             |
| PDF generation         | jsPDF, driven by a hand-built layout engine (see below) — no `html2canvas` rasterization |
| Local persistence      | `localStorage`, versioned schema                                                         |
| Unit/component testing | Vitest + React Testing Library                                                           |
| E2E testing            | Playwright                                                                               |
| Linting/formatting     | ESLint (flat config) + Prettier                                                          |

## Local setup

Requires Node.js 20+ (tested on Node 22).

```bash
npm install
npm run dev
```

Open `http://localhost:5173`.

## Development commands

```bash
npm run dev             # start the Vite dev server
npm run lint             # ESLint
npm run lint:fix          # ESLint with autofix
npm run format            # Prettier write
npm run format:check       # Prettier check (CI-friendly)
npm run typecheck         # tsc --noEmit project-wide
```

## Testing

```bash
npm run test              # Vitest unit + component tests (jsdom)
npm run test:watch         # Vitest in watch mode
npm run test:coverage       # Vitest with v8 coverage
npm run test:e2e           # Playwright end-to-end tests (builds+previews automatically)
npm run test:e2e:ui         # Playwright UI mode
```

Unit/component coverage includes: Markdown rendering (headings/lists/tables/
task lists/code/footnotes/escaping/link safety), HTML sanitization, plain-text
extraction, filename generation, file upload validation, local storage
persistence, settings JSON import/validation, template registry integrity,
export builders (Markdown/HTML/text), the formatting toolbar, the upload
interface (including drag state and error handling), the clear-content
confirmation flow, the settings panel (including template switching and the
reset/delete confirmations), and the theme switcher.

Playwright covers: typing Markdown and seeing the live preview, uploading a
`.md` file, applying a template, changing page settings, refreshing to
restore a saved draft, exporting Markdown, exporting HTML, exporting PDF
(asserting a valid, non-empty `%PDF-` file), deleting local data, and using
the converter on a mobile viewport (Editor/Preview/Settings tabs).

Playwright needs browser binaries once per machine:

```bash
npx playwright install chromium
```

## Production build

```bash
npm run build      # tsc -b && vite build (dist/), then copies dist/index.html -> dist/404.html
npm run preview     # serve the production build locally at :4173
```

The build is code-split: secondary routes (Templates, Markdown Guide,
Privacy, Terms, About, Contact, 404) are lazy-loaded, and the PDF engine
(`jspdf` + our layout code) is loaded on demand only when a user actually
triggers a PDF export — it is not part of the initial bundle.

## Deployment

DocMarkdown is a static SPA: any static host works, provided unknown paths
fall back to `index.html` so client-side routing can take over.

### Cloudflare Pages

- Build command: `npm run build`
- Output directory: `dist`
- `public/_redirects` (`/* /index.html 200`) is already included and is
  copied into `dist/` by Vite automatically, so deep links and hard
  refreshes on non-root routes resolve correctly out of the box.

### Netlify

`netlify.toml` is included at the repo root with the build command, publish
directory, and an `/* -> /index.html` SPA redirect already configured.
Connect the repo in the Netlify dashboard or run `netlify deploy`.

### Vercel

`vercel.json` is included with the build command, output directory, and a
catch-all rewrite to `index.html`. Import the repo in the Vercel dashboard or
run `vercel deploy`.

### GitHub Pages

The included `.github/workflows/deploy-pages.yml` Actions workflow builds and
deploys automatically on every push to `main` via the official
`actions/deploy-pages` action. It uses `actions/configure-pages` to detect
whether the site is a user/org page (served from `/`) or a project page
(served from `/<repo-name>/`), and passes that as `VITE_BASE_PATH` /
`VITE_SITE_URL` to the build — so asset paths and the React Router
`basename` (`src/app/App.tsx`, via `import.meta.env.BASE_URL`) resolve
correctly either way, with no manual editing required.

**One-time setup:** in the repository's **Settings → Pages**, set **Source**
to **GitHub Actions** (this can't be done from the CLI/repo files — it's a
per-repository toggle in the GitHub UI). After that, every push to `main`
deploys automatically; you can also trigger it manually from the **Actions**
tab (`workflow_dispatch`).

The `postbuild` script additionally copies `dist/index.html` to
`dist/404.html`, so deep links (e.g. a bookmark to `/templates`) resolve
correctly even though Pages has no native SPA fallback.

If you deploy to a `gh-pages` branch by hand instead of via Actions, set
`VITE_BASE_PATH=/<repo-name>/` when running `npm run build`.

## Environment variables

Copy `.env.example` to `.env` and adjust as needed — every variable is
optional with a safe default.

| Variable                  | Purpose                                                                | Default                   |
| ------------------------- | ---------------------------------------------------------------------- | ------------------------- |
| `VITE_GITHUB_URL`         | GitHub link shown in the header                                        | `https://github.com`      |
| `VITE_SITE_URL`           | Canonical URL used for SEO meta tags                                   | `https://docmarkdown.app` |
| `VITE_MAX_UPLOAD_SIZE_MB` | Max size for uploaded `.md`/`.txt` files                               | `5`                       |
| `VITE_ENABLE_ANALYTICS`   | Enables the analytics abstraction (no-op until a provider is wired in) | `false`                   |

## Privacy architecture

- **No document upload.** Markdown parsing (Marked), sanitization
  (DOMPurify), syntax highlighting (highlight.js), and PDF layout (jsPDF) run
  entirely in the browser's JS engine. There is no API route, serverless
  function, or backend that receives document content in this codebase.
- **Local-only persistence.** Drafts, settings, and theme preference are
  stored in `localStorage` under one versioned key (`docmarkdown:state`),
  read and written only by `src/services/storage`.
- **File uploads never leave the browser.** Uploaded files are read via the
  `FileReader` API directly into memory.
- **Sanitization is mandatory, not optional.** Every HTML render path
  (preview, HTML export, PDF text extraction) passes through
  `sanitizeHtml()` (DOMPurify), which also forces
  `rel="noopener noreferrer nofollow"` and `target="_blank"` on external
  links.
- **No remote fonts, no third-party scripts.** Typography uses bundled/
  system font stacks; PDF export uses jsPDF's built-in core fonts
  (Helvetica/Times/Courier), so nothing needs to be fetched or embedded.
- **No analytics by default.** See [Environment variables](#environment-variables) —
  analytics stays fully disabled unless a deployer opts in, and even then no
  provider is implemented out of the box.

See `/privacy` in the running app for the user-facing version of this policy.

### Content Security Policy guidance

DocMarkdown ships no CSP header itself (that's host-specific), but because it
makes no network requests for document processing and loads no third-party
scripts, a strict policy is easy to apply at your host/CDN, for example:

```
Content-Security-Policy:
  default-src 'self';
  script-src 'self';
  style-src 'self' 'unsafe-inline';
  img-src 'self' data:;
  connect-src 'self';
  object-src 'none';
  base-uri 'self';
  frame-ancestors 'none';
```

(`style-src 'unsafe-inline'` is needed because generated document CSS and the
standalone HTML export are injected as inline `<style>` tags; this could be
tightened further with nonces if your host supports them.)

## Export limitations

Being transparent about where the automated pipelines fall short:

- **PDF export does not use the browser's print engine or `html2canvas`.**
  It walks the sanitized HTML into a block model and draws it with jsPDF
  using measured text wrapping, so page size/margins/typography are always
  respected exactly — but this means:
  - **Syntax-highlighting colors are not preserved in PDF.** Code blocks
    render in monospace with a background tint, but without per-token color
    (the live preview and HTML export do show full highlight.js coloring).
  - **Remote images are not embedded in PDF** (only `data:` URI images are);
    a `[Image: alt text]` placeholder is shown instead. This is deliberate —
    fetching a remote image at export time would be a network request,
    conflicting with the "documents never leave your device" guarantee in
    the other direction (fetching _into_ the document). Embed images as
    base64 data URIs if you need them in the PDF.
  - Internal anchor links (table of contents, footnotes) are styled but not
    wired as PDF-internal jump links; external `http(s)`/`mailto` links are
    fully clickable.
  - Table column widths are currently distributed evenly rather than sized
    to content.
- **Page-break indicators in the live preview are an approximation** (based
  on measured content height divided by page height) rather than a perfect
  match for the PDF engine's actual line-by-line pagination, though both use
  the same measurement units and should stay closely aligned in practice.
- **Footnotes are "basic"**: `[^label]` references and `[^label]: text`
  definitions are supported with correct numbering and back-links, but
  nested footnote definitions (a footnote whose body contains another
  reference) are not specially handled.

## Browser support

Actively developed against current Chrome, Edge, Firefox, and Safari. The
app relies on: `ResizeObserver`, `<dialog>`/`showModal()`, `matchMedia`,
`FileReader`, the Clipboard API (for "copy to clipboard"), and CSS `:has()`
(used for a checklist styling refinement; layout still works without it).
These are all broadly supported in evergreen browsers as of 2025. Internet
Explorer is not supported.

## Project structure

```text
src/
  app/            App shell, routing, and the DocumentContext (markdown +
                   settings + theme + autosave state)
  components/
    layout/        Header, Footer, Hero, mobile nav, theme switcher
    editor/         Markdown editor, formatting toolbar, resizable split
    preview/        Paginated document preview, zoom controls
    settings/       Page/typography/metadata/header-footer/content settings
    export/         Export menu/progress UI
    guide/          Markdown guide example/rendered-output cards
    common/         Icons, confirm dialog, loading fallback
  pages/           One component per route (see "Main pages" below)
  hooks/           useDocumentStats, useFileUpload, useMarkdownFormatting,
                   useRenderedMarkdown, usePreviewZoom, useMediaQuery, etc.
  services/
    markdown/       Marked configuration, footnotes, sanitize, plain-text
    pdf/            Block model, HTML->block parser, jsPDF layout engine
    export/         HTML/Markdown/text export builders + orchestration
    storage/        Versioned localStorage persistence + settings JSON I/O
    analytics/       Disabled-by-default analytics abstraction
  templates/       The five document templates (data + starter content)
  types/           Shared TypeScript types (settings, page, typography, ...)
  utils/           Small pure helpers (filename sanitizing, color, text, ...)
  styles/          Shared document content CSS (used by preview + HTML export)
e2e/               Playwright specs
```

### Main pages

`/` converter · `/templates` · `/markdown-guide` · `/privacy` · `/terms` ·
`/about` · `/contact` · `*` 404.

## Future improvement ideas

- Per-token syntax-highlight coloring in PDF export (would require mapping
  highlight.js token spans into styled PDF text runs)
- Content-aware PDF table column sizing
- Clickable internal PDF links for the table of contents and footnotes
- IndexedDB-backed multi-document draft history (currently a single draft)
- A pluggable, opt-in privacy-friendly analytics provider (Plausible/Umami)
  behind the existing `VITE_ENABLE_ANALYTICS` flag
- Collaborative/shareable read-only document links (would require explicit,
  clearly-disclosed opt-in cloud storage — a deliberate non-goal for now)
