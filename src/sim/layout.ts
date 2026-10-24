// Szerelőlap geometria. Egység: méter, origó a lap bal alsó sarka, a lap síkja z = 0.
export const BOARD = { w: 1.5, h: 1.1, t: 0.018 }

export type Vec2 = [number, number]

export type BoxKind = 'switch' | 'lamp' | 'socket'
export type DeviceType =
  | 'sw101'
  | 'sw105'
  | 'sw106'
  | 'sw107'
  | 'pb'
  | 'lampMotion'
  | 'lamp'
  | 'socket'

export interface Mount {
  id: string
  label: string
  kind: BoxKind
  pos: Vec2
  /** melyik szerelvényt várja a feladat */
  expect: DeviceType
}

export const BOX_SIZE = 0.07 // falon kívüli szerelvény 70×70 mm
export const LAMP_R = 0.055

export const DIST = { center: [0.24, 0.8] as Vec2, w: 0.34, h: 0.3, d: 0.1 }
/** Falon kívüli egyfázisú mérőszekrény (III. vizsgarész) */
export const CAB = { center: [1.18, 0.8] as Vec2, w: 0.32, h: 0.36, d: 0.12 }

export type EndCut = 90 | 45
export interface TrunkPiece {
  id: string
  label: string
  /** középvonal kezdete és vége */
  a: Vec2
  b: Vec2
  width: number
  ends: [EndCut, EndCut]
  height: number
  len: number // a helyes vágási hossz (gérvágásnál a leghosszabb élen mérve), m
}

export interface Layout {
  mounts: Mount[]
  pieces: TrunkPiece[]
  nodes: Record<string, Vec2>
  edges: [string, string][]
}

const MAIN = 0.04
const STUB = 0.025

function piece(id: string, label: string, a: Vec2, b: Vec2, width: number, ends: [EndCut, EndCut], len?: number): TrunkPiece {
  return { id, label, a, b, width, ends, height: width === MAIN ? 0.025 : 0.02, len: len ?? Math.hypot(b[0] - a[0], b[1] - a[1]) }
}

/** A dobozél, ahol a leágazó csatorna a szerelvényhez ér */
function mountEdge(m: Mount, mainY: number): number {
  const half = m.kind === 'lamp' ? LAMP_R : BOX_SIZE / 2
  return m.pos[1] > mainY ? m.pos[1] - half : m.pos[1] + half
}

export interface LayoutSpec {
  /** fő vízszintes csatorna középvonala */
  mainY: number
  /** bal vége (90°) */
  x0: number
  mounts: Mount[]
  /** ha megadod, a fő csatorna jobb vége 45°-os gérrel lefordul ehhez a szerelvényhez */
  cornerMount?: string
  /** mérőszekrény a lapon: leágazó csatorna az aljától a fő csatornáig */
  cabinet?: boolean
}

/**
 * Feladat-elrendezésből csatornadarabokat és vezetékútvonal-gráfot épít:
 * fő vízszintes csatorna, az elosztóból leágazás, minden szerelvényhez T-leágazás,
 * opcionálisan sarok 45°-os gérvágással.
 */
