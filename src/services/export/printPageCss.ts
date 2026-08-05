import { getPageDimensionsMm } from '@/types/page'
import type { PageSettings } from '@/types/page'

/** @page rules so the standalone HTML export prints at the same size/margins as the PDF export. */
export function buildPrintPageCss(page: PageSettings): string {
  const { width, height } = getPageDimensionsMm(page)
  const { margins } = page
  return `
  @page {
    size: ${width}mm ${height}mm;
    margin: ${margins.top}mm ${margins.right}mm ${margins.bottom}mm ${margins.left}mm;
  }
  @media print {
    body { background: #fff; }
    .doc-page-frame { box-shadow: none !important; border: none !important; }
  }
`
}
