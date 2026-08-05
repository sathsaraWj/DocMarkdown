import { GuideEntry } from '@/components/guide/GuideEntry'
import { usePageMeta } from '@/hooks/usePageMeta'
import { TEMPLATES } from '@/templates'
import { buildContentCss } from '@/styles/documentContentCss'
import { DEFAULT_DOCUMENT_SETTINGS } from '@/types/settings'

const GUIDE_ITEMS = [
  {
    title: 'Headings',
    description: 'Use one to six hash symbols to create heading levels one through six.',
    example: '# Heading 1\n## Heading 2\n### Heading 3',
  },
  {
    title: 'Emphasis',
    description: 'Wrap text in asterisks for italics or bold, and tildes for strikethrough.',
    example: '*italic text*\n\n**bold text**\n\n~~strikethrough text~~',
  },
  {
    title: 'Lists',
    description:
      'Use dashes for unordered lists and numbers for ordered lists. Indent with two spaces to nest.',
    example: '- First item\n- Second item\n  - Nested item\n\n1. Step one\n2. Step two',
  },
  {
    title: 'Links',
    description: 'Wrap link text in square brackets, followed by the URL in parentheses.',
    example: '[DocMarkdown](https://example.com)',
  },
  {
    title: 'Images',
    description:
      'Same as links, with a leading exclamation mark. The bracket text becomes the alt text.',
    example: '![A scenic mountain view](https://example.com/mountain.jpg)',
  },
  {
    title: 'Blockquotes',
    description: 'Start a line with a greater-than sign to create a quoted block.',
    example: '> Good writing is clear thinking made visible.',
  },
  {
    title: 'Code',
    description:
      'Use backticks for inline code, or triple backticks for a fenced code block with optional language.',
    example:
      'Use `npm install` to add a package.\n\n```javascript\nfunction greet() {\n  return "hi"\n}\n```',
  },
  {
    title: 'Tables',
    description: 'Separate columns with pipes and use a dashed row to mark the header.',
    example: '| Name | Role |\n| ---- | ---- |\n| Ada  | Engineer |\n| Grace | Researcher |',
  },
  {
    title: 'Task lists',
    description: 'Use square brackets inside a list item to create a checklist.',
    example: '- [x] Write the draft\n- [ ] Get feedback\n- [ ] Publish',
  },
  {
    title: 'Horizontal rules',
    description: 'Three or more hyphens on their own line create a dividing line.',
    example: 'Section one\n\n---\n\nSection two',
  },
]

export default function MarkdownGuidePage() {
  usePageMeta({
    title: 'Markdown Guide',
    description:
      'An interactive guide to Markdown syntax with live examples and rendered previews.',
    path: '/markdown-guide',
  })

  const contentCss = buildContentCss(DEFAULT_DOCUMENT_SETTINGS, TEMPLATES.clean)

  return (
    <div className="mx-auto w-full max-w-4xl px-4 py-10 sm:px-6 lg:px-8">
      <style>{contentCss}</style>
      <header className="mb-8 max-w-2xl">
        <h1 className="text-2xl font-bold text-neutral-900 dark:text-white sm:text-3xl">
          Markdown Guide
        </h1>
        <p className="mt-2 text-neutral-600 dark:text-neutral-300">
          A quick reference for the Markdown syntax DocMarkdown supports, with live examples you can
          copy straight into the editor.
        </p>
      </header>

      <div className="flex flex-col gap-6">
        {GUIDE_ITEMS.map((item) => (
          <GuideEntry key={item.title} {...item} />
        ))}
      </div>
    </div>
  )
}
