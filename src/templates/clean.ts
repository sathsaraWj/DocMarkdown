import type { DocumentTemplate } from '@/types/template'

export const cleanTemplate: DocumentTemplate = {
  id: 'clean',
  name: 'Clean',
  description: 'A minimal, neutral layout that puts your words first with no visual noise.',
  bestFor: 'General-purpose documents, notes, and everyday writing.',
  style: {
    accentColor: '#3b66f5',
    headingColor: '#111827',
    bodyColor: '#1f2937',
    mutedColor: '#6b7280',
    borderColor: '#e5e7eb',
    codeBackground: '#f3f4f6',
    fontFamily: 'sans',
    headingWeight: 700,
    headingUppercase: false,
    ruleAfterH1: false,
    tableHeaderBackground: '#f3f4f6',
  },
  starterContent: `# Clean Template

A minimal layout with neutral typography, suitable for general documents.

## Why use this template

- Distraction-free reading
- Works for notes, letters, and short reports
- Clear hierarchy without heavy styling

> Keep it simple. Say what you mean.

Start writing below and watch the preview update in real time.
`,
}
