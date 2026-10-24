import { generateCalc } from './generated'
import { QUESTIONS, type Question, type Topic } from './questions'

// KKK 8.12: központi interaktív vizsga, 90 perc, négy témakör rögzített súllyal
export const TOPICS: { id: Topic; name: string; weight: number; count: number }[] = [
  { id: 'anyag', name: 'Anyag- és alkatrészismeret', weight: 20, count: 8 },
  { id: 'technologia', name: 'Technológia', weight: 20, count: 8 },
  { id: 'szamitas', name: 'Számítás', weight: 20, count: 8 },
  { id: 'biztonsag', name: 'Villamos biztonság', weight: 40, count: 16 },
]
export const EXAM_MINUTES = 90

export type Answer = number | number[] | string | undefined

function shuffle<T>(a: T[], rnd = Math.random): T[] {
  const b = [...a]
  for (let i = b.length - 1; i > 0; i--) {
    const j = Math.floor(rnd() * (i + 1))
    ;[b[i], b[j]] = [b[j], b[i]]
  }
  return b
}

export interface ExamItem {
  q: Question
  /** a megjelenítési sorrend: optOrder[k] = az eredeti opció indexe */
  optOrder: number[]
}

/** a számítás témakörben ennyi feladat minden húzásnál új számokkal készül */
export const GENERATED_CALC = 4

/**
 * Feladatsor húzása a témakörök darabszáma szerint, kevert opciókkal.
 * A még nem látott (`seen`-ben nem szereplő) bankkérdések elöl; ha elfogytak, a régebbiek is jöhetnek.
 */
export function drawExam(rnd = Math.random, seen: ReadonlySet<string> = new Set()): ExamItem[] {
  const item = (q: Question): ExamItem => ({ q, optOrder: shuffle(q.options?.map((_, i) => i) ?? [], rnd) })
  return TOPICS.flatMap((t) => {
    const gen = t.id === 'szamitas' ? generateCalc(GENERATED_CALC, rnd) : []
    const pool = QUESTIONS.filter((q) => q.topic === t.id)
    const fresh = shuffle(pool.filter((q) => !seen.has(q.id)), rnd)
    const old = shuffle(pool.filter((q) => seen.has(q.id)), rnd)
    return [...gen, ...fresh, ...old].slice(0, t.count).map(item)
  })
}

/** Egy válasz helyes-e; a válasz mindig az EREDETI opcióindexekben értendő */
export function isCorrect(q: Question, a: Answer): boolean {
  if (a === undefined) return false
  if (q.kind === 'single') return a === q.answer
  if (q.kind === 'multi') {
    const want = [...(q.answer as number[])].sort().join()
    return Array.isArray(a) && [...a].sort().join() === want
  }
  if (q.kind === 'order') return Array.isArray(a) && a.length === q.options!.length && a.every((v, i) => v === i)
  const n = Number(String(a).replace(',', '.').replace(/\s/g, ''))
  return Number.isFinite(n) && Math.abs(n - q.value!) <= (q.tol ?? 0)
}

export function scoreExam(items: ExamItem[], answers: Record<string, Answer>) {
  const topics = TOPICS.map((t) => {
    const its = items.filter((i) => i.q.topic === t.id)
    const max = its.reduce((a, i) => a + i.q.points, 0)
    const got = its.reduce((a, i) => a + (isCorrect(i.q, answers[i.q.id]) ? i.q.points : 0), 0)
    return { ...t, max, got, ratio: max ? got / max : 0 }
  })
  const pct = Math.round(topics.reduce((a, t) => a + t.weight * t.ratio, 0))
  return { topics, pct, passed: pct >= 40 }
}
