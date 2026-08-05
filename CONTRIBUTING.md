# Contributing to DocMarkdown

Thanks for your interest in improving DocMarkdown. This project is a
privacy-focused, fully client-side Markdown-to-PDF converter — please keep
that principle in mind for any change you propose: **no document content
should ever be sent to a server.**

## Getting started

```bash
npm install
npm run dev
```

The app runs at `http://localhost:5173`.

## Development workflow

1. Create a branch from `main`.
2. Make your change, adding or updating tests as appropriate.
3. Run the full check suite before opening a PR:

   ```bash
   npm run lint
   npm run typecheck
   npm run test
   npm run build
   npm run test:e2e
   ```

4. Open a pull request describing what changed and why.

## Project conventions

- **TypeScript strict mode.** Avoid `any`; prefer precise types from `src/types`.
- **No new backend dependencies.** This app has no server component by
  design. Features that would require one (accounts, cloud sync, remote
  storage) are out of scope for this repository.
- **No remote fonts or scripts.** Exports must render identically offline;
  don't add `@font-face` rules pointing at a CDN or any third-party script.
- **Sanitize before render.** Any HTML derived from Markdown must go through
  `services/markdown/sanitize.ts` (DOMPurify) before it reaches the DOM.
- **Formatting.** Run `npm run format` before committing; CI checks
  `npm run format:check`.
- **Commits.** Write clear, imperative commit messages (e.g. "Add landscape
  support to PDF export").

## Folder structure

See the "Project structure" section of `README.md` for an overview of where
things live (`components/`, `services/`, `hooks/`, `types/`, `templates/`).

## Reporting bugs

Please include:

- The Markdown input that triggers the issue (redacted if sensitive — remember
  nothing you paste here leaves your machine, but the same is not true of a
  bug report you send to us)
- Expected vs. actual behavior
- Browser and OS version
- Whether the issue affects the preview, a specific export format, or both

## Code of conduct

Be respectful and constructive. Disagreements about implementation are fine;
personal attacks are not.
