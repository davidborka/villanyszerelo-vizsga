import { expect, test } from 'bun:test'
import { inspect, pressEffects, settle, simulate, type Rig, type Wire } from '../src/sim/circuit'
import { checkSchematic } from '../src/sim/score'
import { TASKS } from '../src/sim/tasks'

let n = 0
const w = (a: string, b: string, color: Wire['color'], cs: Wire['cs'] = 1.5): Wire => ({ id: `w${++n}`, a, b, color, cs, strip: 10 })
const bad = (r: Rig) => inspect(r).filter((x) => x.sev === 'critical' || x.sev === 'error')

// közös elosztó: Q1 SPD, Q2 B10, Q3 B10 vagy vezérlő, Q4 B16, Q5 ÁVK
function feed(): Wire[] {
  return [
    w('bet.L', 'Q5.Lin', 'barna', 2.5), w('bet.N', 'Q5.Nin', 'kek', 2.5), w('bet.PE', 'PE.0', 'zoldsarga', 2.5),
    w('Q5.Nout', 'N.0', 'kek', 2.5), w('Q5.Lout', 'Q2.in', 'barna', 2.5), w('Q2.in', 'Q4.in', 'barna', 2.5),
    w('bet.L', 'Q1.L', 'barna', 2.5), w('bet.N', 'Q1.N', 'kek', 2.5), w('Q1.PE', 'PE.1', 'zoldsarga', 2.5),
  ]
}
const rig = (taskId: string, din: Rig['din'], mounts: Rig['mounts'], wires: Wire[]): Rig => ({
  taskId, din, mounts, wires, sw: {}, dinState: {}, dinOn: Object.fromEntries(din.map((d) => [d.uid, true])), motion: true,
})

function goodRig(): Rig {
  const din = [
    { uid: 'Q1', type: 'spd' as const }, { uid: 'Q2', type: 'mcbB10' as const }, { uid: 'Q3', type: 'mcbB10' as const },
    { uid: 'Q4', type: 'mcbB16' as const }, { uid: 'Q5', type: 'rcd40' as const },
  ]
  return rig('nyariKonyha', din, { L1: 'lampMotion', S1: 'sw101', V1: 'sw106', K: 'sw107', V2: 'sw106', L2: 'lamp', SO: 'socket' }, [
    ...feed().filter((x) => !(x.a === 'Q2.in' && x.b === 'Q4.in')), w('Q2.in', 'Q3.in', 'barna', 2.5), w('Q3.in', 'Q4.in', 'barna', 2.5),
    w('Q2.out', 'S1.L', 'barna'), w('S1.1', 'L1.L', 'fekete'), w('N.1', 'L1.N', 'kek'), w('PE.2', 'L1.PE', 'zoldsarga'),
    w('Q3.out', 'V1.C', 'barna'), w('V1.1', 'K.1', 'fekete'), w('V1.2', 'K.2', 'szurke'),
    w('K.3', 'V2.1', 'fekete'), w('K.4', 'V2.2', 'szurke'), w('V2.C', 'L2.L', 'barna'),
    w('N.2', 'L2.N', 'kek'), w('PE.3', 'L2.PE', 'zoldsarga'),
    w('Q4.out', 'SO.L', 'barna', 2.5), w('N.3', 'SO.N', 'kek', 2.5), w('PE.4', 'SO.PE', 'zoldsarga', 2.5),
  ])
}

test('nyári konyha: helyes bekötés hibátlan', () => expect(bad(goodRig())).toEqual([]))

test('nyári konyha: Lámpa 2 bármely kapcsolóval váltható, nincs kioldás', () => {
  const r = goodRig()
  const a = !!simulate({ ...r, sw: { V1: 0, K: 0, V2: 0 } }).lit.L2
  for (const k of ['V1', 'K', 'V2']) expect(!!simulate({ ...r, sw: { V1: 0, K: 0, V2: 0, [k]: 1 } }).lit.L2).toBe(!a)
  expect(settle({ ...r, sw: { S1: 1 } }).tripLog).toEqual([])
})

test('nulla az ÁVK előtt → kritikus, ÁVK kiold', () => {
  const r = goodRig()
  r.wires = r.wires.map((x) => (x.a === 'Q5.Nout' ? { ...x, a: 'bet.N' } : x))
  expect(inspect(r).some((f) => f.sev === 'critical' && f.msg.includes('ÁVK'))).toBe(true)
  expect(settle({ ...r, sw: { S1: 1 } }).tripLog.join()).toContain('kioldott')
})

