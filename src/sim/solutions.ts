import { TOOLS, type ItemType } from './catalog'
import { inspect, type DinDev, type Rig, type Wire } from './circuit'
import type { DeviceType } from './layout'
import { expectedCount, quizFor, WIRE_NEED } from './score'
import { TASKS } from './tasks'

// Mintamegoldások feladatonként: ezeket írja be a „Megoldás” gomb, és ezeken futnak a tesztek is.

let n = 0
const w = (a: string, b: string, color: Wire['color'], cs: Wire['cs'] = 1.5): Wire => ({ id: `M${++n}`, a, b, color, cs, strip: 10 })

/** TN-S betáp, ÁVK + kismegszakítók + SPD a lakáselosztóban (Q5 ÁVK, Q2 → Q3? → Q4 fésűszerűen) */
function feed(chain: string[]): Wire[] {
  const ws = [
    w('bet.L', 'Q5.Lin', 'barna', 2.5), w('bet.N', 'Q5.Nin', 'kek', 2.5), w('bet.PE', 'PE.0', 'zoldsarga', 2.5),
    w('Q5.Nout', 'N.0', 'kek', 2.5), w('Q5.Lout', `${chain[0]}.in`, 'barna', 2.5),
    w('bet.L', 'Q1.L', 'barna', 2.5), w('bet.N', 'Q1.N', 'kek', 2.5), w('Q1.PE', 'PE.1', 'zoldsarga', 2.5),
  ]
  for (let i = 1; i < chain.length; i++) ws.push(w(`${chain[i - 1]}.in`, `${chain[i]}.in`, 'barna', 2.5))
  return ws
}
const socket = (id: string, from: string, n: number, pe: number) => [
  w(from, `${id}.L`, 'barna', 2.5), w(`N.${n}`, `${id}.N`, 'kek', 2.5), w(`PE.${pe}`, `${id}.PE`, 'zoldsarga', 2.5),
]
const lamps = (out: string) => [
  w(out, 'L1.L', 'fekete'), w('L1.L', 'L2.L', 'fekete'), w('N.1', 'L1.N', 'kek'), w('L1.N', 'L2.N', 'kek'),
  w('PE.2', 'L1.PE', 'zoldsarga'), w('L1.PE', 'L2.PE', 'zoldsarga'),
]
const buttons = (from: string, to: string) => [
  w(from, 'NY1.1', 'barna'), w('NY1.1', 'NY2.1', 'barna'), w('NY2.1', 'NY3.1', 'barna'),
  w(to, 'NY1.2', 'szurke'), w('NY1.2', 'NY2.2', 'szurke'), w('NY2.2', 'NY3.2', 'szurke'),
]
const spd = { uid: 'Q1', type: 'spd' } as const
const rcd = { uid: 'Q5', type: 'rcd40' } as const

export interface Solution {
  din: DinDev[]
  mounts: Record<string, DeviceType>
  wires: Wire[]
  schematic: [string, string][]
}

