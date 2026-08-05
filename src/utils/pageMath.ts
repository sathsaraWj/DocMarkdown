export const MM_TO_PX = 96 / 25.4

export function mmToPx(mm: number): number {
  return mm * MM_TO_PX
}
