// Colours for the gallery room. theme.ts asks not to add an eighth colour, so
// every tone here is a *mix* of the existing seven tokens — the gilt is ochre
// lifted toward paper and sunk toward ink, the salon wall is terracotta sunk
// into ink, and so on. Change a token in theme.ts and the room follows.

const PAPER = '#F4F1EA'
const PAPER2 = '#EBE6DB'
const PAPER3 = '#DED8CA'
const INK = '#17130E'
const INK2 = '#4A4238'
const INK3 = '#8C8375'
const ACCENT = '#A8442A'
const ACCENT2 = '#C98A3E'

/** The theme's tokens, for the few drawings that mix their own tones. */
export const TOKENS = { PAPER, PAPER2, PAPER3, INK, INK2, INK3, ACCENT, ACCENT2 } as const

function parse(hex: string): [number, number, number] {
  const n = parseInt(hex.slice(1), 16)
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255]
}

/** `t` of the way from `a` to `b`. */
export function mix(a: string, b: string, t: number): string {
  const [ar, ag, ab] = parse(a)
  const [br, bg, bb] = parse(b)
  const ch = (x: number, y: number) =>
    Math.round(x + (y - x) * t)
      .toString(16)
      .padStart(2, '0')
  return `#${ch(ar, br)}${ch(ag, bg)}${ch(ab, bb)}`
}

export type WallKey = 'salao' | 'galeria'

export interface RoomPalette {
  label: string
  wall: string
  wallLow: string // below the dado rail
  wallShade: string // top and bottom falloff
  shadeStrength: number
  /** Woven damask on the upper wall — the old-master salon look. */
  damask: boolean
  lightPool: string
  lightPoolOpacity: number
  baseboard: string
  baseboardEdge: string
  dado: boolean
  floor: string
  floorFar: string
  floorLine: string
  floorSheen: string
  cornice: string
  corniceEdge: string
  annotation: string
  figures: readonly string[]
  figureShadow: string
}

export const GILT = {
  light: mix(ACCENT2, PAPER, 0.55),
  mid: ACCENT2,
  deep: mix(ACCENT2, INK, 0.38),
  shadow: mix(ACCENT2, INK, 0.62),
  bead: mix(ACCENT2, PAPER, 0.75),
}

export const LINEN = { face: PAPER2, edge: PAPER3 }
export const MAT = { face: PAPER, edge: PAPER3, moulding: INK, mouldingEdge: INK2 }
export const LEATHER = { top: mix(ACCENT, INK, 0.5), face: mix(ACCENT, INK, 0.66), button: mix(ACCENT, INK, 0.82) }
export const WOOD = { face: mix(ACCENT2, INK, 0.66), edge: mix(ACCENT2, INK, 0.5) }
export const BRASS = { face: ACCENT2, light: GILT.light }
export const VELVET = mix(ACCENT, INK, 0.3)
export const LABEL = { face: PAPER, line: INK3 }

export const ROOMS: Record<WallKey, RoomPalette> = {
  salao: {
    label: 'Salão',
    wall: mix(ACCENT, INK, 0.42),
    wallLow: mix(ACCENT, INK, 0.52),
    wallShade: INK,
    shadeStrength: 1,
    damask: true,
    lightPool: mix(ACCENT2, PAPER, 0.6),
    lightPoolOpacity: 0.3,
    baseboard: mix(ACCENT, INK, 0.72),
    baseboardEdge: mix(ACCENT, INK, 0.5),
    dado: true,
    floor: mix(ACCENT2, INK, 0.58),
    floorFar: mix(ACCENT2, INK, 0.7),
    floorLine: INK,
    floorSheen: mix(ACCENT2, PAPER, 0.5),
    cornice: mix(ACCENT, INK, 0.62),
    corniceEdge: mix(ACCENT2, INK, 0.3),
    annotation: PAPER2,
    figures: [INK, mix(INK, INK2, 0.5), mix(INK, ACCENT, 0.15), INK2],
    figureShadow: INK,
  },
  galeria: {
    label: 'Galeria',
    wall: PAPER,
    wallLow: PAPER,
    wallShade: INK2,
    shadeStrength: 0.4,
    damask: false,
    lightPool: '#FFFFFF',
    lightPoolOpacity: 0.55,
    baseboard: PAPER3,
    baseboardEdge: PAPER2,
    dado: false,
    floor: mix(ACCENT2, PAPER, 0.42),
    floorFar: mix(ACCENT2, INK, 0.08),
    floorLine: mix(ACCENT2, INK, 0.45),
    floorSheen: PAPER,
    cornice: PAPER2,
    corniceEdge: PAPER3,
    annotation: INK2,
    figures: [INK, INK2, mix(INK, ACCENT, 0.3), mix(INK2, INK3, 0.4)],
    figureShadow: INK,
  },
}