const SOLUTIONS: Record<string, () => Solution> = {
  nyariKonyha: () => ({
    din: [spd, { uid: 'Q2', type: 'mcbB10' }, { uid: 'Q3', type: 'mcbB10' }, { uid: 'Q4', type: 'mcbB16' }, rcd],
    mounts: { L1: 'lampMotion', S1: 'sw101', V1: 'sw106', K: 'sw107', V2: 'sw106', L2: 'lamp', SO: 'socket' },
    wires: [
      ...feed(['Q2', 'Q3', 'Q4']),
      w('Q2.out', 'S1.L', 'barna'), w('S1.1', 'L1.L', 'fekete'), w('N.1', 'L1.N', 'kek'), w('PE.2', 'L1.PE', 'zoldsarga'),
      w('Q3.out', 'V1.C', 'barna'), w('V1.1', 'K.1', 'fekete'), w('V1.2', 'K.2', 'szurke'),
      w('K.3', 'V2.1', 'fekete'), w('K.4', 'V2.2', 'szurke'), w('V2.C', 'L2.L', 'barna'),
      w('N.2', 'L2.N', 'kek'), w('PE.3', 'L2.PE', 'zoldsarga'),
      ...socket('SO', 'Q4.out', 3, 4),
    ],
    schematic: [['bet.L', 'V1.C'], ['V1.1', 'K.1'], ['V1.2', 'K.2'], ['K.3', 'V2.1'], ['K.4', 'V2.2'], ['V2.C', 'L2.L'], ['bet.N', 'L2.N'], ['bet.PE', 'L2.PE']],
  }),
  lepcsohaz: () => ({
    din: [spd, { uid: 'Q2', type: 'mcbB10' }, { uid: 'Q3', type: 'timer' }, { uid: 'Q4', type: 'mcbB16' }, rcd],
    mounts: { NY1: 'pb', NY2: 'pb', NY3: 'pb', L1: 'lamp', L2: 'lamp', SO: 'socket' },
    wires: [...feed(['Q2', 'Q4']), w('Q2.out', 'Q3.L', 'barna'), w('N.5', 'Q3.N', 'kek'), ...buttons('Q2.out', 'Q3.S'), ...lamps('Q3.Q'), ...socket('SO', 'Q4.out', 3, 4)],
    schematic: [['bet.L', 'LA.L'], ['bet.N', 'LA.N'], ['bet.L', 'NY1.1'], ['NY1.1', 'NY2.1'], ['LA.S', 'NY1.2'], ['NY1.2', 'NY2.2'], ['LA.Q', 'L1.L'], ['bet.N', 'L1.N'], ['bet.PE', 'L1.PE']],
  }),
  impulzus: () => ({
    din: [spd, { uid: 'Q2', type: 'mcbB10' }, { uid: 'Q3', type: 'ir' }, { uid: 'Q4', type: 'mcbB16' }, rcd],
    mounts: { NY1: 'pb', NY2: 'pb', NY3: 'pb', L1: 'lamp', L2: 'lamp', SO: 'socket' },
    wires: [...feed(['Q2', 'Q4']), w('N.5', 'Q3.A2', 'kek'), w('Q2.out', 'Q3.11', 'barna'), ...buttons('Q2.out', 'Q3.A1'), ...lamps('Q3.14'), ...socket('SO', 'Q4.out', 3, 4)],
    schematic: [['bet.N', 'IR.A2'], ['bet.L', 'NY1.1'], ['NY1.1', 'NY2.1'], ['IR.A1', 'NY1.2'], ['NY1.2', 'NY2.2'], ['bet.L', 'IR.11'], ['IR.14', 'L1.L'], ['bet.N', 'L1.N'], ['bet.PE', 'L1.PE']],
  }),
  csillar: () => ({
    din: [spd, { uid: 'Q2', type: 'mcbB10' }, { uid: 'Q4', type: 'mcbB16' }, rcd],
    mounts: { L1: 'lamp', L2: 'lamp', S1: 'sw105', SO1: 'socket', SO2: 'socket' },
    wires: [
      ...feed(['Q2', 'Q4']), w('Q2.out', 'S1.L', 'barna'), w('S1.1', 'L1.L', 'fekete'), w('S1.2', 'L2.L', 'szurke'),
      w('N.1', 'L1.N', 'kek'), w('N.2', 'L2.N', 'kek'), w('PE.2', 'L1.PE', 'zoldsarga'), w('PE.3', 'L2.PE', 'zoldsarga'),
      ...socket('SO1', 'Q4.out', 3, 4), w('SO1.L', 'SO2.L', 'barna', 2.5), w('SO1.N', 'SO2.N', 'kek', 2.5), w('SO1.PE', 'SO2.PE', 'zoldsarga', 2.5),
    ],
    schematic: [['bet.L', 'S1.L'], ['S1.1', 'L1.L'], ['S1.2', 'L2.L'], ['bet.N', 'L1.N'], ['L1.N', 'L2.N'], ['bet.PE', 'L1.PE'], ['L1.PE', 'L2.PE']],
  }),
  merohely: () => ({
    din: [
      { uid: 'F0', type: 'mcbB32', zone: 'cab' }, { uid: 'P1', type: 'meter1f', zone: 'cab' },
      spd, { uid: 'Q2', type: 'mcbB10' }, { uid: 'Q4', type: 'mcbB16' }, rcd,
    ],
    mounts: { L1: 'lamp', S1: 'sw101', SO: 'socket' },
    wires: [
      w('bet.L', 'F0.in', 'fekete', 10), w('F0.out', 'P1.1', 'fekete', 10), w('bet.PEN', 'PEs.0', 'pen', 10),
      w('Nk.0', 'P1.4', 'kek', 10), w('PEs.2', 'EPH.1', 'zoldsarga', 6),
      w('P1.3', 'Q5.Lin', 'barna', 10), w('P1.6', 'Q5.Nin', 'kek', 10), w('PEs.1', 'PE.0', 'zoldsarga', 10),
      w('Q5.Nout', 'N.0', 'kek', 2.5), w('Q5.Lout', 'Q2.in', 'barna', 2.5), w('Q2.in', 'Q4.in', 'barna', 2.5),
      w('Q2.out', 'Q1.L', 'barna', 2.5), w('N.4', 'Q1.N', 'kek', 2.5), w('Q1.PE', 'PE.1', 'zoldsarga', 2.5),
      w('Q2.out', 'S1.L', 'barna'), w('S1.1', 'L1.L', 'fekete'), w('N.1', 'L1.N', 'kek'), w('PE.2', 'L1.PE', 'zoldsarga'),
      ...socket('SO', 'Q4.out', 3, 4),
    ],
    schematic: [['bet.L', 'MCBB32.in'], ['MCBB32.out', 'METER1F.1'], ['METER1F.3', 'L1.L'], ['Nk.0', 'METER1F.4'], ['METER1F.6', 'L1.N'], ['PEs.0', 'L1.PE']],
  }),
}

