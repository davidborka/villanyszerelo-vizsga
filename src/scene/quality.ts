export interface Quality {
  level: number
  dpr: number
  ao: boolean
}

const LEVELS: Quality[] = [
  { level: 0, dpr: 1, ao: false },
  { level: 1, dpr: 1.25, ao: true },
  { level: 2, dpr: 1.5, ao: true },
]

export function qualityStep(level: number, direction: 'decline' | 'incline'): Quality {
  const next = Math.max(0, Math.min(LEVELS.length - 1, level + (direction === 'decline' ? -1 : 1)))
  return LEVELS[next]
}
