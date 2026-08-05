import type { DocumentTemplate } from '@/types/template'

export const academicTemplate: DocumentTemplate = {
  id: 'academic',
  name: 'Academic',
  description: 'Conservative typography with clear author and document metadata display.',
  bestFor: 'Assignments, research papers, and academic submissions.',
  style: {
    accentColor: '#7c2d12',
    headingColor: '#1c1917',
    bodyColor: '#292524',
    mutedColor: '#78716c',
    borderColor: '#d6d3d1',
    codeBackground: '#f5f5f4',
    fontFamily: 'serif',
    headingWeight: 600,
    headingUppercase: false,
    ruleAfterH1: false,
    tableHeaderBackground: '#efebe9',
  },
  starterContent: `# The Effects of Sleep on Learning Retention

**Author:** Your Name
**Course:** PSYC 301 — Cognitive Psychology
**Date:** March 2026

## Abstract

A brief summary (150–250 words) describing the research question, method,
and key findings of this paper.

## 1. Introduction

Background context and the research question this paper addresses.

## 2. Method

Description of participants, materials, and procedure.

## 3. Results

> Sleep-deprived participants scored 23% lower on next-day recall tasks
> compared to the control group (p < 0.01).

## 4. Discussion

Interpretation of results and their implications.

## References

1. Author, A. (2024). *Title of source*. Publisher.
2. Author, B. (2023). *Title of source*. Publisher.
`,
}
