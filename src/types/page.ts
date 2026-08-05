export type PageSize = 'A4' | 'Letter' | 'Legal' | 'A5'
export type Orientation = 'portrait' | 'landscape'
export type MarginPreset = 'narrow' | 'normal' | 'wide' | 'custom'

export interface Margins {
  top: number
  right: number
  bottom: number
  left: number
}

export interface PageSettings {
  size: PageSize
  orientation: Orientation
  marginPreset: MarginPreset
  margins: Margins
}

/** Page dimensions in millimeters, portrait orientation. */
export const PAGE_DIMENSIONS_MM: Record<PageSize, { width: number; height: number }> = {
  A4: { width: 210, height: 297 },
  Letter: { width: 215.9, height: 279.4 },
  Legal: { width: 215.9, height: 355.6 },
  A5: { width: 148, height: 210 },
}

export const MARGIN_PRESETS_MM: Record<Exclude<MarginPreset, 'custom'>, Margins> = {
  narrow: { top: 12, right: 12, bottom: 12, left: 12 },
  normal: { top: 25, right: 20, bottom: 25, left: 20 },
  wide: { top: 30, right: 40, bottom: 30, left: 40 },
}

export const DEFAULT_PAGE_SETTINGS: PageSettings = {
  size: 'A4',
  orientation: 'portrait',
  marginPreset: 'normal',
  margins: MARGIN_PRESETS_MM.normal,
}

export function getPageDimensionsMm(settings: Pick<PageSettings, 'size' | 'orientation'>): {
  width: number
  height: number
} {
  const base = PAGE_DIMENSIONS_MM[settings.size]
  return settings.orientation === 'landscape'
    ? { width: base.height, height: base.width }
    : { width: base.width, height: base.height }
}
