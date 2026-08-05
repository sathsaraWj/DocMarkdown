import { Link } from 'react-router-dom'

import { usePageMeta } from '@/hooks/usePageMeta'

export default function AboutPage() {
  usePageMeta({
    title: 'About',
    description:
      'DocMarkdown is a privacy-focused Markdown document studio that runs entirely in your browser.',
    path: '/about',
  })

  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-10 sm:px-6 lg:px-8">
      <h1 className="text-2xl font-bold text-neutral-900 dark:text-white sm:text-3xl">
        About DocMarkdown
      </h1>

      <div className="mt-6 flex flex-col gap-6 text-neutral-700 dark:text-neutral-300">
        <p>
          DocMarkdown is a Markdown editor that turns your writing into clean, professional PDF,
          DOCX, HTML, or plain-text documents — directly in your browser. There is no backend, no
          account, and no upload step: your Markdown is written, rendered, and exported entirely on
          your device.
        </p>

        <section>
          <h2 className="text-lg font-semibold text-neutral-900 dark:text-white">
            Why we built it
          </h2>
          <p className="mt-2">
            Most Markdown document tools require uploading your content to a server. For README
            files, personal notes, resumes, and internal reports, that's an unnecessary trade-off.
            DocMarkdown does everything locally, so sensitive drafts never leave your machine.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-neutral-900 dark:text-white">
            What you can do
          </h2>
          <ul className="mt-2 list-disc space-y-1 pl-5">
            <li>Write Markdown in a full code-editor experience with a live, paginated preview</li>
            <li>Render tables, syntax-highlighted code, Mermaid diagrams, and math notation</li>
            <li>Choose from five professionally designed templates and customize document colors</li>
            <li>Customize page size, margins, typography, and headers/footers</li>
            <li>Export to PDF, DOCX, standalone HTML, Markdown, or plain text — or print directly</li>
            <li>Keep working offline — drafts and settings save to your browser automatically</li>
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-neutral-900 dark:text-white">Built with</h2>
          <p className="mt-2">
            React, TypeScript, Vite, and Tailwind CSS for the interface; CodeMirror 6 for the
            editor; Marked and DOMPurify for safe Markdown rendering; highlight.js for syntax
            highlighting; KaTeX for math and Mermaid for diagrams; and jsPDF and docx for document
            generation — all running client-side.
          </p>
        </section>

        <p>
          Read more about how your data is handled on the{' '}
          <Link to="/privacy" className="text-accent-600 underline dark:text-accent-400">
            Privacy page
          </Link>
          .
        </p>
      </div>
    </div>
  )
}