test('hiányzó PE a dugaljon → kritikus', () => {
  const r = goodRig()
  r.wires = r.wires.filter((x) => x.b !== 'SO.PE')
  expect(inspect(r).some((f) => f.sev === 'critical' && f.msg.includes('Dugalj'))).toBe(true)
})

test('kapcsoló a nullában → kritikus', () => {
  const r = goodRig()
  r.wires = r.wires.filter((x) => !['S1.L', 'L1.L', 'L1.N'].includes(x.b) && x.a !== 'S1.1')
  r.wires.push(w('Q2.out', 'L1.L', 'barna'), w('N.1', 'S1.L', 'kek'), w('S1.1', 'L1.N', 'kek'))
  expect(inspect(r).some((f) => f.sev === 'critical' && f.msg.includes('nem a fázist'))).toBe(true)
})

test('zárlat → a kör kismegszakítója old ki', () => {
  const r = goodRig()
  r.wires.push(w('SO.L', 'SO.N', 'barna', 2.5))
  expect(settle(r).tripLog[0]).toContain('Q4')
})

test('1,5 mm² a dugaljkörben → hiba', () => {
  const r = goodRig()
  r.wires = r.wires.map((x) => (x.b === 'SO.L' ? { ...x, cs: 1.5 } : x))
  expect(inspect(r).some((f) => f.msg.includes('2,5 mm²'))).toBe(true)
})

// ---------- vezérelt világítás ----------
const pbMounts = { NY1: 'pb', NY2: 'pb', NY3: 'pb', L1: 'lamp', L2: 'lamp', SO: 'socket' } as const
const lamps = (out: string) => [
  w(out, 'L1.L', 'fekete'), w('L1.L', 'L2.L', 'fekete'), w('N.1', 'L1.N', 'kek'), w('L1.N', 'L2.N', 'kek'),
  w('PE.2', 'L1.PE', 'zoldsarga'), w('L1.PE', 'L2.PE', 'zoldsarga'),
  w('Q4.out', 'SO.L', 'barna', 2.5), w('N.3', 'SO.N', 'kek', 2.5), w('PE.4', 'SO.PE', 'zoldsarga', 2.5),
]
const buttons = (from: string, to: string) => [
  w(from, 'NY1.1', 'barna'), w('NY1.1', 'NY2.1', 'barna'), w('NY2.1', 'NY3.1', 'barna'),
  w(to, 'NY1.2', 'szurke'), w('NY1.2', 'NY2.2', 'szurke'), w('NY2.2', 'NY3.2', 'szurke'),
]

function timerRig(): Rig {
  const din = [{ uid: 'Q1', type: 'spd' as const }, { uid: 'Q2', type: 'mcbB10' as const }, { uid: 'Q3', type: 'timer' as const }, { uid: 'Q4', type: 'mcbB16' as const }, { uid: 'Q5', type: 'rcd40' as const }]
  return rig('lepcsohaz', din, { ...pbMounts }, [
    ...feed(), w('Q2.out', 'Q3.L'), w('N.5', 'Q3.N', 'kek'), ...buttons('Q2.out', 'Q3.S'), ...lamps('Q3.Q'),
  ])
}

test('lépcsőház: helyes bekötés hibátlan, gombnyomásra indul', () => {
  const r = timerRig()
  expect(bad(r)).toEqual([])
  const pressed = { ...r, sw: { NY2: 1 } }
  const { dinState, started } = pressEffects(pressed)
  expect(started).toEqual(['Q3'])
  expect(simulate({ ...r, dinState }).lit).toEqual({ L1: true, L2: true })
})

test('lépcsőház: gomb a nullát kapcsolja → nem indul, hiba', () => {
  const r = timerRig()
  r.wires = r.wires.map((x) => (x.a === 'Q2.out' && x.b === 'NY1.1' ? { ...x, a: 'N.4', color: 'kek' } : x))
  expect(pressEffects({ ...r, sw: { NY1: 1 } }).started).toEqual([])
  expect(bad(r).some((f) => f.msg.startsWith('Nyomógombok'))).toBe(true)
})

