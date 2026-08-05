export type RgbTuple = [number, number, number]

const HEX_RE = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i

export function hexToRgb(hex: string): RgbTuple {
  const match = HEX_RE.exec(hex.trim())
  if (!match) return [0, 0, 0]
  const [, r, g, b] = match
  return [parseInt(r ?? '00', 16), parseInt(g ?? '00', 16), parseInt(b ?? '00', 16)]
}