export function buildLayout(spec: LayoutSpec): Layout {
  const { mainY, x0, mounts } = spec
  const top = mainY + MAIN / 2
  const bot = mainY - MAIN / 2
  const corner = mounts.find((m) => m.id === spec.cornerMount)
  const xEnd = corner ? corner.pos[0] : Math.max(...mounts.map((m) => m.pos[0])) + 0.06
  const pieces: TrunkPiece[] = []
  const nodes: Record<string, Vec2> = {}
  const edges: [string, string][] = []

  if (corner) {
    pieces.push(piece('H1', 'Fő vízszintes csatorna 40×25', [x0, mainY], [xEnd, mainY], MAIN, [90, 45], xEnd + MAIN / 2 - x0))
    const edge = mountEdge(corner, mainY)
    pieces.push(piece('VS', `Függőleges sarokdarab (${corner.id}) 40×25`, [xEnd, mainY], [xEnd, edge], MAIN, [45, 90], Math.abs(top - edge)))
  } else pieces.push(piece('H1', 'Fő vízszintes csatorna 40×25', [x0, mainY], [xEnd, mainY], MAIN, [90, 90]))

  const distBottom = DIST.center[1] - DIST.h / 2
  pieces.push(piece('E', 'Elosztó leágazás 40×25', [DIST.center[0], distBottom], [DIST.center[0], top], MAIN, [90, 90]))
  nodes.dist = [DIST.center[0], distBottom]

  // csomópontok a fő csatornán, x szerint rendezve
  const xs = new Set<number>([DIST.center[0]])
  if (spec.cabinet) {
    const cb = CAB.center[1] - CAB.h / 2
    pieces.push(piece('C', 'Mérőszekrény leágazás 40×25', [CAB.center[0], cb], [CAB.center[0], top], MAIN, [90, 90]))
    nodes.cab = [CAB.center[0], cb]
    xs.add(CAB.center[0])
  }
  for (const m of mounts) if (m !== corner) xs.add(m.pos[0])
  if (corner) xs.add(xEnd)
  const sorted = [...xs].sort((a, b) => a - b)
  const key = (x: number) => (corner && x === xEnd ? 'corner' : x === DIST.center[0] ? 'e' : spec.cabinet && x === CAB.center[0] ? 'c' : `n${Math.round(x * 1000)}`)
  for (const x of sorted) nodes[key(x)] = [x, mainY]
  for (let i = 1; i < sorted.length; i++) edges.push([key(sorted[i - 1]), key(sorted[i])])
  edges.push(['dist', 'e'])
  if (spec.cabinet) edges.push(['cab', 'c'])

  for (const m of mounts) {
    const edge = mountEdge(m, mainY)
    nodes[m.id] = [m.pos[0], edge]
    if (m === corner) {
      edges.push(['corner', m.id])
      continue
    }
    const up = m.pos[1] > mainY
    pieces.push(piece(`p${m.id}`, `Leágazás ${m.id} felé 25×20`, [m.pos[0], up ? top : bot], [m.pos[0], edge], STUB, [90, 90]))
    edges.push([key(m.pos[0]), m.id])
  }
  return { mounts, pieces, nodes, edges }
}

export const STOCK_LEN = 2.0 // 2 m-es szálak

/** Mérőszalag illesztési pontjai: csatornaélek, sarkok, a lap sarkai */
export function snapPoints(layout: Layout): Vec2[] {
  const pts: Vec2[] = []
  for (const p of layout.pieces) {
    const vertical = Math.abs(p.a[0] - p.b[0]) < 1e-6
    const hw = p.width / 2
    for (const e of [p.a, p.b]) {
      if (vertical) pts.push([e[0] - hw, e[1]], [e[0] + hw, e[1]])
      else pts.push([e[0], e[1] - hw], [e[0], e[1] + hw])
    }
    if (p.ends[1] === 45) pts.push([p.b[0] + hw, p.b[1] + hw])
  }
  pts.push([0, 0], [BOARD.w, 0], [0, BOARD.h])
  return pts
}

export function routePath(layout: Layout, from: string, to: string): Vec2[] {
  const adj: Record<string, string[]> = {}
  for (const [a, b] of layout.edges) {
    ;(adj[a] ??= []).push(b)
    ;(adj[b] ??= []).push(a)
  }
  const prev: Record<string, string | null> = { [from]: null }
  const q = [from]
  while (q.length) {
    const n = q.shift()!
    if (n === to) break
    for (const m of adj[n] ?? []) if (!(m in prev)) ((prev[m] = n), q.push(m))
  }
  const path: Vec2[] = []
  for (let n: string | null = to; n; n = prev[n] ?? null) path.unshift(layout.nodes[n])
  return path
}

// DIN-sín: a készülékek balról jobbra, modulszélesség szerint egymás mellé pattintva
export const MODULE_W = 0.018
export const DIN_Y = DIST.center[1] - 0.01
export const DIN_X0 = DIST.center[0] - DIST.w / 2 + 0.03