function irRig(): Rig {
  const din = [{ uid: 'Q1', type: 'spd' as const }, { uid: 'Q2', type: 'mcbB10' as const }, { uid: 'Q3', type: 'ir' as const }, { uid: 'Q4', type: 'mcbB16' as const }, { uid: 'Q5', type: 'rcd40' as const }]
  return rig('impulzus', din, { ...pbMounts }, [
    ...feed(), w('N.5', 'Q3.A2', 'kek'), w('Q2.out', 'Q3.11'), ...buttons('Q2.out', 'Q3.A1'), ...lamps('Q3.14'),
  ])
}

test('impulzusrelé: helyes bekötés hibátlan, minden gombnyomás vált', () => {
  const r = irRig()
  expect(bad(r)).toEqual([])
  const on = pressEffects({ ...r, sw: { NY3: 1 } }).dinState
  expect(simulate({ ...r, dinState: on }).lit.L1).toBe(true)
  const off = pressEffects({ ...r, dinState: on, sw: { NY1: 1 } }).dinState
  expect(!!simulate({ ...r, dinState: off }).lit.L1).toBe(false)
})

test('impulzusrelé: lámpa a relé megkerülésével → hiba', () => {
  const r = irRig()
  r.wires = r.wires.map((x) => (x.a === 'Q3.14' ? { ...x, a: 'Q2.out' } : x))
  expect(bad(r).some((f) => f.msg.startsWith('Lámpák'))).toBe(true)
})

test('csillárkapcsoló: két kör külön és együtt kapcsolható', () => {
  const din = [{ uid: 'Q1', type: 'spd' as const }, { uid: 'Q2', type: 'mcbB10' as const }, { uid: 'Q4', type: 'mcbB16' as const }, { uid: 'Q5', type: 'rcd40' as const }]
  const r = rig('csillar', din, { L1: 'lamp', L2: 'lamp', S1: 'sw105', SO1: 'socket', SO2: 'socket' }, [
    ...feed(), w('Q2.out', 'S1.L'), w('S1.1', 'L1.L', 'fekete'), w('S1.2', 'L2.L', 'szurke'),
    w('N.1', 'L1.N', 'kek'), w('N.2', 'L2.N', 'kek'), w('PE.2', 'L1.PE', 'zoldsarga'), w('PE.3', 'L2.PE', 'zoldsarga'),
    w('Q4.out', 'SO1.L', 'barna', 2.5), w('SO1.L', 'SO2.L', 'barna', 2.5), w('N.3', 'SO1.N', 'kek', 2.5), w('SO1.N', 'SO2.N', 'kek', 2.5),
    w('PE.4', 'SO1.PE', 'zoldsarga', 2.5), w('SO1.PE', 'SO2.PE', 'zoldsarga', 2.5),
  ])
  expect(bad(r)).toEqual([])
  expect(simulate({ ...r, sw: { S1: 2 } }).lit).toEqual({ L2: true })
})

test('áramútrajz-feladat: helyes váltó–kereszt–váltó elfogadva, PE nélkül nem', () => {
  const t = TASKS.nyariKonyha
  const links: [string, string][] = [
    ['bet.L', 'V1.C'], ['V1.1', 'K.1'], ['V1.2', 'K.2'], ['K.3', 'V2.1'], ['K.4', 'V2.2'], ['V2.C', 'L2.L'], ['bet.N', 'L2.N'],
  ]
  expect(checkSchematic(t, links).ok).toBe(false)
  expect(checkSchematic(t, [...links, ['bet.PE', 'L2.PE']]).ok).toBe(true)
})

import { forecast, grade } from '../src/sim/score'

test('érdemjegy a 12/2020. Korm. rendelet 290. § sávjai szerint', () => {
  expect([39, 40, 49, 50, 59, 60, 79, 80, 100].map((p) => grade(p).jegy)).toEqual([1, 2, 2, 3, 3, 4, 4, 5, 5])
})

test('szakmai vizsga előrejelzés: 70% projekt + 30% interaktív, 40% alatti rész → sikertelen', () => {
  const f = forecast({ portfolio: 80, ii: { pct: 70, invalid: false, task: 'x', at: 0 }, iii: { pct: 60, invalid: false, at: 0 }, interaktiv: { pct: 50, at: 0 } })
  // projekt = 0.2*80 + 0.4*70 + 0.4*60 = 68; összes = 0.7*68 + 0.3*50 = 62.6
  expect(Math.round(f.projPct! * 10) / 10).toBe(68)
  expect(Math.round(f.total! * 10) / 10).toBe(62.6)
  expect(f.grade.jegy).toBe(4)
  expect(forecast({ interaktiv: { pct: 35, at: 0 }, ii: { pct: 90, invalid: false, task: 'x', at: 0 } }).failed).toBe(true)
  expect(forecast({ ii: { pct: 90, invalid: true, task: 'x', at: 0 } }).failed).toBe(true)
})

