import type { DocumentTemplate } from '@/types/template'

export const businessTemplate: DocumentTemplate = {
  id: 'business',
  name: 'Business Report',
  description: 'A formal layout with a strong title area and professional heading structure.',
  bestFor: 'Proposals, business reports, executive summaries, and client-facing documents.',
  style: {
    accentColor: '#1d4ed8',
    headingColor: '#0b1533',
    bodyColor: '#1f2937',
    mutedColor: '#5b6472',
    borderColor: '#d6dbe4',
    codeBackground: '#f1f4f9',
    fontFamily: 'serif',
    headingWeight: 700,
    headingUppercase: true,
    ruleAfterH1: true,
    tableHeaderBackground: '#dbe4f3',
  },
  starterContent: `# Quarterly Business Report

**Prepared for:** Executive Leadership Team
**Author:** Your Name
**Date:** Q1 2026

## Executive Summary

A concise overview of the report's purpose, key findings, and recommended
actions.

## Key Metrics

| Metric        | Q4 2025 | Q1 2026 | Change |
| ------------- | ------- | ------- | ------ |
| Revenue       | $1.2M   | $1.4M   | +16.7% |
| Active Users  | 8,400   | 9,850   | +17.3% |
| Churn Rate    | 4.1%    | 3.6%    | -0.5pp |

## Recommendations

1. Expand the onboarding program
2. Increase investment in customer success
3. Revisit pricing tiers for enterprise accounts

> Decisions made this quarter should prioritize retention over acquisition.
`,
}
