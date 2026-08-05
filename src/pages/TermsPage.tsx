import { usePageMeta } from '@/hooks/usePageMeta'

export default function TermsPage() {
  usePageMeta({
    title: 'Terms of Use',
    description: 'Terms governing the use of the DocMarkdown Markdown document studio.',
    path: '/terms',
  })

  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-10 sm:px-6 lg:px-8">
      <h1 className="text-2xl font-bold text-neutral-900 dark:text-white sm:text-3xl">
        Terms of Use
      </h1>
      <p className="mt-2 text-sm text-neutral-500 dark:text-neutral-400">Last updated: 2026</p>

      <div className="mt-8 flex flex-col gap-6 text-neutral-700 dark:text-neutral-300">
        <section>
          <h2 className="text-lg font-semibold text-neutral-900 dark:text-white">
            Acceptance of terms
          </h2>
          <p className="mt-2">
            By using DocMarkdown, you agree to these Terms of Use. If you do not agree, please do
            not use the application.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-neutral-900 dark:text-white">The service</h2>
          <p className="mt-2">
            DocMarkdown is a client-side tool that converts Markdown you provide into PDF, HTML,
            Markdown, or plain-text output. It is provided "as is," without a backend service, user
            accounts, or guaranteed uptime commitments.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-neutral-900 dark:text-white">Your content</h2>
          <p className="mt-2">
            You retain all rights to the Markdown and documents you create or upload. Because
            processing happens locally in your browser, DocMarkdown does not receive, store, or
            claim any rights to your content.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-neutral-900 dark:text-white">No warranty</h2>
          <p className="mt-2">
            DocMarkdown is provided without warranties of any kind, express or implied, including
            fitness for a particular purpose. Export formatting (particularly PDF layout) is
            produced by an automated rendering pipeline and may not perfectly match every possible
            Markdown document; always review exported files before relying on them.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-neutral-900 dark:text-white">
            Limitation of liability
          </h2>
          <p className="mt-2">
            To the fullest extent permitted by law, DocMarkdown's contributors are not liable for
            any damages arising from the use of, or inability to use, this application, including
            loss of data stored only in your browser's local storage.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-neutral-900 dark:text-white">Changes</h2>
          <p className="mt-2">
            These terms may be updated as the project evolves. Continued use of DocMarkdown after
            changes are published constitutes acceptance of the revised terms.
          </p>
        </section>
      </div>
    </div>
  )
}