// ---------- mérőhely (TN-C-S) ----------
function meterRig(): Rig {
  const din: Rig['din'] = [
    { uid: 'F0', type: 'mcbB32', zone: 'cab' }, { uid: 'P1', type: 'meter1f', zone: 'cab' },
    { uid: 'Q1', type: 'spd' }, { uid: 'Q2', type: 'mcbB10' }, { uid: 'Q4', type: 'mcbB16' }, { uid: 'Q5', type: 'rcd40' },
  ]
  return rig('merohely', din, { L1: 'lamp', S1: 'sw101', SO: 'socket' }, [
    w('bet.L', 'F0.in', 'fekete', 10), w('F0.out', 'P1.1', 'fekete', 10), w('bet.PEN', 'PEs.0', 'pen', 10),
    w('Nk.0', 'P1.4', 'kek', 10), w('PEs.2', 'EPH.1', 'zoldsarga', 6),
    w('P1.3', 'Q5.Lin', 'barna', 10), w('P1.6', 'Q5.Nin', 'kek', 10), w('PEs.1', 'PE.0', 'zoldsarga', 10),
    w('Q5.Nout', 'N.0', 'kek', 2.5), w('Q5.Lout', 'Q2.in', 'barna', 2.5), w('Q2.in', 'Q4.in', 'barna', 2.5),
    w('Q2.out', 'Q1.L', 'barna', 2.5), w('N.4', 'Q1.N', 'kek', 2.5), w('Q1.PE', 'PE.1', 'zoldsarga', 2.5),
    w('Q2.out', 'S1.L', 'barna'), w('S1.1', 'L1.L', 'fekete'), w('N.1', 'L1.N', 'kek'), w('PE.2', 'L1.PE', 'zoldsarga'),
    w('Q4.out', 'SO.L', 'barna', 2.5), w('N.3', 'SO.N', 'kek', 2.5), w('PE.4', 'SO.PE', 'zoldsarga', 2.5),
  ])
}
const has = (r: Rig, sev: string, re: RegExp) => inspect(r).some((f) => f.sev === sev && re.test(f.msg))

test('mérőhely: helyes bekötés hibátlan, a lámpa világít, nincs kioldás', () => {
  const r = meterRig()
  expect(bad(r)).toEqual([])
  const on = { ...r, sw: { S1: 1 } }
  expect(simulate(on).lit.L1).toBe(true)
  expect(settle(on).tripLog).toEqual([])
})

test('mérőhely: fordított mérő (1↔3) → hiba', () => {
  const r = meterRig()
  r.wires = r.wires.map((x) => (x.b === 'P1.1' ? { ...x, b: 'P1.3' } : x.a === 'P1.3' ? { ...x, a: 'P1.1' } : x))
  expect(has(r, 'error', /fordítva/)).toBe(true)
})

test('mérőhely: lámpa a mérő megkerülésével → méretlen vételezés, kritikus', () => {
  const r = meterRig()
  r.wires.push(w('F0.out', 'Q5.Lin', 'fekete', 10))
  expect(has(r, 'critical', /méretlen vételezés/)).toBe(true)
})

test('mérőhely: PEN az N-kapocsra → hiba; N–PE újra összekötve → kritikus, ÁVK kiold', () => {
  const a = meterRig()
  a.wires = a.wires.map((x) => (x.a === 'bet.PEN' ? { ...x, b: 'Nk.1' } : x))
  expect(has(a, 'error', /PEN-t a főföldelő/)).toBe(true)
  const b = meterRig()
  b.wires.push(w('N.5', 'PE.5', 'kek', 2.5))
  expect(has(b, 'critical', /újra összekötve/)).toBe(true)
  expect(settle({ ...b, sw: { S1: 1 } }).tripLog.join()).toContain('Q5')
})

test('mérőhely: védővezető az N-re (nullázás) → kritikus', () => {
  const r = meterRig()
  r.wires = r.wires.map((x) => (x.b === 'SO.PE' ? { ...x, a: 'N.5' } : x))
  expect(has(r, 'critical', /nullázás|védővezető/)).toBe(true)
})

