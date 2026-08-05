import type { ContentBlock, ListItemBlock } from './blocks'

function loadAspectRatio(dataUrl: string): Promise<number | undefined> {
  return new Promise((resolve) => {
    const img = new Image()
    const timeout = setTimeout(() => resolve(undefined), 4000)
    img.onload = () => {
      clearTimeout(timeout)
      resolve(img.naturalWidth > 0 ? img.naturalHeight / img.naturalWidth : undefined)
    }
    img.onerror = () => {
      clearTimeout(timeout)
      resolve(undefined)
    }
    img.src = dataUrl
  })
}

async function resolveInBlock(block: ContentBlock): Promise<ContentBlock> {
  if (block.type === 'image') {
    if (!block.src.startsWith('data:image/')) return block
    const aspectRatio = await loadAspectRatio(block.src)
    return { ...block, aspectRatio }
  }
  if (block.type === 'blockquote') {
    return { ...block, blocks: await resolveImageDimensions(block.blocks) }
  }
  if (block.type === 'list') {
    const items: ListItemBlock[] = await Promise.all(
      block.items.map(async (item) => ({
        ...item,
        children: await resolveImageDimensions(item.children),
      })),
    )
    return { ...block, items }
  }
  return block
}

/** Walks the block tree resolving natural aspect ratios for any embedded data-URI images before layout. */
export async function resolveImageDimensions(blocks: ContentBlock[]): Promise<ContentBlock[]> {
  return Promise.all(blocks.map(resolveInBlock))
}