export const solutionFor = (taskId: string): Solution => SOLUTIONS[taskId]()

/** Mintamegoldás egy szakaszra: az állapot ezen részeit cseréli le */
export function solveStage(s: Rig & { supplyU: number }, stage: string): Record<string, unknown> {
  const task = TASKS[s.taskId]
  const sol = solutionFor(s.taskId)
  switch (stage) {
    case 'anyag': {
      const materials: Partial<Record<ItemType, number>> = {}
      for (const t of [...new Set([...sol.din.map((d) => d.type), ...Object.values(sol.mounts)])]) materials[t] = expectedCount(task, t)
      const wireStock = [...new Set([...WIRE_NEED, ...sol.wires.map((x) => `${x.cs}-${x.color}`)])]
      return { belt: TOOLS.filter((t) => t.role === 'need').map((t) => t.id), lateTools: [], materials, wireStock }
    }
    case 'rajz': {
      const quiz = quizFor(task)
      return {
        rajz: {
          sym: Object.fromEntries(quiz.map((k, i) => [i, k])),
          seg: Object.fromEntries((task.segments ?? []).map((g) => [g.id, String(g.answer)])),
          links: sol.schematic,
        },
      }
    }
    case 'csatorna':
      return { cuts: Object.fromEntries(task.layout.pieces.map((p) => [p.id, { len: p.len, ends: p.ends, deburred: true, mounted: true, leveled: true }])) }
    case 'szereles':
      return {
        din: sol.din, mounts: sol.mounts,
        dinOn: Object.fromEntries(sol.din.map((d) => [d.uid, false])), dinState: Object.fromEntries(sol.din.map((d) => [d.uid, 0])),
        wires: [],
      }
    case 'vezetekezes':
      return {
        din: sol.din, mounts: sol.mounts, wires: sol.wires.map((x) => ({ ...x })),
        dinOn: Object.fromEntries(sol.din.map((d) => [d.uid, false])), dinState: Object.fromEntries(sol.din.map((d) => [d.uid, 0])),
        lidsOn: true,
      }
    case 'ellenorzes': {
      // a mérések a tényleges szerelésből: hibás bekötésnél a megoldás is „nem felel meg”-et ír
      const f = inspect(s)
      const shortOrPe = f.some((x) => /Zárlat|Testzárlat|N és PE|védővezető \(PE\) nincs/.test(x.msg))
      const peMissing = f.some((x) => x.msg.includes('védővezető (PE) nincs'))
      const watt = task.measure.currentLoads.reduce((a, id) => a + (task.loads.find((l) => l.id === id)?.watt ?? 0), 0)
      const I = Number((watt / s.supplyU).toFixed(3))
      const comma = (x: number, d: number) => x.toFixed(d).replace('.', ',')
      const switches = task.layout.mounts.filter((m) => m.kind === 'switch').map((m) => m.id)
      return {
        insp: {
          order: [0, 1, 2, 3, 4], vfree: true, isoV: 500,
          isoRes: { iso: shortOrPe ? '0,00 MΩ' : '>299 MΩ', pe: peMissing ? 'OL (szakadás)' : '0,31 Ω' },
          isoLimit: '1', isoJudge: shortOrPe ? 'nok' : 'ok',
          iRead: `${comma(I, 3)} A`, iValue: I, uRead: `${comma(s.supplyU, 1)} V`,
          jk: { I: comma(I, 3), P: comma(s.supplyU * I, 1), U: comma(s.supplyU, 1), judge: s.supplyU >= 207 && s.supplyU <= 253 ? 'ok' : 'nok' },
          protocolClosed: true,
        },
        tested: { sw: Object.fromEntries(switches.map((k) => [k, true])), motion: true, rcdTest: true },
        lidsOn: true,
      }
    }
    default:
      return {}
  }
}
