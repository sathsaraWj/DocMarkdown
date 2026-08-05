import { describe, expect, it } from 'vitest'

import { htmlToBlocks } from '@/services/pdf/htmlToBlocks'

describe('htmlToBlocks page breaks', () => {
  it('turns an explicit docx page-break <hr> into a page-break block, not a generic hr', () => {
    const blocks = htmlToBlocks('<p>Before</p><hr class="docx-page-break"><p>After</p>')
    expect(blocks.map((b) => b.type)).toEqual(['paragraph', 'page-break', 'paragraph'])
  })

  it('still treats a plain hr as a generic horizontal rule', () => {
    const blocks = htmlToBlocks('<p>Before</p><hr><p>After</p>')
    expect(blocks.map((b) => b.type)).toEqual(['paragraph', 'hr', 'paragraph'])
  })

  it('detects a page break in the exact markup mammoth produces (an hr inside its own <p>)', () => {
    // The HTML5 parsing algorithm auto-closes an open <p> before a
    // block-level <hr>, hoisting it back out as a sibling — so this
    // (mammoth's actual output shape) still reaches the top-level HR check,
    // just with empty paragraphs left behind from the auto-close on both
    // sides of the hoisted <hr>.
    const blocks = htmlToBlocks('<p>Before</p><p><hr class="docx-page-break" /></p><p>After</p>')
    expect(blocks.map((b) => b.type)).toEqual([
      'paragraph',
      'paragraph',
      'page-break',
      'paragraph',
      'paragraph',
    ])
  })
})
