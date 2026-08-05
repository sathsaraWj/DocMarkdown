/** Immutably moves the item at `fromIndex` to `toIndex`, shifting items between the two. Out-of-range indices return the array unchanged. */
export function moveItem<T>(items: readonly T[], fromIndex: number, toIndex: number): T[] {
  if (
    fromIndex < 0 ||
    fromIndex >= items.length ||
    toIndex < 0 ||
    toIndex >= items.length ||
    fromIndex === toIndex
  ) {
    return [...items]
  }

  const next = [...items]
  const [moved] = next.splice(fromIndex, 1)
  next.splice(toIndex, 0, moved as T)
  return next
}

export function moveItemToStart<T>(items: readonly T[], fromIndex: number): T[] {
  return moveItem(items, fromIndex, 0)
}

export function moveItemToEnd<T>(items: readonly T[], fromIndex: number): T[] {
  return moveItem(items, fromIndex, items.length - 1)
}
