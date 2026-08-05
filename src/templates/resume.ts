import type { DocumentTemplate } from '@/types/template'

export const resumeTemplate: DocumentTemplate = {
  id: 'resume',
  name: 'Resume',
  description: 'A compact layout with strong heading hierarchy, built for Markdown-based CVs.',
  bestFor: 'Resumes, CVs, and one-page professional profiles.',
  style: {
    accentColor: '#0f766e',
    headingColor: '#0f172a',
    bodyColor: '#1f2937',
    mutedColor: '#6b7280',
    borderColor: '#e5e7eb',
    codeBackground: '#f3f4f6',
    fontFamily: 'sans',
    headingWeight: 700,
    headingUppercase: true,
    ruleAfterH1: true,
    tableHeaderBackground: '#e6f2f1',
  },
  starterContent: `# Jordan Rivera

Product Engineer · jordan@example.com · +1 (555) 010-1234 · Portland, OR

## Summary

Full-stack engineer with 6 years of experience building privacy-focused web
applications. Strong background in TypeScript, React, and developer tooling.

## Experience

**Senior Software Engineer** — Northwind Software (2022–Present)
- Led migration of a legacy dashboard to a modern React/TypeScript stack
- Reduced page load time by 40% through code splitting and caching
- Mentored two junior engineers through structured code review

**Software Engineer** — Bluebird Labs (2019–2022)
- Built and shipped a customer-facing analytics product used by 200+ teams
- Owned the design system used across five internal products

## Skills

TypeScript · React · Node.js · PostgreSQL · Accessibility · Testing

## Education

**B.S. Computer Science** — State University (2015–2019)
`,
}
