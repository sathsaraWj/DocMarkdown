import { describe, expect, it } from 'vitest'

import { moveItem, moveItemToEnd, moveItemToStart } from '@/utils/reorder'

describe('moveItem', () => {
  it('moves an item forward', () => {
    expect(moveItem(['a', 'b', 'c', 'd'], 0, 2)).toEqual(['b', 'c', 'a', 'd'])
  })

  it('moves an item backward', () => {
    expect(moveItem(['a', 'b', 'c', 'd'], 3, 1)).toEqual(['a', 'd', 'b', 'c'])
  })

  it('returns an equivalent array when fromIndex equals toIndex', () => {
    const input = ['a', 'b', 'c']
    expect(moveItem(input, 1, 1)).toEqual(input)
  })

  it('does not mutate the input array', () => {
    const input = ['a', 'b', 'c']
    moveItem(input, 0, 2)
    expect(input).toEqual(['a', 'b', 'c'])
  })

  it('ignores out-of-range indices', () => {
    const input = ['a', 'b', 'c']
    expect(moveItem(input, -1, 1)).toEqual(input)
    expect(moveItem(input, 0, 5)).toEqual(input)
  })
})

describe('moveItemToStart', () => {
  it('moves the item to index 0', () => {
    expect(moveItemToStart(['a', 'b', 'c', 'd'], 2)).toEqual(['c', 'a', 'b', 'd'])
  })
})

describe('moveItemToEnd', () => {
  it('moves the item to the last index', () => {
    expect(moveItemToEnd(['a', 'b', 'c', 'd'], 1)).toEqual(['a', 'c', 'd', 'b'])
  })
})