test('mérőhely: ÁVK a mérő előtt → kritikus; 6 mm² fővezeték → hiba; EPH hiányzik → hiba', () => {
  const a = meterRig()
  a.din = a.din.map((d) => (d.uid === 'Q5' ? { ...d, zone: 'cab' } : d))
  expect(has(a, 'critical', /ÁVK a méretlen/)).toBe(true)
  const b = meterRig()
  b.wires = b.wires.map((x) => (x.a === 'P1.3' ? { ...x, cs: 6 } : x))
  expect(has(b, 'error', /10 mm²/)).toBe(true)
  const c = meterRig()
  c.wires = c.wires.filter((x) => x.b !== 'EPH.1')
  expect(has(c, 'error', /EPH/)).toBe(true)
})

test('mérőhely áramútrajz: helyes mérőbekötés elfogadva', () => {
  const t = TASKS.merohely
  const ok: [string, string][] = [['bet.L', 'MCBB32.in'], ['MCBB32.out', 'METER1F.1'], ['METER1F.3', 'L1.L'], ['Nk.0', 'METER1F.4'], ['METER1F.6', 'L1.N'], ['PEs.0', 'L1.PE']]
  expect(checkSchematic(t, ok)).toEqual({ ok: true, msg: 'Helyes kapcsolás.' })
  const rev: [string, string][] = ok.map(([a, b]) => [a, b.replace('METER1F.1', 'METER1F.3')] as [string, string]).map(([a, b]) => [a.replace('METER1F.3', 'METER1F.1'), b])
  expect(checkSchematic(t, rev).ok).toBe(false)
})

import { drawExam, isCorrect, scoreExam, TOPICS } from '../src/sim/interaktiv'

test('interaktív vizsga: témakörönkénti húzás, súlyozott pontozás', () => {
  const items = drawExam()
  for (const t of TOPICS) expect(items.filter((i) => i.q.topic === t.id).length).toBe(t.count)
  const all = Object.fromEntries(items.map((i) => [i.q.id, i.q.kind === 'order' ? i.q.options!.map((_, k) => k) : i.q.kind === 'number' ? String(i.q.value) : i.q.answer]))
  expect(items.every((i) => isCorrect(i.q, all[i.q.id]))).toBe(true)
  expect(scoreExam(items, all).pct).toBe(100)
  // csak a biztonsági témakör hibátlan → 40%
  const safety = Object.fromEntries(Object.entries(all).filter(([id]) => items.find((i) => i.q.id === id)!.q.topic === 'biztonsag'))
  expect(scoreExam(items, safety).pct).toBe(40)
})

import { generateCalc } from '../src/sim/generated'
import { QUESTIONS } from '../src/sim/questions'

test('generált számítási feladatok: 4 különböző opció, a helyes a megjelölt', () => {
  let seed = 1
  const rnd = () => ((seed = (seed * 16807) % 2147483647) - 1) / 2147483646
  for (const q of generateCalc(60, rnd)) {
    expect(q.options!.length).toBe(4)
    expect(new Set(q.options).size).toBe(4)
    expect(q.answer).toBe(0)
    expect(isCorrect(q, 0)).toBe(true)
  }
})

test('új feladatsor: előbb a még nem látott bankkérdések', () => {
  const first = drawExam()
  const seen = new Set(first.map((i) => i.q.id))
  const second = drawExam(Math.random, seen)
  for (const t of TOPICS) {
    const fresh = QUESTIONS.filter((q) => q.topic === t.id && !seen.has(q.id)).length
    const repeats = second.filter((i) => i.q.topic === t.id && seen.has(i.q.id)).length
    // ismétlés csak akkor, ha a témakörben elfogytak az új kérdések
    if (fresh >= t.count) expect(repeats).toBe(0)
  }
  expect(second.filter((i) => i.q.id.startsWith('g-')).length).toBe(4)
})

import { CALC_TYPES, generateOne } from '../src/sim/generated'

test('gyakorlóterem: minden számolási típus 4 különböző válaszlehetőséget ad, a helyes van megjelölve', () => {
  for (const t of [...CALC_TYPES.map((x) => x.key), 'vegyes']) {
    for (let i = 0; i < 40; i++) {
      const q = generateOne(t)
      expect(q.options!.length).toBe(4)
      expect(new Set(q.options).size).toBe(4)
      expect(q.answer).toBe(0)
      expect(q.explain.length).toBeGreaterThan(10)
    }
  }
})

