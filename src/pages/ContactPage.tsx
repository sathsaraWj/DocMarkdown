import { useState } from 'react'
import type { FormEvent } from 'react'

import { usePageMeta } from '@/hooks/usePageMeta'

const CONTACT_EMAIL = 'hello@docmarkdown.app'

export default function ContactPage() {
  usePageMeta({
    title: 'Contact',
    description: 'Get in touch about DocMarkdown, the privacy-focused Markdown document studio.',
    path: '/contact',
  })

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState('')

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const subject = encodeURIComponent(`DocMarkdown: message from ${name || 'a visitor'}`)
    const body = encodeURIComponent(`${message}\n\n— ${name}${email ? ` (${email})` : ''}`)
    window.location.href = `mailto:${CONTACT_EMAIL}?subject=${subject}&body=${body}`
  }

  return (
    <div className="mx-auto w-full max-w-2xl px-4 py-10 sm:px-6 lg:px-8">
      <h1 className="text-2xl font-bold text-neutral-900 dark:text-white sm:text-3xl">Contact</h1>
      <p className="mt-2 text-neutral-600 dark:text-neutral-300">
        Questions, bug reports, or feedback are welcome. This form opens your email client with your
        message pre-filled — nothing is sent to a DocMarkdown server.
      </p>

      <form onSubmit={handleSubmit} className="mt-8 flex flex-col gap-4">
        <div className="flex flex-col gap-1">
          <label
            htmlFor="contact-name"
            className="text-sm font-medium text-neutral-700 dark:text-neutral-200"
          >
            Name
          </label>
          <input
            id="contact-name"
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-500 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-100"
          />
        </div>
        <div className="flex flex-col gap-1">
          <label
            htmlFor="contact-email"
            className="text-sm font-medium text-neutral-700 dark:text-neutral-200"
          >
            Email (optional)
          </label>
          <input
            id="contact-email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-500 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-100"
          />
        </div>
        <div className="flex flex-col gap-1">
          <label
            htmlFor="contact-message"
            className="text-sm font-medium text-neutral-700 dark:text-neutral-200"
          >
            Message
          </label>
          <textarea
            id="contact-message"
            required
            rows={5}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className="rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-500 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-100"
          />
        </div>
        <button
          type="submit"
          className="self-start rounded-md bg-accent-600 px-4 py-2 text-sm font-semibold text-white hover:bg-accent-700"
        >
          Open in email client
        </button>
      </form>

      <p className="mt-8 text-sm text-neutral-500 dark:text-neutral-400">
        Prefer to email directly? Reach us at{' '}
        <a
          href={`mailto:${CONTACT_EMAIL}`}
          className="text-accent-600 underline dark:text-accent-400"
        >
          {CONTACT_EMAIL}
        </a>
        .
      </p>
    </div>
  )
}
