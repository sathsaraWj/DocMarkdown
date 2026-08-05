import type { DocumentSettings } from '@/types/settings'
import type { DocumentTemplate } from '@/types/template'
import { FONT_FAMILY_OPTIONS } from '@/types/typography'

function getFontStack(id: DocumentSettings['typography']['fontFamily']): {
  body: string
  heading: string
} {
  const option = FONT_FAMILY_OPTIONS.find((f) => f.id === id) ?? FONT_FAMILY_OPTIONS[0]
  return { body: option?.bodyStack ?? 'sans-serif', heading: option?.headingStack ?? 'sans-serif' }
}

/**
 * Produces the CSS that styles rendered Markdown content, scoped to
 * `.doc-content` by default. Shared verbatim between the live preview and
 * the standalone HTML export so both always match the selected template.
 *
 * Pass a distinct `scopeClass` when multiple differently-styled previews
 * (e.g. one per template on the Templates page) render on the same page at
 * once — otherwise every instance's CSS custom properties would collide on
 * the shared `.doc-content` selector and only the last one would win.
 */
export interface ContentFontOverride {
  body?: string
  heading?: string
}

export function buildContentCss(
  settings: DocumentSettings,
  template: DocumentTemplate,
  scopeClass = 'doc-content',
  fontOverride?: ContentFontOverride,
): string {
  const { typography, content } = settings
  const { style } = template
  const bucketFonts = getFontStack(typography.fontFamily)
  const fonts = {
    body: fontOverride?.body ?? bucketFonts.body,
    heading: fontOverride?.heading ?? bucketFonts.heading,
  }
  const baseSize = typography.bodyFontSize
  const scale = typography.headingScale

  const headingSizes: Record<number, number> = {
    1: baseSize * Math.pow(scale, 5),
    2: baseSize * Math.pow(scale, 4),
    3: baseSize * Math.pow(scale, 3),
    4: baseSize * Math.pow(scale, 2),
    5: baseSize * scale,
    6: baseSize * 1.05,
  }

  const headingRules = [1, 2, 3, 4, 5, 6]
    .map(
      (level) => `
  .doc-content h${level} {
    font-size: ${headingSizes[level]?.toFixed(2) ?? baseSize}pt;
    font-weight: ${style.headingWeight};
    text-transform: ${style.headingUppercase ? 'uppercase' : 'none'};
    letter-spacing: ${style.headingUppercase ? '0.03em' : 'normal'};
    color: var(--doc-heading-color);
    font-family: var(--doc-heading-font);
    line-height: 1.25;
    margin: ${level === 1 ? '0' : '1.6em'} 0 0.6em;
  }`,
    )
    .join('\n')

  const css = `
  .doc-content {
    --doc-accent: ${style.accentColor};
    --doc-heading-color: ${style.headingColor};
    --doc-body-color: ${style.bodyColor};
    --doc-muted-color: ${style.mutedColor};
    --doc-border-color: ${style.borderColor};
    --doc-code-bg: ${style.codeBackground};
    --doc-table-header-bg: ${style.tableHeaderBackground};
    --doc-body-font: ${fonts.body};
    --doc-heading-font: ${fonts.heading};
    font-family: var(--doc-body-font);
    font-size: ${baseSize}pt;
    line-height: ${typography.lineHeight};
    color: var(--doc-body-color);
    word-wrap: break-word;
  }
  .doc-content > *:first-child { margin-top: 0; }
  ${headingRules}
  .doc-content h1 {
    ${style.ruleAfterH1 ? 'padding-bottom: 0.4em; border-bottom: 2px solid var(--doc-border-color);' : ''}
  }
  .doc-content .heading-number {
    color: var(--doc-muted-color);
    font-weight: 500;
    margin-right: 0.4em;
  }
  .doc-content p {
    margin: 0 0 ${typography.paragraphSpacing}em;
  }
  .doc-content a {
    color: ${content.styleLinksForPrint ? 'var(--doc-accent)' : 'inherit'};
    text-decoration: ${content.styleLinksForPrint ? 'underline' : 'none'};
    text-underline-offset: 0.15em;
  }
  .doc-content strong { font-weight: 700; }
  .doc-content em { font-style: italic; }
  .doc-content del { opacity: 0.7; }
  .doc-content ul, .doc-content ol {
    margin: 0 0 ${typography.paragraphSpacing}em;
    padding-left: 1.6em;
  }
  .doc-content ul { list-style: disc; }
  .doc-content ol { list-style: decimal; }
  .doc-content ul ul { list-style: circle; }
  .doc-content li { margin: 0.25em 0; }
  .doc-content li > ul, .doc-content li > ol { margin: 0.25em 0; }
  .doc-content li.task-list-item, .doc-content li:has(> input[type="checkbox"]) {
    list-style: none;
    margin-left: -1.4em;
  }
  .doc-content input[type="checkbox"] {
    margin-right: 0.5em;
    accent-color: var(--doc-accent);
  }
  .doc-content blockquote {
    margin: 0 0 ${typography.paragraphSpacing}em;
    padding: 0.4em 1em;
    border-left: 3px solid var(--doc-accent);
    color: var(--doc-muted-color);
    background: color-mix(in srgb, var(--doc-accent) 6%, transparent);
  }
  .doc-content code {
    font-family: 'JetBrains Mono', ui-monospace, 'Cascadia Code', Menlo, Consolas, monospace;
    font-size: ${typography.codeFontSize}pt;
    background: ${content.codeBlockBackgrounds ? 'var(--doc-code-bg)' : 'transparent'};
    padding: 0.1em 0.35em;
    border-radius: 4px;
  }
  .doc-content .code-block {
    margin: 0 0 ${typography.paragraphSpacing}em;
    border-radius: 8px;
    overflow: hidden;
    border: 1px solid var(--doc-border-color);
  }
  .doc-content .code-block-lang {
    font-size: 0.75em;
    color: var(--doc-muted-color);
    background: var(--doc-table-header-bg);
    padding: 0.3em 0.8em;
    font-family: ui-monospace, monospace;
  }
  .doc-content .code-block pre {
    margin: 0;
    padding: 0.9em 1em;
    overflow-x: auto;
    background: ${content.codeBlockBackgrounds ? 'var(--doc-code-bg)' : 'transparent'};
  }
  .doc-content .code-block code {
    background: transparent;
    padding: 0;
    font-size: ${typography.codeFontSize}pt;
    line-height: 1.5;
  }
  .doc-content table {
    border-collapse: collapse;
    width: 100%;
    margin: 0 0 ${typography.paragraphSpacing}em;
    font-size: 0.95em;
  }
  .doc-content th, .doc-content td {
    border: 1px solid var(--doc-border-color);
    padding: 0.5em 0.75em;
    text-align: left;
  }
  .doc-content th {
    background: var(--doc-table-header-bg);
    font-weight: 700;
  }
  .doc-content hr {
    border: none;
    border-top: 1px solid var(--doc-border-color);
    margin: 1.6em 0;
  }
  .doc-content img {
    max-width: 100%;
    height: auto;
    border-radius: 6px;
  }
  .doc-content .footnotes {
    margin-top: 2em;
    font-size: 0.85em;
    color: var(--doc-muted-color);
  }
  .doc-content .footnotes hr { margin-bottom: 1em; }
  .doc-content .footnote-ref a { text-decoration: none; }
  .doc-content .footnote-backref { text-decoration: none; margin-left: 0.4em; }
  .doc-content .markdown-error {
    color: #b91c1c;
    background: #fee2e2;
    padding: 0.75em 1em;
    border-radius: 6px;
  }
`

  return scopeClass === 'doc-content' ? css : css.replaceAll('.doc-content', `.${scopeClass}`)
}