test('gyakorlóterem: ismert esetek kézzel ellenőrizve', () => {
  // rnd = 0 → minden választás az első elem
  const zero = () => 0
  expect(generateOne('motor', zero).options![0]).toBe('4,7 A') // 2200 / (1,732·400·0,8·0,84) = 4,725
  expect(generateOne('fordulat', zero).options![0]).toBe('3,0 %') // 2 pólus → 3000; 2910 → 3 %
  expect(generateOne('trafo', zero).options![0]).toBe('48 menet') // 920·12/230
  expect(generateOne('keresztmetszet', zero).options![0]).toBe('1,5 mm²') // Ib 9 → In 10 → 1,5 (18 A)
  expect(generateOne('csillagdelta', zero).options![0]).toBe('13,3 A') // 8·5/3
  expect(generateOne('impulzus', zero).options![0]).toBe('240 W') // 300 W, c 500, 30 s → 1 imp → 240 W (kerekítés miatt)
})

import { CIRCUIT_DRILLS, LADDERS, allSlots, checkLadder } from '../src/sim/drills'
import { solutionFor } from '../src/sim/solutions'

test('áramútrajz-gyakorlatok: a helyes kapcsolást elfogadja, a tipikus hibát nem', () => {
  const sol: Record<string, [string, string][]> = {
    d101: [['bet.L', 'S1.L'], ['S1.1', 'L1.L'], ['bet.N', 'L1.N'], ['bet.PE', 'L1.PE']],
    dvv: [['bet.L', 'V1.C'], ['V1.1', 'V2.1'], ['V1.2', 'V2.2'], ['V2.C', 'L2.L'], ['bet.N', 'L2.N'], ['bet.PE', 'L2.PE']],
    dvkv: solutionFor('nyariKonyha').schematic,
    d105: solutionFor('csillar').schematic,
    dir: solutionFor('impulzus').schematic,
    dla: solutionFor('lepcsohaz').schematic,
    dso: [['bet.L', 'SO.L'], ['bet.N', 'SO.N'], ['bet.PE', 'SO.PE']],
    dmero: solutionFor('merohely').schematic,
  }
  for (const d of CIRCUIT_DRILLS) expect([d.id, checkSchematic(d.task, sol[d.id]).ok]).toEqual([d.id, true])
  const get = (id: string) => CIRCUIT_DRILLS.find((d) => d.id === id)!.task
  // kapcsoló a nullában
  expect(checkSchematic(get('d101'), [['bet.N', 'S1.L'], ['S1.1', 'L1.N'], ['bet.L', 'L1.L'], ['bet.PE', 'L1.PE']]).ok).toBe(false)
  // dugalj PE nélkül
  expect(checkSchematic(get('dso'), [['bet.L', 'SO.L'], ['bet.N', 'SO.N']]).ok).toBe(false)
  // váltó–váltó: korrespondálók a közös kapcsokon
  expect(checkSchematic(get('dvv'), [['bet.L', 'V1.1'], ['V1.C', 'V2.C'], ['V1.2', 'V2.2'], ['V2.1', 'L2.L'], ['bet.N', 'L2.N'], ['bet.PE', 'L2.PE']]).ok).toBe(false)
})

test('motorvezérlés: a megoldás elfogadva, a párhuzamos ágak sorrendje mindegy, a hiba jelölve', () => {
  for (const l of LADDERS) {
    const right: Record<string, string> = {}
    const walk = (cells: Parameters<typeof checkLadder>[0]['rungs'][number]['cells']) => cells.forEach((c) => ('slot' in c ? (right[c.slot] = c.answer) : 'par' in c ? c.par.forEach(walk) : null))
    l.rungs.forEach((r) => walk(r.cells))
    expect(Object.keys(right).sort()).toEqual(allSlots(l).sort())
    expect(checkLadder(l, right).ok).toBe(true)
  }
  const ont = LADDERS[0]
  expect(checkLadder(ont, { a: 'F2', b: 'S0', c: 'K1no', d: 'S1' }).ok).toBe(true) // párhuzamos ág felcserélve
  expect(checkLadder(ont, { a: 'F2', b: 'S1', c: 'S0', d: 'K1no' }).wrong).toContain('b')
})
