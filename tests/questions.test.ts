import { describe, expect, test } from 'bun:test'
import { QUESTIONS } from '../src/sim/questions'

describe('kérdésbank', () => {
  test('egyedi azonosítók', () => {
    const ids = QUESTIONS.map((q) => q.id)
    expect(new Set(ids).size).toBe(ids.length)
  })

  test('minden kérdés válaszolható', () => {
    for (const q of QUESTIONS) {
      const n = q.options?.length ?? 0
      if (q.kind === 'single') expect(typeof q.answer === 'number' && q.answer >= 0 && q.answer < n, q.id).toBe(true)
      if (q.kind === 'multi') {
        const a = q.answer as number[]
        expect(Array.isArray(a) && a.length > 0 && a.every((i) => i >= 0 && i < n), q.id).toBe(true)
      }
      if (q.kind === 'order') expect(n >= 3, q.id).toBe(true)
      if (q.kind === 'number') expect(Number.isFinite(q.value), q.id).toBe(true)
      expect(q.explain.length > 10, q.id).toBe(true)
    }
  })

  test('nincs két azonos kérdésszöveg', () => {
    const norm = QUESTIONS.map((q) => q.q.toLowerCase().replace(/\s+/g, ' ').trim())
    expect(new Set(norm).size).toBe(norm.length)
  })
})
