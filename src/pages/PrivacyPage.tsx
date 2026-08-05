import { Link } from 'react-router-dom'

import { usePageMeta } from '@/hooks/usePageMeta'

export default function PrivacyPage() {
  usePageMeta({
    title: 'Privacy Policy',
    description:
      'How DocMarkdown handles your documents and data: everything stays in your browser.',
    path: '/privacy',
  })

  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-10 sm:px-6 lg:px-8">
      <h1 className="text-2xl font-bold text-neutral-900 dark:text-white sm:text-3xl">
        Privacy Policy
      </h1>
      <p className="mt-2 text-sm text-neutral-500 dark:text-neutral-400">Last updated: 2026</p>

      <div className="prose-sm mt-8 flex flex-col gap-6 text-neutral-700 dark:text-neutral-300">
        <section>
          <h2 className="text-lg font-semibold text-neutral-900 dark:text-white">
            Markdown processing happens in your browser
          </h2>
          <p className="mt-2">
            DocMarkdown parses, renders, and exports your Markdown entirely on your device using
            JavaScript running in your browser. Your document text is never transmitted to a
            DocMarkdown server, because DocMarkdown does not operate a server that receives document
            content.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-neutral-900 dark:text-white">
            Files are not uploaded anywhere
          </h2>
          <p className="mt-2">
            When you upload a <code>.md</code> or <code>.txt</code> file, or drag one into the
            editor, it is read directly by your browser using the File API. The file's contents
            populate the editor locally and are not sent to any server as part of this process.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-neutral-900 dark:text-white">
            Word document conversion also stays on your device
          </h2>
          <p className="mt-2">
            The Word to PDF converter reads your <code>.docx</code> file and converts it to HTML
            entirely in your browser's memory using a local JavaScript library — the file is never
            uploaded to a server, sent to a third-party conversion API, or transmitted anywhere.
            Extracted content is not saved to local storage; it exists only in memory for as long as
            the tab is open, and is cleared immediately when you remove, replace, or navigate away
            from the document.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-neutral-900 dark:text-white">
            Drafts and settings are stored only in your browser
          </h2>
          <p className="mt-2">
            Your current Markdown, selected template, page and typography settings, and theme
            preference are saved to your browser's local storage so you can pick up where you left
            off after a refresh. This data stays on your device and is not synced to any account or
            cloud service, because DocMarkdown does not have accounts or cloud storage in this
            version.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-neutral-900 dark:text-white">
            You can delete your local data at any time
          </h2>
          <p className="mt-2">
            Open the Settings panel from the converter page and choose{' '}
            <strong>Delete all local data</strong> to permanently remove your saved draft, settings,
            and theme preference from this browser. You can also clear this data using your
            browser's own site-data controls.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-neutral-900 dark:text-white">
            No account is required
          </h2>
          <p className="mt-2">
            DocMarkdown does not require sign-up, sign-in, or any personal information to use its
            core features.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-neutral-900 dark:text-white">Analytics</h2>
          <p className="mt-2">
            No first-party analytics are enabled by default. If a future deployment of this project
            enables a privacy-friendly analytics provider, that will be reflected in this policy and
            gated behind an explicit configuration flag, not enabled silently.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-neutral-900 dark:text-white">Advertising</h2>
          <p className="mt-2">
            This site uses Google AdSense to display ads. Third-party vendors, including Google,
            use cookies (such as the Google DoubleClick cookie) to serve ads based on a user's
            prior visits to this and other websites. Google's use of advertising cookies enables it
            and its partners to serve ads based on your visit to this site and/or other sites on
            the internet. AdSense may also collect information such as your IP address, device
            type, and approximate location as part of this process.
          </p>
          <p className="mt-2">
            This is separate from, and unrelated to, your Markdown content — AdSense has no access
            to what you write, upload, or export, since that data never leaves your browser in the
            first place (see above). We do not control these third-party cookies, and this policy
            does not apply to them.
          </p>
          <p className="mt-2">
            You can opt out of personalized advertising by visiting{' '}
            <a
              href="https://adssettings.google.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-accent-600 underline dark:text-accent-400"
            >
              Google Ads Settings
            </a>
            , or opt out of a third-party vendor's use of cookies for personalized advertising by
            visiting{' '}
            <a
              href="https://optout.aboutads.info"
              target="_blank"
              rel="noopener noreferrer"
              className="text-accent-600 underline dark:text-accent-400"
            >
              www.aboutads.info
            </a>
            . Learn more about how Google uses data at{' '}
            <a
              href="https://policies.google.com/technologies/partner-sites"
              target="_blank"
              rel="noopener noreferrer"
              className="text-accent-600 underline dark:text-accent-400"
            >
              How Google uses information from sites that use our services
            </a>
            .
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-neutral-900 dark:text-white">Questions</h2>
          <p className="mt-2">
            If you have questions about this policy, visit the{' '}
            <Link to="/contact" className="text-accent-600 underline dark:text-accent-400">
              Contact page
            </Link>
            .
          </p>
        </section>
      </div>
    </div>
  )
}
