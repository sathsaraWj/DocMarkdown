import type { DocumentTemplate } from '@/types/template'

export const technicalTemplate: DocumentTemplate = {
  id: 'technical',
  name: 'Technical',
  description:
    'Optimized for code samples and developer documentation, with a clear heading hierarchy and styled tables.',
  bestFor: 'READMEs, API docs, technical specs, and engineering runbooks.',
  style: {
    accentColor: '#0ea5a3',
    headingColor: '#0f172a',
    bodyColor: '#1e293b',
    mutedColor: '#64748b',
    borderColor: '#cbd5e1',
    codeBackground: '#eef2f6',
    fontFamily: 'sans',
    headingWeight: 700,
    headingUppercase: false,
    ruleAfterH1: true,
    tableHeaderBackground: '#e2e8f0',
  },
  starterContent: `# Project Name

A one-line description of what this project does.

## Installation

\`\`\`bash
npm install example-package
\`\`\`

## Usage

\`\`\`javascript
import { run } from 'example-package'

run({ verbose: true })
\`\`\`

## API Reference

| Option    | Type      | Default | Description             |
| --------- | --------- | ------- | ------------------------ |
| \`verbose\` | boolean   | false   | Enables detailed logging |
| \`timeout\` | number    | 5000    | Timeout in milliseconds  |

## Notes

- Requires Node.js 18+
- See \`CONTRIBUTING.md\` for development setup
`,
}
