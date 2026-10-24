import { BOARD, type Vec2 } from '../sim/layout'

export function fitDistance(aspect: number, fov: number) {
  const t = Math.tan((fov * Math.PI) / 360)
  return Math.max((BOARD.h + 0.12) / 2 / t, (BOARD.w + 0.1) / 2 / (t * aspect))
}

export function focusTarget(point: Vec2, distance: number) {
  const x = Math.max(0.08, Math.min(BOARD.w - 0.08, point[0]))
  const y = Math.max(0.08, Math.min(BOARD.h - 0.08, point[1]))
  return { target: [x, y, 0] as const, position: [x, y + 0.025, distance] as const }
}
