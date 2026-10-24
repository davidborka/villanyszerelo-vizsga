import { beforeEach, expect, test } from 'bun:test'
import { qualityStep } from '../src/scene/quality'
import { fitDistance, focusTarget } from '../src/scene/cameraMath'
import { soundEvents } from '../src/scene/sfx'
import { useGame } from '../src/sim/store'

// a hangosztályozó tesztjei üres játékállapotból indulnak, függetlenül a többi tesztfájl sorrendjétől
beforeEach(() => useGame.getState().start('nyariKonyha', 'vizsga'))

test('quality fallback lowers pixel ratio and disables ambient occlusion', () => {
  expect(qualityStep(2, 'decline')).toEqual({ level: 1, dpr: 1.25, ao: true })
  expect(qualityStep(1, 'decline')).toEqual({ level: 0, dpr: 1, ao: false })
  expect(qualityStep(0, 'decline')).toEqual({ level: 0, dpr: 1, ao: false })
})

test('quality recovery restores effects gradually without overshooting', () => {
  expect(qualityStep(0, 'incline')).toEqual({ level: 1, dpr: 1.25, ao: true })
  expect(qualityStep(2, 'incline')).toEqual({ level: 2, dpr: 1.5, ao: true })
})

test('board fit accounts for both height and narrow aspect ratios', () => {
  expect(fitDistance(2, 45)).toBeCloseTo(1.4725, 3)
  expect(fitDistance(0.8, 45)).toBeCloseTo(2.4143, 3)
})

test('focus targets stay within the mounting board', () => {
  const low = focusTarget([-0.2, 0.4], 0.42)
  const high = focusTarget([1.7, 1.3], 0.32)
  expect(low.target).toEqual([0.08, 0.4, 0])
  expect(low.position[1]).toBeCloseTo(0.425)
  expect(high.target).toEqual([1.42, 1.02, 0])
  expect(high.position[2]).toBe(0.32)
})

test('sound classifier distinguishes cutting, mounting, and wire connection', () => {
  const base = useGame.getState()
  const cut = { len: 1, ends: [90, 90] as [90, 90], deburred: false, mounted: false, leveled: false }
  expect(soundEvents(base, { ...base, cuts: { H1: cut } })).toEqual(['saw'])
  expect(soundEvents(base, { ...base, cuts: { H1: { ...cut, mounted: true } } })).toEqual(['drill'])
  expect(soundEvents(base, { ...base, wires: [{ id: 'W1', a: 'bet.L', b: 'N.0', color: 'barna', cs: 1.5, strip: 10 }] })).toEqual(['tick'])
})

test('sound classifier distinguishes manual DIN clacks from trips', () => {
  const base = { ...useGame.getState(), din: [{ uid: 'Q1', type: 'mcbB10' as const }], dinOn: { Q1: true } }
  expect(soundEvents(base, { ...base, dinOn: { Q1: false } })).toEqual(['din'])
  const tripped = { ...base, dinOn: { Q1: false }, log: [{ sev: 'event' as const, msg: 'B10 kioldott: Zárlat' }] }
  expect(soundEvents(base, tripped)).toEqual(['trip'])
  const rcd = { ...base, din: [{ uid: 'Q1', type: 'rcd40' as const }], tested: { ...base.tested, rcdTest: true } }
  expect(soundEvents(base, { ...rcd, dinOn: { Q1: false } })).toEqual(['rcd'])
})

test('sound classifier follows rocker and push-button travel', () => {
  const base = { ...useGame.getState(), mounts: { S1: 'sw101' as const, P1: 'pb' as const } }
  expect(soundEvents(base, { ...base, sw: { S1: 1 } })).toEqual(['rocker'])
  expect(soundEvents(base, { ...base, sw: { P1: 1 } })).toEqual(['click'])
})
