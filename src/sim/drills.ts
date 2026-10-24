import type { DinType } from './catalog'
import { TASKS, type Task } from './tasks'

// ---------- Áramútrajz-gyakorlatok: a meglévő feladatok szerelvényeiből, ugyanazzal az ellenőrzéssel ----------
export interface CircuitDrill {
  id: string
  title: string
  hint: string
  task: Task
}

const drill = (id: string, title: string, hint: string, taskId: string, mounts: string[], din: DinType[] = []): CircuitDrill => {
  const base = TASKS[taskId]
  return { id, title, hint, task: { ...base, schematic: { mounts, din, goal: title } } }
}

export const CIRCUIT_DRILLS: CircuitDrill[] = [
  drill('d101', 'Egypólusú kapcsoló (101) + mozgásérzékelős lámpa', 'A kapcsoló a fázist bontja; a lámpa N-t és PE-t közvetlenül kap.', 'nyariKonyha', ['S1', 'L1']),
  drill('dvv', 'Váltó–váltó: lámpa két helyről', 'L → V1 közös; V1 1-2 → V2 1-2 (korrespondálók); V2 közös → lámpa.', 'nyariKonyha', ['V1', 'V2', 'L2']),
  drill('dvkv', 'Váltó–kereszt–váltó: lámpa három helyről', 'A kereszt a két korrespondálót cseréli fel (1-2 be, 3-4 ki).', 'nyariKonyha', ['V1', 'K', 'V2', 'L2']),
  drill('d105', 'Csillárkapcsoló (105) két lámpakörrel', 'L → kapcsoló L; 1 → 1. kör, 2 → 2. kör; N, PE közvetlenül.', 'csillar', ['S1', 'L1', 'L2']),
  drill('dir', 'Impulzusrelé két nyomógombbal', 'Tekercs A1–A2, érintkező 11–14; a gombok párhuzamosan L-ről A1-re.', 'impulzus', ['NY1', 'NY2', 'L1'], ['ir']),
  drill('dla', 'Lépcsőházi automata (négyvezetékes)', 'Automata L, N; a gombok L-ről az S bemenetre; a lámpa a kimenetről (Q).', 'lepcsohaz', ['NY1', 'NY2', 'L1'], ['timer']),
  drill('dso', 'Dugaszolóaljzat 2P+F', 'L, N és a védőérintkező (PE) – a PE nem maradhat le.', 'nyariKonyha', ['SO']),
  drill('dmero', 'Egyfázisú fogyasztásmérő bekötése', 'Méretlen L → főkismegszakító → mérő 1→3; N 4→6; a lámpa a mért oldalon.', 'merohely', ['L1'], ['mcbB32', 'meter1f']),
]

// ---------- Motorvezérlés: rajzkiegészítés (az interaktív vizsga „rajzkiegészítés” feladattípusa) ----------
export const PARTS: Record<string, string> = {
  F2: 'F2 hőrelé bontó érintkezője',
  S0: 'S0 STOP nyomógomb (bontó)',
  S1: 'S1 START nyomógomb (záró)',
  S2: 'S2 START, másik irány (záró)',
  K1no: 'K1 segédzáró (öntartó)',
  K2no: 'K2 segédzáró (öntartó)',
  K1nc: 'K1 segédbontó (reteszelő)',
  K2nc: 'K2 segédbontó (reteszelő)',
  KTnc: 'KT időrelé késleltetve bontó érintkezője',
  KTno: 'KT időrelé késleltetve záró érintkezője',
  KYnc: 'KY segédbontó (reteszelő)',
  KDnc: 'KΔ segédbontó (reteszelő)',
}

/** egy áramút elemei balról jobbra: rögzített elem, kitöltendő hely, vagy két párhuzamos ág */
export type Cell = { fixed: string } | { slot: string; answer: string } | { par: [Cell[], Cell[]] }
export interface Rung {
  cells: Cell[]
  coil: string
}
export interface Ladder {
  id: string
  title: string
  task: string
  explain: string
  rungs: Rung[]
}

const f = (label: string): Cell => ({ fixed: label })
const s = (slot: string, answer: string): Cell => ({ slot, answer })

