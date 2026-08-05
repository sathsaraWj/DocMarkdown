# DocMarkdown

**A Markdown document studio that runs entirely in your browser — write Markdown, export polished PDF, DOCX, HTML, or plain-text documents. Your documents never leave your device.**

DocMarkdown is a privacy-focused, fully client-side Markdown editor. Write or
paste Markdown in a full CodeMirror 6 code-editor experience, watch a live
paginated preview render tables, syntax-highlighted code, Mermaid diagrams,
and KaTeX math as you type, choose from five document templates (with
optional custom color overrides), tune page/typography/header/footer
settings, and export to **PDF**, **DOCX**, standalone **HTML**, **Markdown**,
or **plain text** — or print directly — all without a network request. There
is no backend, no account, and no document upload step, because there is
nowhere for your document to go.

DocMarkdown also includes a **Word to PDF Converter** (`/word-to-pdf`): drop
in a `.docx` file and it's parsed, previewed, and exported entirely in the
same browser tab — no upload, no server-side conversion. And a **Merge PDF**
tool (`/merge-pdf`): combine multiple PDF files into one, in whatever order
you choose, entirely in your browser.

## Table of contents

- [Product overview](#product-overview)
- [Feature list](#feature-list)
- [Markdown editor architecture](#markdown-editor-architecture)
- [Word to PDF converter](#word-to-pdf-converter)
- [Merge PDF tool](#merge-pdf-tool)
- [Technology stack](#technology-stack)
- [Local setup](#local-setup)
- [Development commands](#development-commands)
- [Testing](#testing)
- [Production build](#production-build)
- [Deployment](#deployment)
- [Environment variables](#environment-variables)
- [Privacy architecture](#privacy-architecture)
- [Export limitations](#export-limitations)
- [Beautify Markdown limitations](#beautify-markdown-limitations)
- [Browser support](#browser-support)
- [Project structure](#project-structure)
- [Troubleshooting](#troubleshooting)
- [Future improvement ideas](#future-improvement-ideas)

## Product overview

DocMarkdown targets writers and developers who want to turn Markdown (a
README, a set of notes, a resume, a report, an AI-generated response) into a
polished document without uploading it anywhere. Everything — the editor,
Markdown parsing, HTML sanitization, syntax highlighting, diagram/math
rendering, and PDF/DOCX layout — runs in the browser's JavaScript engine.

## Feature list

- **CodeMirror 6 editor**: line numbers, current-line highlighting,
  Markdown syntax highlighting, bracket matching/auto-closing, tab and
  multi-line indentation, find and replace, full undo/redo history,
  soft-wrap and spellcheck toggles, a distraction-free full-screen writing
  mode, word/character counts, reading-time estimate, cursor line/column,
  and local draft recovery
- **Compact formatting toolbar** (horizontally scrollable on narrow
  screens): bold, italic, underline, strikethrough, headings 1–3,
  blockquote, inline code, code block, link, image, ordered/unordered/
  checklist lists, table, horizontal rule, page break, Mermaid diagram, math
  block, and footnote — each intelligently wraps a selection or inserts a
  usable placeholder with the cursor positioned for immediate typing
- **Keyboard shortcuts**: Ctrl/Cmd+B (bold), +I (italic), +K (link),
  +Shift+7 (ordered list), +Shift+8 (unordered list), +S (stops the
  browser's native save dialog — autosave already runs continuously),
  +Enter (open preview), +Shift+P (open the export menu) — layered on top
  of CodeMirror's own defaults without overriding essential browser/
  accessibility shortcuts
- **Live, sanitized preview**: headings, paragraphs, emphasis, nested/task
  lists, tables, links, images, blockquotes, inline/fenced code with
  syntax highlighting, horizontal rules, footnotes, explicit page breaks,
  **Mermaid diagrams**, and **KaTeX math** (block `$$...$$` and inline
  `$...$`, using the same disambiguation heuristic as Pandoc so plain
  prose like "$5 and $10" is never misread as math) — every render path is
  sanitized through DOMPurify before touching the DOM, with a
  "Beautify Markdown" action that cleans up common formatting
  inconsistencies (blank-line spacing, bullet markers, heading spacing)
  without ever touching content inside fenced code blocks
- Paginated paper-boundary preview for A4, Letter, Legal, and A5 in portrait
  or landscape, with zoom controls, fit-to-width, and approximate
  page-break indicators
- **Three workspace modes on desktop** (Editor only / Split / Preview only,
  via a segmented control in the top action bar, with the split ratio and
  chosen mode both remembered across reloads) and **Write/Preview/Style
  tabs on mobile/tablet** — plus a distraction-free full-screen writing mode
  that hides all surrounding chrome
- **Top action bar**: logo, an inline-editable document title, live save
  status, the workspace mode selector, undo/redo, a Preview shortcut, the
  export menu, a more-options menu (Beautify Markdown, copy to clipboard),
  and the theme switcher
- Five templates (Clean, Technical, Business Report, Academic, Resume), each
  with its own starter content and visual style, applied consistently across
  the preview, HTML export, PDF export, and DOCX export
- **Custom document color overrides**: pick your own accent, heading, body,
  muted, border, code-background, and table-header colors on top of any
  template's palette, with a one-click reset back to the template's defaults
- Full document settings: page size/orientation/margins, typography (font
  family, sizes, line height, paragraph spacing), metadata (title, author,
  subject, keywords), header/footer with page numbers and placeholders,
  and content options (table of contents, heading numbering, print-styled
  links, code backgrounds, checklist symbols)
- Export to **PDF** (custom measurement-based layout engine — see
  [Export limitations](#export-limitations)), **DOCX** (reusing the same
  content-block model as PDF export — see
  [Markdown editor architecture](#markdown-editor-architecture)), standalone
  **HTML**, **Markdown**, or **plain text** — or **Print** directly via the
  browser's native print dialog — each with sanitized filenames derived from
  the document title, clear loading/progress states, and a guard against
  duplicate export clicks
- Drag-and-drop or click-to-browse upload of `.md`/`.txt` files, with file
  type and size validation
- Local-only persistence: your draft, settings, and theme preference are
  saved to `localStorage` under a versioned schema, restored on reload, with
  an autosave indicator, JSON settings import/export, and a one-click
  "delete all local data" action
- Light/dark/system theme, fully responsive
- Interactive Markdown syntax guide with live rendered examples and copy
  buttons
- Privacy, Terms, About, and Contact pages; a custom 404 page
- A second converter, **Word to PDF** (`/word-to-pdf`), covered in its own
  section below
- A third tool, **Merge PDF** (`/merge-pdf`), covered in its own section below

## Markdown editor architecture

The editor is built around a few deliberate architectural choices worth
documenting:

- **CodeMirror 6, not Monaco.** CodeMirror's modular package structure
  (`@codemirror/state`/`view`/`commands`/`language`/`lang-markdown`/`search`/
  `autocomplete`) keeps the bundle small and works reliably on mobile/touch,
  which mattered more here than Monaco's heavier IDE-oriented feature set.
  `MarkdownEditor.tsx` wraps a single `EditorView` instance created once in
  an effect with an empty dependency array (never recreated, to preserve
  undo history and cursor position); `value`/option props are synced into
  the view via separate effects rather than driving CodeMirror declaratively
  from React state on every render. `EditorView.contentAttributes` sets
  `role="textbox"`/`aria-label="Markdown source"` so the editor keeps the
  same accessible-name contract a plain `<textarea>` would have had.
- **One command module, two call sites.** Every formatting transform (bold,
  headings, lists, tables, Mermaid/math/footnote insertion, ...) lives as a
  pure `(view: EditorView) => boolean` function in
  `services/editor/markdownCommands.ts`. Both the toolbar's click handlers
  and CodeMirror's own keymap call the exact same functions, so "click the
  toolbar button" and "press the keyboard shortcut" can never drift apart.
- **Extract-before-parse preprocessing.** Footnotes, explicit `\pagebreak`
  markers, KaTeX math, and Mermaid diagrams are all handled by pulling the
  relevant source text out into placeholder tokens _before_ Marked ever
  parses it, then substituting the real rendered output back into the HTML
  afterward (`services/markdown/footnotes.ts`, `pageBreaks.ts`, `math.ts`,
  and the `code` renderer override in `parser.ts`). This matters most for
  math: LaTeX is full of underscores, asterisks, and backslashes that
  Markdown's own emphasis/escaping rules would otherwise mangle. Math tokens
  use Unicode Private-Use-Area code points specifically so they can never
  collide with real user-authored text.
- **Mermaid rendering is necessarily async, unlike KaTeX.** KaTeX renders
  synchronously, so it fits directly into the existing synchronous
  `renderMarkdown()` pipeline. Mermaid's renderer is Promise-based, so
  diagrams instead render as an inert placeholder div first
  (`data-mermaid-source`, holding the raw diagram text) and are hydrated to
  sanitized SVG a beat later via `hydrateMermaidDiagrams()`, called from a
  `useEffect` in the live preview after each render pass. Invalid diagram
  syntax falls back to an inline error box instead of throwing.
- **PDF and DOCX can't embed live SVG, so Mermaid is rasterized for export
  only.** The standalone HTML export embeds Mermaid's real SVG output
  directly (no rasterization needed, since HTML can render SVG natively).
  The PDF and DOCX pipelines instead rasterize each diagram to a PNG data
  URI via an offscreen canvas (`services/markdown/mermaidRaster.ts`) and
  substitute a plain `<p><img></p>` in its place — which the existing
  image-block detection in `htmlToBlocks.ts` already understood, so no
  changes were needed to either writer's image handling.
- **DOCX export reuses the PDF pipeline's content-block model.**
  `services/docx/docxExportService.ts` runs the exact same
  `renderMarkdown()` → rasterize-Mermaid → `htmlToBlocks()` →
  `resolveImageDimensions()` sequence as `pdfExportService.ts`, then hands
  the resulting `ContentBlock[]` to `blocksToDocx.ts` instead of `PdfWriter`.
  The two export formats can never structurally diverge on how a document
  is interpreted — only the final writer (jsPDF vs. the `docx` library)
  differs. Real Word document semantics are used where they exist (Word
  heading styles for outline/navigation, native thematic breaks for `<hr>`,
  a real `PageBreak` run for forced page breaks) layered under explicit
  run-level formatting for visual fidelity with the PDF/preview.
- **Sanitization covers more than HTML.** `DOMPurify`'s `USE_PROFILES` is
  set to allow all of `html`, `svg`, `svgFilters`, and `mathMl` — needed
  because KaTeX emits MathML alongside its HTML output, and Mermaid emits
  SVG, both of which the default profile would otherwise strip.
- **A known, disclosed jsdom limitation.** Mermaid's real layout engine
  needs SVG text-measurement APIs (`getBBox()`) that jsdom doesn't
  implement — confirmed via a disposable smoke test before writing the
  Mermaid test suite. Every Mermaid-dependent test therefore injects a fake
  render function to exercise the surrounding DOM-traversal and
  token-decoding logic, rather than depending on Mermaid's real rendering
  under Vitest; real Mermaid rendering is exercised in a browser via
  Playwright instead.

## Word to PDF converter

`/word-to-pdf` converts `.docx` Word documents to PDF, entirely client-side.

- **Upload**: drag-and-drop or browse for a `.docx` file (up to
  `VITE_MAX_WORD_UPLOAD_SIZE_MB`, default 10 MB). Only `.docx` is accepted —
  legacy `.doc` files are explicitly rejected with a message asking the user
  to save as `.docx`; empty, corrupt, and password-protected files are
  detected and reported with a friendly error instead of a silent failure or
  crash.
- **Local parsing only**: the file is read with `FileReader`/`arrayBuffer()`
  and converted in-memory by [mammoth](https://github.com/mtingers/mammoth.js)
  (`mammoth.convertToHtml`), which turns the DOCX's internal XML into HTML —
  no server, no third-party API, nothing uploaded. The resulting HTML is
  passed through the same `sanitizeHtml()` (DOMPurify) used everywhere else
  in the app before it is ever rendered.
- **Preview**: reuses the Markdown editor's paginated paper preview
  (`DocumentPaper`, `PreviewToolbar`, zoom/fit-to-width) — same page sizes,
  margins, and zoom behavior as the Markdown side.
- **Settings**: page size/orientation/margins and header/footer options are
  the same shared components used by the Markdown editor. An optional
  "Normalize document styling" toggle lets you apply a DocMarkdown template
  and typography (font family, body size, line height) instead of the
  extracted Word styling, which is used by default. Image handling
  (include/exclude, client-side re-compression, quality slider) is
  Word-specific, since embedded images can otherwise bloat the exported PDF.
- **Export**: PDF (via the same shared `renderHtmlToPdf` layout engine the
  Markdown editor uses), standalone self-contained HTML, and plain text.
- **Conversion warnings**: mammoth reports anything it couldn't map cleanly
  (e.g. an unsupported image type), shown in a dedicated, non-dismissable
  warnings panel alongside a standing disclosure of known formatting
  limitations — see below. Warnings are informational, not blocking.

### What doesn't convert perfectly

Word's format supports far more visual layout than HTML/PDF can represent
1:1. The following are **not** preserved, or are simplified:

- Text boxes, floating images, and image wrapping/positioning
- SmartArt, charts, and drawn shapes
- Macros and embedded OLE objects/files
- Multi-column section layouts
- Section-specific page margins (only the document's primary margins apply)
- Track changes and comments
- Custom/embedded fonts (PDF export uses jsPDF's core fonts, same as the
  Markdown editor)
- Complex/merged table structures
- Footnotes, endnotes, and watermarks
- Advanced headers/footers (only the DocMarkdown-managed header/footer text
  and page numbers are applied on export)

What **is** preserved: headings, paragraphs, bold/italic/underline, ordered
and nested unordered lists, tables, hyperlinks, embedded images, basic text
alignment, and blockquotes (where mammoth can identify them from the source
document's styles). The UI never claims the result is pixel-perfect.

### Layout fidelity architecture

Getting a browser-rendered PDF to closely match Word's own layout turned out
to hinge on a few specific, fixable problems rather than needing a different
rendering approach — the PDF pipeline was already a measurement-based
HTML→block-model→jsPDF renderer, not a `html2canvas` screenshot. The real
issues, and what changes:

- **Font metrics were the single biggest source of drift.** jsPDF's built-in
  core fonts (Helvetica/Times/Courier) use Adobe's standard AFM metrics,
  which don't match Calibri, Arial, or any other real Word font — so text
  wrapped differently in the PDF than in Word, which cascades into wrong
  paragraph heights and wrong page counts. Both the Markdown and Word PDF
  export paths now embed
  [Carlito](https://fonts.google.com/specimen/Carlito),
  [Caladea](https://fonts.google.com/specimen/Caladea),
  [Arimo](https://fonts.google.com/specimen/Arimo),
  [Tinos](https://fonts.google.com/specimen/Tinos), and
  [Cousine](https://fonts.google.com/specimen/Cousine) — free, OFL-licensed
  fonts specifically designed to be **metric-compatible** with Calibri,
  Cambria, Arial, Times New Roman, and Courier New respectively (same
  character widths and line breaks, different glyph shapes). A detected
  Word font (see below) maps to the closest of these five
  (`services/pdf/fontMetrics.ts`); unknown/unmapped fonts (Georgia, Verdana,
  Segoe UI, Aptos, ...) fall back to the nearest category, disclosed as an
  approximation. The same font files back the live preview via `@font-face`
  (`styles/embeddedFontFaces.ts`), so preview and PDF measure text
  identically instead of using two different font systems.
- **The source document's own page size, margins, and default font were
  never read at all** — the Word converter always fell back to
  DocMarkdown's generic A4/Normal-margins/11pt defaults. `services/word/
parseDocxLayout.ts` now reads the `.docx`'s own `word/document.xml`
  (`<w:sectPr>`) and `word/styles.xml` directly via `jszip` — independent of
  mammoth, which exposes neither — and `useWordDocument.ts` applies the
  detected page size/margins/orientation and dominant font/size
  automatically on load (snapped to the closest of A4/Letter/Legal/A5;
  margins apply exactly). This alone accounts for most cases of "one Word
  page becomes two PDF pages."
- **Explicit Word page breaks were silently dropped.** mammoth's style map
  already converted a manual page break into `<hr class="docx-page-break">`,
  but the PDF block parser treated every `<hr>` identically, so the forced
  break just became a horizontal line. `services/pdf/blocks.ts` now has a
  dedicated `page-break` block type, detected in `htmlToBlocks.ts` and
  honored as a real forced page turn in `pdfWriter.ts`.
- **Headings could be stranded alone at the bottom of a page.** `PdfWriter.
drawHeading` now reserves room for the heading plus at least one line of
  whatever follows before committing to draw it on the current page, moving
  it to a fresh page instead of orphaning it.

## Merge PDF tool

`/merge-pdf` combines multiple PDF files into one, in whatever order you
choose, entirely client-side.

- **Upload**: drag-and-drop or browse for any number of `.pdf` files at once,
  and add more to the list later. Files are validated independently — a
  batch of otherwise-valid files is never discarded just because one file in
  it is invalid; the rejected file(s) are listed with a specific reason
  instead.
- **Local inspection only**: each accepted file is read with
  `arrayBuffer()` and inspected locally with
  [pdf-lib](https://github.com/Hopding/pdf-lib) (`PDFDocument.load`) to
  determine its page count, title/author/creation-date metadata, and
  whether it's encrypted — never rendering or logging the document's actual
  text content. Nothing is uploaded at any point.
- **Ordering**: every file has a stable internal ID (not its filename, so two
  files named identically are always tracked as distinct entries). Reorder
  with native drag-and-drop, or with per-file **move up / down / to first /
  to last** buttons — the buttons are a first-class way to reorder, not a
  fallback, so keyboard-only and touch users aren't limited to drag gestures.
- **Per-file page ranges**: default to all pages, or enter a custom range
  like `1-3,6,8-10` (see [Page-range syntax](#page-range-syntax) below).
  Merging is blocked while any entered range is invalid.
- **Output settings**: a sanitized output filename (unsafe characters
  stripped, `.pdf` enforced, length-capped, empty input falls back to
  `merged-document.pdf`) and optional output metadata (title, author,
  subject, keywords) — suggested from the first ready file's own metadata,
  shown as a placeholder/one-click suggestion rather than applied silently.
- **Merging**: pages are copied from each source file, in the exact visible
  order, into a new PDF via pdf-lib, with a progress panel (reading →
  preparing → copying → finalizing → downloading → complete per file) and a
  guard against duplicate merge clicks. Files are processed **sequentially**,
  not in parallel, to keep peak memory bounded to roughly one source file at
  a time.
- **Result**: a success panel shows the final filename, source-file count,
  merged page count, and output file size, with **Download again** and
  **Start a new merge** actions. The merged PDF Blob is held only until you
  start a new merge, clear the files, or navigate away.

### Page-range syntax

```text
1-3        → pages 1, 2, 3
1,3,5      → pages 1, 3, 5
1-3,6,8-10 → pages 1, 2, 3, 6, 8, 9, 10
```

Ranges are validated against the file's actual page count and normalized to
ascending order. Rejected with a specific message for: invalid syntax,
reversed ranges (e.g. `5-2`), page numbers outside the document (e.g. `15`
in a 10-page file), duplicate page numbers (whether from a repeated number
or overlapping ranges, e.g. `1-3,2-4`), and empty input. Use **Reset to all
pages** to clear a custom range back to the default.

### Merge PDF limits

Configurable via environment variables (see
[Environment variables](#environment-variables)); defaults:

| Limit               | Default | Variable                              |
| ------------------- | ------- | ------------------------------------- |
| Max files per merge | 50      | `VITE_MAX_MERGE_PDF_FILES`            |
| Max size per file   | 50 MB   | `VITE_MAX_MERGE_PDF_FILE_SIZE_MB`     |
| Max combined size   | 250 MB  | `VITE_MAX_MERGE_PDF_COMBINED_SIZE_MB` |

### Merge PDF limitations

Being transparent about what pdf-lib-based merging does and doesn't
preserve:

- **Bookmarks are not preserved.** The source PDFs' outline/table-of-contents
  entries are not carried over into the merged document.
- **Encrypted PDFs are not supported at all**, not even with the correct
  password — there is no password-entry UI, and encrypted files are
  rejected during inspection with "Encrypted PDFs are not currently
  supported."
- **Digital signatures are invalidated.** Copying a signed PDF's pages into a
  new document breaks the signature, the same as any other tool that
  modifies a signed PDF. Don't merge a signed document if you need to keep
  its signature valid — merge the unsigned original instead.
- **Form fields and basic annotations are generally preserved** as faithfully
  as pdf-lib's page-copying allows, since pages are copied rather than
  flattened or rasterized — but interactive forms spanning multiple copied
  pages, or fields with complex calculated/scripted behavior, may lose
  values or become read-only after merging.
- **Document-level JavaScript, embedded file attachments, and layers (OCGs)
  are not preserved.**
- **Existing document metadata (title/author/etc.) from source files is not
  automatically carried over** — only the output metadata you explicitly set
  (or accept as a suggestion) is applied to the merged file.

## Technology stack

| Concern                  | Choice                                                                                                                                                                                                                  |
| ------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| UI framework             | React 19 + TypeScript (strict mode)                                                                                                                                                                                     |
| Build tool               | Vite 8                                                                                                                                                                                                                  |
| Styling                  | Tailwind CSS v4                                                                                                                                                                                                         |
| Routing                  | React Router 7 (lazy-loaded secondary routes)                                                                                                                                                                           |
| Markdown editor          | CodeMirror 6 (`@codemirror/state`/`view`/`commands`/`language`/`lang-markdown`/`search`/`autocomplete`)                                                                                                                 |
| Markdown parsing         | Marked, with a custom renderer for heading IDs/TOC/numbering, syntax highlighting, and the Mermaid code-block override                                                                                                  |
| Math rendering           | [KaTeX](https://katex.org/) — block `$$...$$` and inline `$...$`, rendered before Marked ever sees the source                                                                                                           |
| Diagram rendering        | [Mermaid](https://mermaid.js.org/) — async SVG in the live preview/HTML export, rasterized to PNG for PDF/DOCX export                                                                                                   |
| Word (.docx) parsing     | [mammoth](https://github.com/mtingers/mammoth.js) (browser build), DOCX XML → HTML                                                                                                                                      |
| DOCX page/font detection | [jszip](https://github.com/Stuk/jszip) — reads `sectPr`/`styles.xml` directly for layout fidelity                                                                                                                       |
| PDF merging/inspection   | [pdf-lib](https://github.com/Hopding/pdf-lib) — page copying, metadata, encryption check                                                                                                                                |
| Sanitization             | DOMPurify (every render path, no exceptions; `USE_PROFILES` covers html/svg/svgFilters/mathMl)                                                                                                                          |
| Syntax highlighting      | highlight.js (core + a curated language set)                                                                                                                                                                            |
| PDF generation           | jsPDF, driven by a hand-built layout engine (see below) — no `html2canvas` rasterization                                                                                                                                |
| DOCX generation          | [docx](https://github.com/dolanmiu/docx), reusing the same content-block model as PDF export                                                                                                                            |
| Metric-compatible fonts  | [Carlito/Caladea/Arimo/Tinos/Cousine](https://fonts.google.com/) via `@fontsource`, embedded in PDF export and the live preview for layout fidelity (see [Layout fidelity architecture](#layout-fidelity-architecture)) |
| Local persistence        | `localStorage`, versioned schema                                                                                                                                                                                        |
| Unit/component testing   | Vitest + React Testing Library                                                                                                                                                                                          |
| E2E testing              | Playwright                                                                                                                                                                                                              |
| Linting/formatting       | ESLint (flat config) + Prettier                                                                                                                                                                                         |

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
task lists/code/footnotes/escaping/link safety/page breaks/math/Mermaid
placeholders), the CodeMirror-based editor and its shared formatting-command
module, the formatting toolbar and toolbar/keyboard-shortcut parity, the
Beautify Markdown transform (including that it never touches fenced code
blocks and never mis-normalizes bold/italic emphasis into a list bullet),
KaTeX math extraction/restoration (including the Pandoc-style heuristic that
keeps prose like "$5 and $10" from being misread as math), Mermaid diagram
hydration and PNG rasterization for export (against injected fake renderers,
since jsdom can't run Mermaid's real layout engine), DOCX export (against
the real `docx` + `jszip` libraries — unzipping the generated file and
asserting real document XML content, not just "didn't throw"), the DOCX
theme/color-override resolution, HTML sanitization, plain-text extraction,
filename generation, file upload validation, local storage persistence,
settings JSON import/validation (including color-override validation),
template registry integrity, export builders (PDF/DOCX/HTML/Markdown/text),
the top action bar (workspace-mode selector, mobile tabs, undo/redo, the
more-options menu) and the export menu (including the keyboard-shortcut
`openSignal` contract), the upload interface (including drag state and error
handling), the clear-content confirmation flow, the settings panel
(including template switching, color overrides, and the reset/delete
confirmations), and the theme switcher.

For the Word to PDF converter, unit/component coverage additionally includes:
`.docx` file validation (extension/MIME/size/empty checks), legacy `.doc`
rejection, corrupt/password-protected file detection via ZIP/OLE signature
sniffing, DOCX→HTML parsing and title extraction (against a real fixture
`.docx`), Word HTML sanitization, plain-text extraction, image
include/exclude/compression handling (including a jsdom-safe timeout fallback
for image re-compression), PDF/HTML/text export builders, the upload zone
(drag state, keyboard activation, disabled state), the conversion-warnings
panel, the export panel, the settings panel (normalize-styling and
image-options visibility toggling), and page-level replace/clear/`.doc`-
rejection flows using a hand-built fixture `.docx`.

For Word-to-PDF **layout fidelity** specifically (`parseDocxLayout.test.ts`,
`fontMetrics.test.ts`, `embeddedFonts.test.ts`, `htmlToBlocks.test.ts`,
`pdfWriter.test.ts`, `wordLayoutFidelity.test.ts`): DOCX page-size/margin/
orientation extraction from hand-built in-memory `.docx` archives (via
`jszip`, no fixture files needed), per-field fallback from a paragraph style
to `docDefaults` when only one is redeclared, page-size-to-preset snapping,
DOCX→embedded-font name mapping, that every embedded font file decodes to
valid TrueType data and is actually usable by jsPDF for text measurement,
that an explicit Word page break survives HTML5's parser auto-closing an
open `<p>` before a block-level `<hr>` (the exact shape mammoth produces) and
still forces a real new page rather than becoming a horizontal rule, and
heading-orphan protection (a heading with only a sliver of space left is
pushed to a fresh page; one with room stays put; the very first heading of a
document never gets a spurious blank page before it). A dedicated
`e2e/fixtures/multi-page.docx` fixture (headings, an explicit page break, a
table, an inline image, and a `styles.xml` declaring Calibri 11pt — built
reproducibly via `scripts/generate-word-fixtures.mjs`) is run through the
_entire_ real pipeline end-to-end: parsed, exported, and the resulting PDF
re-opened with `pdf-lib` to assert its actual page count and page size
match what the source document specifies.

For the Merge PDF tool, unit/component coverage additionally includes: PDF
file validation (extension/MIME/empty/individual-size checks), batch-level
max-file-count and max-combined-size enforcement (accepting valid files from
a batch rather than discarding it all), duplicate-filename handling with
stable per-file IDs, PDF inspection (page count/metadata extraction, corrupt
and encrypted file detection — the latter via a mocked `pdf-lib` since
generating a real encrypted fixture wasn't practical here), page-range
parsing/normalization/duplicate/out-of-range detection, safe output-filename
generation, the generic array-reorder utility, the merge engine itself
(page order, output metadata, progress stages, non-empty Blob output,
corrupt-file error handling) against real generated PDF fixtures, the
non-sensitive preferences storage, the upload zone, the file-list item
(status/metadata/page-range display, remove/move buttons), the rejected-
files panel, the settings panel (including the suggested-metadata
buttons), the progress and result/error panels, and page-level upload/
reorder/page-range/remove/add-more/clear-all/merge flows.

Playwright covers: typing Markdown and seeing the live preview, uploading a
`.md` file, applying a template, changing page settings, refreshing to
restore a saved draft, exporting Markdown, exporting HTML, exporting PDF
(asserting a valid, non-empty `%PDF-` file), deleting local data, switching
between the editor-only/split/preview-only workspace modes, the top bar's
Preview shortcut, undo/redo, entering and exiting full-screen writing mode,
the Ctrl/Cmd+Enter and Ctrl/Cmd+Shift+P keyboard shortcuts, and using the
editor on a mobile viewport (Write/Preview/Style tabs).

For Word to PDF (`e2e/word-to-pdf.spec.ts`), Playwright covers: opening the
page, uploading a valid `.docx` and seeing the converted content in the
preview, changing page orientation, enabling "Normalize document styling",
exporting PDF (asserting a valid, non-empty `%PDF-` file), downloading
standalone HTML, replacing the current file, rejecting a legacy `.doc` file,
rejecting an oversized file, rejecting a corrupt file, clearing the document,
and using the converter on a mobile viewport (`e2e/mobile.spec.ts`).

For Merge PDF (`e2e/merge-pdf.spec.ts`), Playwright covers: opening the page,
uploading two valid PDFs and seeing their page counts, reversing the file
order, reordering without drag-and-drop (move to first/last), setting a
custom page range and confirming it blocks merging until valid, merging and
downloading a non-empty PDF (asserting both the `%PDF-` signature and the
actual merged page count via pdf-lib), removing one file, adding another
file, rejecting a non-PDF file while keeping the valid ones, rejecting an
oversized file, handling duplicate filenames as distinct entries, clearing
all files, and using the tool on a mobile viewport including reordering
(`e2e/mobile.spec.ts`).

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

| Variable                              | Purpose                                                                | Default                   |
| ------------------------------------- | ---------------------------------------------------------------------- | ------------------------- |
| `VITE_GITHUB_URL`                     | GitHub link shown in the header                                        | `https://github.com`      |
| `VITE_SITE_URL`                       | Canonical URL used for SEO meta tags                                   | `https://docmarkdown.app` |
| `VITE_MAX_UPLOAD_SIZE_MB`             | Max size for uploaded `.md`/`.txt` files                               | `5`                       |
| `VITE_MAX_WORD_UPLOAD_SIZE_MB`        | Max size for uploaded `.docx` files (Word to PDF converter)            | `10`                      |
| `VITE_MAX_MERGE_PDF_FILES`            | Max number of PDF files per merge                                      | `50`                      |
| `VITE_MAX_MERGE_PDF_FILE_SIZE_MB`     | Max size per individual PDF file (Merge PDF)                           | `50`                      |
| `VITE_MAX_MERGE_PDF_COMBINED_SIZE_MB` | Max combined size of all selected PDFs (Merge PDF)                     | `250`                     |
| `VITE_ENABLE_ANALYTICS`               | Enables the analytics abstraction (no-op until a provider is wired in) | `false`                   |

## Privacy architecture

- **No document upload.** Markdown parsing (Marked), sanitization
  (DOMPurify), syntax highlighting (highlight.js), and PDF layout (jsPDF) run
  entirely in the browser's JS engine. There is no API route, serverless
  function, or backend that receives document content in this codebase.
- **Local-only persistence.** Drafts, settings, and theme preference are
  stored in `localStorage` under one versioned key (`docmarkdown:state`),
  read and written only by `src/services/storage`.
- **File uploads never leave the browser.** Uploaded files (Markdown/text and
  Word `.docx`) are read via the `FileReader`/`arrayBuffer()` APIs directly
  into memory.
- **Word documents are never persisted.** Unlike the Markdown editor's draft,
  an uploaded `.docx` and its parsed HTML are kept only in React state for the
  lifetime of the tab — nothing is written to `localStorage`. Removing the
  document (Clear) or navigating away discards it; object URLs created for
  export downloads are revoked after use.
- **PDFs selected for merging are never persisted either.** The selected
  files, their inspected metadata, and the merged result Blob live only in
  React state; a refresh, "Clear all," or navigating away drops them for
  good. Only a few small, non-sensitive preferences (last output filename
  and metadata field values) are saved to `localStorage` — never the PDF
  files or their contents.
- **Sanitization is mandatory, not optional.** Every HTML render path
  (preview, HTML export, PDF text extraction) passes through
  `sanitizeHtml()` (DOMPurify), which also forces
  `rel="noopener noreferrer nofollow"` and `target="_blank"` on external
  links.
- **No remote fonts.** Typography uses bundled/system font stacks; PDF export
  uses jsPDF's built-in core fonts (Helvetica/Times/Courier), so nothing needs
  to be fetched or embedded.
- **No first-party analytics by default.** See [Environment variables](#environment-variables) —
  the analytics abstraction stays fully disabled unless a deployer opts in,
  and even then no provider is implemented out of the box.
- **Google AdSense.** The deployed site (`index.html`) loads the AdSense
  script (`pagead2.googlesyndication.com`) to display ads, and `public/ads.txt`
  declares the site's authorized ad-seller relationship (required by AdSense's
  publisher policies — see [AdSense Program Policies](https://support.google.com/adsense/answer/48182)).
  This is unrelated to document processing — your Markdown content still
  never leaves your browser — but it is a third-party script that can set
  cookies for ad personalization. Disclosed on `/privacy`; remove the
  `<script>` tag from `index.html` and `public/ads.txt` if you don't want ads
  in your own deployment.

See `/privacy` in the running app for the user-facing version of this policy.

### Content Security Policy guidance

DocMarkdown ships no CSP header itself (that's host-specific). Document
processing itself makes no network requests, so if you remove the AdSense
script (see above), a strict policy is easy to apply at your host/CDN:

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

With the AdSense script left in place, `script-src`/`connect-src`/`img-src`
need to additionally allow Google's ad domains (at minimum
`*.googlesyndication.com` and `*.doubleclick.net`; see
[Google's AdSense CSP guidance](https://support.google.com/adsense/answer/10399474)
for the current list).

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
- **Mermaid diagrams are rasterized to PNG for PDF and DOCX export**, since
  neither format's writer can embed live SVG — the standalone HTML export
  embeds real SVG instead. This means diagrams in a PDF/DOCX are a fixed-
  resolution raster image rather than infinitely crisp vector art; a
  diagram that fails to parse falls back to a plain text paragraph
  explaining the error rather than blocking the rest of the export.
- **DOCX export approximates a few things the same way PDF export does**:
  list markers are literal prefix text rather than Word's native numbering
  definitions (avoids the complexity/fragility of multi-level Word
  numbering XML), table column widths are distributed evenly rather than
  sized to content, and a blockquote's left accent rule is applied
  per-paragraph rather than as one continuous rule spanning the whole quote.

## Beautify Markdown limitations

The Beautify action is intentionally conservative — it fixes unambiguous
formatting issues without changing what your document means:

- It does **not** insert a space after a `#` that has no space at all
  (e.g. `#hashtag`), because per CommonMark that text isn't a heading in the
  first place; "fixing" it would silently turn plain text into a heading.
- It does **not** renumber ordered lists, normalize horizontal-rule style, or
  touch table column alignment — each of those can be an intentional
  authoring choice rather than an inconsistency.
- Content inside fenced code blocks (`` ` `` or `~~~`) is never modified,
  even if it looks like a heading or a list.

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
    layout/        Header, Footer, Hero (empty-state only), mobile nav, theme
                    switcher
    editor/         CodeMirror-based Markdown editor, formatting toolbar, top
                    action bar (mode selector, undo/redo, save status,
                    more-options menu), status bar, resizable split
    preview/        Paginated document preview, zoom controls (shared by both
                    the Markdown editor and Word to PDF converter)
    settings/       Page/typography/metadata/header-footer/content/color
                    settings (prop-driven where shared with the Word converter)
    export/         Export menu/progress UI
    guide/          Markdown guide example/rendered-output cards
    word/           Word to PDF UI: upload zone, document info, conversion
                    warnings, preview wrapper, settings panel, export panel
    merge-pdf/      Merge PDF UI: upload zone, ordered file list/item,
                    per-file metadata + page-range input, settings, summary,
                    progress, rejected-files and result/error panels
    common/         Icons, confirm dialog, loading fallback
  pages/           One component per route (see "Main pages" below)
  hooks/           useDocumentStats, useFileUpload, useMarkdownFormatting,
                   useRenderedMarkdown, usePreviewZoom, useMediaQuery,
                   useWordDocument, useWordFileDrop, useWordExport,
                   useMergePdfFiles, useMergePdfDrop, etc.
  services/
    markdown/       Marked configuration, footnotes, page breaks, math (KaTeX
                    extraction/restoration), Mermaid (placeholder + hydration
                    + rasterization for export), beautify, sanitize, plain-text
    docx/           DOCX export: theme/color-override resolution
                    (docxTheme.ts), content-block -> docx Paragraph/Table
                    conversion (blocksToDocx.ts), and orchestration
                    (docxExportService.ts) — reuses the same
                    htmlToBlocks/resolveImageDimensions pipeline as PDF export
    word/           DOCX validation, mammoth parsing, HTML sanitization,
                    plain-text extraction, image include/compress handling,
                    raw-XML page/font detection (parseDocxLayout.ts), and the
                    normalize-styling-aware font override (wordFontOverride.ts)
    pdf/            Block model, HTML->block parser, shared jsPDF layout
                    engine (`renderHtmlToPdf`) used by the Markdown/Word
                    converters, plus the Merge PDF engine (pdf-lib-based
                    inspection, page-range parsing, merging, output-filename
                    sanitizing, and resource cleanup); fontMetrics.ts +
                    embeddedFonts.ts (+ the generated embeddedFonts.generated.ts)
                    provide the metric-compatible fonts embedded in every
                    exported PDF for layout fidelity
    export/         HTML/Markdown/text export builders, the print service
                    (renders to a detached iframe and calls `window.print()`),
                    and orchestration for both Markdown and Word documents
    storage/        Versioned localStorage persistence + settings JSON I/O
                    (including color-override validation), plus small
                    non-sensitive Merge PDF UI preferences
    analytics/       Disabled-by-default analytics abstraction
  templates/       The five document templates (data + starter content)
  types/           Shared TypeScript types (settings, page, typography,
                   colors, word, mergePdf, ...)
  utils/           Small pure helpers (filename sanitizing, color, text,
                   generic array reorder, ...)
  styles/          Shared document content CSS (used by preview + HTML export);
                   embeddedFontFaces.ts declares the same metric-compatible
                   fonts as @font-face for the live preview, via `?url`
                   imports of the @fontsource woff2 files
e2e/               Playwright specs
  fixtures/         Small hand-built/generated .docx/.doc/.pdf fixtures used
                    by Word to PDF and Merge PDF unit + e2e tests (no
                    real-world/copyrighted content)
scripts/           One-off generator scripts for committed fixtures/assets —
                   rerun after changing what they generate:
                   generate-word-fixtures.mjs, generate-merge-pdf-fixtures.mjs,
                   generate-embedded-pdf-fonts.mjs
```

### Main pages

`/` Markdown editor · `/word-to-pdf` Word to PDF converter ·
`/merge-pdf` Merge PDF tool · `/templates` · `/markdown-guide` · `/privacy`
· `/terms` · `/about` · `/contact` · `*` 404.

## Troubleshooting

- **"Legacy .doc files are not supported."** Only the modern `.docx` (Office
  Open XML) format is supported. Open the file in Word (or a compatible
  editor) and use "Save As" → **Word Document (.docx)**, then re-upload.
- **"The document could not be read. It may be corrupted or
  password-protected."** DocMarkdown detects this from the file's binary
  signature before attempting to parse it. Password-protected/encrypted
  `.docx` files can't be read client-side without the password (there is
  nowhere to enter one), so remove protection in Word first
  (Review → Protect → Restrict Editing, or File → Info → Protect Document)
  and re-export as an unprotected `.docx`.
- **"This file is larger than the N MB upload limit."** Raise
  `VITE_MAX_WORD_UPLOAD_SIZE_MB` in your `.env` if you control the deployment
  and need to accept larger files; otherwise reduce the document's size
  (compress or remove large embedded images) and re-upload.
- **A table/image/layout doesn't look right after conversion.** See
  [What doesn't convert perfectly](#what-doesnt-convert-perfectly) — the
  conversion warnings panel (shown after a successful upload) lists anything
  the parser specifically couldn't map for your document.
- **Vitest can't resolve `mammoth`.** `mammoth`'s package.json `"browser"`
  field remap only applies to Vite's client build, not Vitest's Node-based
  test runner, so `vite.config.ts` aliases `mammoth` to
  `mammoth/mammoth.browser.js` specifically when `process.env.VITEST` is set.
  If you see `Could not find file in options` errors from mammoth in tests,
  confirm that alias is still present.
- **"Only PDF files are supported."** (Merge PDF) The file's extension isn't
  `.pdf`, or its browser-reported MIME type is set to something other than
  `application/pdf`. Confirm the file is actually a PDF and re-select it.
- **"This PDF could not be read. It may be corrupted or password-protected."**
  Merge PDF sniffs the `%PDF-` header before upload and fully parses the file
  with pdf-lib during inspection; either check can fail for a genuinely
  corrupted file, a non-PDF renamed to `.pdf`, or certain encrypted PDFs.
- **"Encrypted PDFs are not currently supported."** There is no password
  prompt anywhere in Merge PDF — remove the password/encryption from the PDF
  in another tool first (most PDF viewers offer a "remove security" or
  "save as unprotected" option when you have the password), then re-upload.
- **"You can merge up to 50 PDF files at a time." / "...exceed the 250 MB
  combined limit."** Raise `VITE_MAX_MERGE_PDF_FILES` /
  `VITE_MAX_MERGE_PDF_COMBINED_SIZE_MB` in your `.env` if you control the
  deployment, or merge in smaller batches (merge a first batch, download it,
  then add that result as one of the files in a second merge).
- **A signed PDF's signature shows as invalid after merging.** This is
  expected — see [Merge PDF limitations](#merge-pdf-limitations). Merging
  modifies the document, which necessarily invalidates any existing digital
  signature; merge the unsigned source instead if you need to re-sign
  afterward.
- **The exported Word-to-PDF layout still doesn't exactly match Word.** Some
  drift is unavoidable in a browser-based renderer (see
  [Layout fidelity architecture](#layout-fidelity-architecture)) — glyph
  shapes differ slightly even between metric-compatible fonts, and a handful
  of DOCX features (multi-column sections, floating/wrapped images, text
  boxes, headers/footers, tracked changes) aren't reproduced at all. If a
  specific document looks noticeably worse than expected, check the
  conversion-warnings panel first; if the font shown there seems wrong,
  the document may use a font outside the mapping table in
  `services/pdf/fontMetrics.ts`, which falls back to a generic sans-serif
  approximation.
- **Vitest can't resolve `@fontsource/*` `?url` imports, or the embedded-fonts
  test is slow.** `styles/embeddedFontFaces.ts` imports raw `.woff2` files
  from `node_modules/@fontsource/*` with Vite's `?url` suffix, which needs no
  special config (Vite's client types cover it) — if this breaks after a
  dependency upgrade, confirm the five `@fontsource/*` packages are still
  installed. `services/pdf/embeddedFonts.generated.ts` is a large (~1.2MB)
  generated file consumed via a dynamic `import()`, so the first test that
  touches PDF export in a given worker process pays a one-time decode cost —
  expected, not a bug.

## Future improvement ideas

- Per-token syntax-highlight coloring in PDF and DOCX export (would require
  mapping highlight.js token spans into styled PDF text runs / docx `TextRun`s)
- Native Word numbering definitions for DOCX list export, instead of literal
  marker-prefix text — would need a `numbering.xml` configuration per list,
  deferred to avoid the fragility of multi-level Word numbering XML for a
  first pass
- Embedding Mermaid diagrams as native DOCX `ImageRun` SVG-with-PNG-fallback
  (the `docx` library supports it) instead of PNG-only, once broader Word
  version support for inline SVG is confirmed
- IME/multi-cursor editing polish in the CodeMirror editor for CJK input and
  power-user multi-selection workflows
- Word to PDF: content-aware table column sizing and clickable internal PDF
  links, matching the same future work already planned for Markdown (below)
- Word to PDF: content-aware table column sizing and clickable internal PDF
  links, matching the same future work already planned for Markdown (below)
- Word to PDF: an opt-in, best-effort mapping of DOCX section/multi-column
  layout into the PDF output, clearly labeled as approximate
- Word to PDF: extracting each inline image's real display size from the
  DOCX's own `wp:extent` (currently images always render at full content
  width, scaled by aspect ratio) — deferred because correlating XML drawing
  order to mammoth's emitted `<img>` order reliably (especially when an
  image mammoth can't process is silently dropped, shifting the count) needs
  more validation than this pass had room for; a safe version would only
  apply extracted sizes when the two counts match exactly and fall back to
  today's behavior otherwise
- Word to PDF: reading real DOCX table column widths (`w:tblGrid`) instead of
  splitting columns evenly, and reading header/footer text from
  `word/header*.xml`/`word/footer*.xml` (mammoth doesn't process either) to
  pre-fill the existing header/footer settings fields
- Word to PDF: per-run font/size/color fidelity — mammoth intentionally
  discards direct character formatting by design, so only the document's one
  dominant/default font and size are currently detected and applied; getting
  per-run fidelity would mean parsing `word/document.xml`'s run properties
  directly instead of going through mammoth for formatting (still using it
  for structure), a substantially larger undertaking
- Word to PDF: multi-section documents (different page size/margins/
  orientation partway through one .docx) currently apply only the last
  section's geometry to the whole export — the same simplification already
  disclosed for "section-specific margins" in the formatting-limitations list
- Merge PDF: an opt-in bookmark/outline builder derived from each source
  file's own top-level headings or filenames, since bookmarks aren't
  currently carried over from the source PDFs
- Merge PDF: moving inspection and/or merging into a Web Worker if real-world
  usage shows main-thread jank on very large batches — skipped for the
  initial implementation since it would add non-trivial complexity (message
  passing, structured cloning of Files) without a demonstrated need yet
- A compact, homepage-visible "tools" summary of Markdown/Word/Merge PDF that
  doesn't compress the fixed-height converter workspace on small screens
  (the current homepage relies on the header nav and a couple of inline
  cross-links in the hero instead, after a card-grid version was found to
  visually squeeze the mobile editor)
- Content-aware PDF and DOCX table column sizing
- Clickable internal PDF links for the table of contents and footnotes
- IndexedDB-backed multi-document draft history (currently a single draft)
- A pluggable, opt-in privacy-friendly analytics provider (Plausible/Umami)
  behind the existing `VITE_ENABLE_ANALYTICS` flag
- Collaborative/shareable read-only document links (would require explicit,
  clearly-disclosed opt-in cloud storage — a deliberate non-goal for now)