export const LADDERS: Ladder[] = [
  {
    id: 'ontartas',
    title: 'Mágneskapcsoló öntartással',
    task: 'Egészítsd ki a K1 mágneskapcsoló vezérlő áramútját: hőrelé-védelem, STOP, START és öntartás.',
    explain: 'A hőrelé bontója és a STOP bontó sorosan van, mert bármelyik nyitása le kell, hogy ejtse a kapcsolót. A START záró és a K1 segédzáró párhuzamos: a START elengedése után a K1 saját segédérintkezője tartja behúzva (öntartás).',
    rungs: [{ cells: [s('a', 'F2'), s('b', 'S0'), { par: [[s('c', 'S1')], [s('d', 'K1no')]] }], coil: 'K1' }],
  },
  {
    id: 'forgasirany',
    title: 'Forgásirányváltás villamos reteszeléssel',
    task: 'K1 = jobbra, K2 = balra. Egészítsd ki úgy, hogy mindkét irány öntartó legyen, és a két mágneskapcsoló soha ne húzhasson be egyszerre.',
    explain: 'Mindkét irány a saját START gombjával és saját segédzárójával öntartó. A reteszelés: K1 áramútjában K2 segédbontója, K2 áramútjában K1 segédbontója van – ha az egyik behúzott, a másik nem kaphat feszültséget (különben két fázis között zárlat lenne).',
    rungs: [
      { cells: [f('F2'), f('S0'), { par: [[s('a', 'S1')], [s('b', 'K1no')]] }, s('c', 'K2nc')], coil: 'K1' },
      { cells: [f('F2 · S0 (közös)'), { par: [[s('d', 'S2')], [s('e', 'K2no')]] }, s('f', 'K1nc')], coil: 'K2' },
    ],
  },
  {
    id: 'csillagdelta',
    title: 'Csillag–delta indítás időrelével',
    task: 'K1 a fő mágneskapcsoló, KY a csillag, KΔ a delta, KT az időrelé. Egészítsd ki a vezérlést.',
    explain: 'K1 öntartó, és vele együtt indul az időrelé. Indításkor KY a KT késleltetve bontó érintkezőjén át húz be; az idő leteltével KT bont (KY elenged) és késleltetve záró érintkezője behúzza KΔ-t. KY és KΔ kölcsönösen reteszelt (egymás segédbontója a másik áramútjában), mert egyszerre zárlatot okoznának.',
    rungs: [
      { cells: [f('F2'), f('S0'), { par: [[s('a', 'S1')], [s('b', 'K1no')]] }], coil: 'K1' },
      { cells: [f('K1 (öntartás után)')], coil: 'KT' },
      { cells: [f('K1'), s('c', 'KTnc'), s('d', 'KDnc')], coil: 'KY' },
      { cells: [f('K1'), s('e', 'KTno'), s('g', 'KYnc')], coil: 'KΔ' },
    ],
  },
]

/** minden kitöltendő hely egy létrafokban, a párhuzamos ágak csoportosítva (azok sorrendje mindegy) */
function slotsOf(cells: Cell[]): { single: { slot: string; answer: string }[]; groups: { slot: string; answer: string }[][] } {
  const single: { slot: string; answer: string }[] = []
  const groups: { slot: string; answer: string }[][] = []
  for (const c of cells) {
    if ('slot' in c) single.push(c)
    if ('par' in c) groups.push(c.par.flatMap((br) => br.filter((x): x is { slot: string; answer: string } => 'slot' in x)))
  }
  return { single, groups }
}

export function allSlots(l: Ladder): string[] {
  return l.rungs.flatMap((r) => {
    const { single, groups } = slotsOf(r.cells)
    return [...single, ...groups.flat()].map((x) => x.slot)
  })
}

/** Ellenőrzés: soros helyeken pontos egyezés, párhuzamos ágakban a sorrend mindegy */
export function checkLadder(l: Ladder, ans: Record<string, string>): { ok: boolean; wrong: string[] } {
  const wrong: string[] = []
  for (const r of l.rungs) {
    const { single, groups } = slotsOf(r.cells)
    for (const x of single) if (ans[x.slot] !== x.answer) wrong.push(x.slot)
    for (const g of groups) {
      const want = g.map((x) => x.answer).sort().join()
      const got = g.map((x) => ans[x.slot] ?? '').sort().join()
      if (want !== got) wrong.push(...g.map((x) => x.slot))
    }
  }
  return { ok: wrong.length === 0, wrong }
}
