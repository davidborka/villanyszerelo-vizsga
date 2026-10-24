import { ITEMS, TOOLS, type ItemType } from './catalog'
import { combos, functionalCtx, inspect, nets, type Finding, type Rig } from './circuit'
import type { Cut, Insp, LogEntry, RajzAns } from './store'
import { taskOf, type Task } from './tasks'

export const SYMBOL_QUIZ = ['valto', 'lampa', 'egypolusu', 'dugalj', 'kereszt', 'csillar']
export const quizFor = (t: Task) => [...SYMBOL_QUIZ, ...t.extraSymbols]
export const WIRE_NEED = ['1.5-barna', '1.5-kek', '1.5-zoldsarga', '2.5-barna', '2.5-kek', '2.5-zoldsarga']
export const RULES = [
  'Kikapcsolás, leválasztás minden betáplálási oldalról',
  'Visszakapcsolás elleni biztosítás (lakat, tábla)',
  'Feszültségmentesség ellenőrzése',
  'Földelés és rövidrezárás (ahol szükséges)',
  'Szomszédos, feszültség alatt álló részek letakarása, elkerítése',
]
export const schematicUid = (t: string) => (t === 'timer' ? 'LA' : t === 'ir' ? 'IR' : t.toUpperCase())

/** Az áramútrajz-feladat ellenőrzése ugyanazzal a hálózatmodellel, mint a 3D szerelés */
export function checkSchematic(task: Task, links: [string, string][]): { ok: boolean; msg: string } {
  const rig: Rig = {
    taskId: task.id,
    mounts: Object.fromEntries(task.schematic.mounts.map((id) => [id, task.layout.mounts.find((m) => m.id === id)!.expect])),
    din: task.schematic.din.map((t) => ({ uid: schematicUid(t), type: t })),
    wires: [...links, ...(task.supply === 'tncs' ? [['bet.PEN', 'PEs.0'] as [string, string]] : [])].map(([a, b], i) => ({ id: `s${i}`, a, b, color: 'barna' as const, cs: 1.5 as const, strip: 10 })),
    sw: {},
    dinOn: Object.fromEntries(task.schematic.din.map((t) => [schematicUid(t), true])),
    dinState: {},
    motion: true,
  }
  for (const r of combos(rig)) {
    const uf = nets(r)
    const ret = task.supply === 'tncs' ? 'bet.PEN' : 'bet.N'
    if (uf.same('bet.L', ret) || uf.same('bet.L', task.supply === 'tncs' ? 'PEs.0' : 'bet.PE')) return { ok: false, msg: 'Zárlat van a kapcsolásban (valamelyik állásban L összeér N-nel vagy PE-vel).' }
  }
  const f = task.functional(functionalCtx(rig))
  const bad = f.find((x) => x.sev === 'error' || x.sev === 'critical')
  if (bad) return { ok: false, msg: bad.msg }
  const uf = nets(rig)
  for (const id of task.schematic.mounts) if (task.loads.some((l) => l.id === id) && !uf.same(`${id}.PE`, task.supply === 'tncs' ? 'PEs.0' : 'bet.PE'))
    return { ok: false, msg: `Működik, de a(z) ${id} védővezetője (PE) hiányzik.` }
  return { ok: true, msg: 'Helyes kapcsolás.' }
}

export interface ScoreState extends Rig {
  belt: string[]
  lateTools: string[]
  toolMisuse: number
  materials: Partial<Record<ItemType, number>>
  wireStock: string[]
  cuts: Record<string, Cut>
  wasted: number
  rajz: RajzAns
  insp: Insp
  tested: { sw: Record<string, boolean>; motion: boolean; rcdTest: boolean }
  notes: LogEntry[]
  supplyU: number
}

export function expectedCount(task: Task, t: ItemType): number {
  const din = task.din[t as keyof typeof task.din]
  if (din !== undefined) return din
  return task.layout.mounts.filter((m) => m.expect === t).length
}

export function computeResult(s: ScoreState) {
  const task = taskOf(s)
  const findings: Finding[] = inspect(s)
  const extra: Finding[] = []

  // Rajz
  const quiz = quizFor(task)
  const symOk = quiz.filter((k, i) => s.rajz.sym[i] === k).length
  const segs = task.segments ?? []
  const segOk = segs.filter((g) => Number(s.rajz.seg[g.id]) === g.answer).length
  const sch = checkSchematic(task, s.rajz.links)
  const rajz = segs.length
    ? Math.round((5 * symOk) / quiz.length + (5 * segOk) / segs.length + (sch.ok ? 5 : 0))
    : Math.round((7 * symOk) / quiz.length + (sch.ok ? 8 : 0))

  // Anyag
  let good = 0
  for (const it of ITEMS) {
    const want = expectedCount(task, it.type)
    const n = s.materials[it.type] ?? 0
    if (n === want || (task.optionalDin.includes(it.type as never) && n <= want)) good++
    else extra.push({ sev: 'warn', msg: `Anyag: ${it.name} – ${n} db vételezve, ${want} db kellett.` })
  }
  const wireOk = WIRE_NEED.filter((k) => s.wireStock.includes(k)).length
  if (wireOk < WIRE_NEED.length) extra.push({ sev: 'warn', msg: 'Vezeték: világításhoz 1,5 mm², a dugaljkörhöz 2,5 mm², mindkettőből barna, kék, zöld-sárga kell.' })
  const anyag = Math.round(8 * 0.7 * (good / ITEMS.length) + 8 * 0.3 * (wireOk / WIRE_NEED.length))

  // Szerszámválasztás (előkészítéskor) és használat
  const initial = s.belt.filter((t) => !s.lateTools.includes(t))
  const need = TOOLS.filter((t) => t.role === 'need')
  const picked = need.filter((t) => initial.includes(t.id)).length
  const wrong = TOOLS.filter((t) => t.role === 'wrong' && initial.includes(t.id))
  for (const t of wrong) extra.push({ sev: 'error', msg: `Szerszám: ${t.name} – ${t.why}` })
  for (const t of need.filter((t) => !initial.includes(t.id))) extra.push({ sev: 'warn', msg: `Előkészítéskor hiányzott: ${t.name} – ${t.why}` })
  const szerszam = Math.max(0, Math.round((10 * picked) / need.length - wrong.length * 2))
  const hasznalat = Math.max(0, 7 - s.toolMisuse - s.lateTools.length)

  // Kábelcsatorna
  let cs = 0
  for (const p of task.layout.pieces) {
    const c = s.cuts[p.id]
    if (!c?.mounted) continue
    const err = Math.abs(c.len - p.len) * 1000
    const acc = err <= 2 ? 1 : err <= 5 ? 0.5 : 0
    const ang = c.ends.every((e, i) => e === p.ends[i]) ? 1 : 0
    cs += (ang ? acc * 0.7 : 0) + (c.deburred ? 0.15 : 0) + ang * 0.15 - (c.rough ? 0.3 : 0)
  }
  const missing = task.layout.pieces.filter((p) => !s.cuts[p.id]?.mounted).length
  if (missing) extra.push({ sev: 'error', msg: `${missing} csatornadarab nincs felszerelve.` })
  const csatorna = Math.max(0, Math.round((13 * cs) / task.layout.pieces.length + (s.cuts.H1?.leveled ? 2 : 0) - (s.wasted > 0.5 ? 1 : 0)))

  // Bekötés
  let vez = s.wires.length ? 20 : 0
  for (const f of findings) vez -= f.sev === 'error' || f.sev === 'critical' ? 3 : f.sev === 'warn' ? 1 : 0
  vez = Math.max(0, vez)

  // Ellenőrzés, mérés
  const i = s.insp
  const biztonsag = i.order.filter((v, k) => v === k).length
  if (i.order.length && biztonsag < 5) extra.push({ sev: 'warn', msg: `Feszültségmentesítés 5 szabálya: ${biztonsag}/5 jó helyen.` })
  const shortOrPe = findings.some((f) => /Zárlat|Testzárlat|N és PE|védővezető \(PE\) nincs/.test(f.msg))
  let iso = 0
  if (i.isoRes) {
    if (i.isoV === 500) iso += 2
    else extra.push({ sev: 'warn', msg: '230 V-os áramköröknél a szigetelésmérő feszültsége 500 V DC (MSZ HD 60364-6).' })
    if (i.isoLimit === '1') iso += 2
    else extra.push({ sev: 'warn', msg: '500 V mérőfeszültségnél a határérték ≥ 1 MΩ.' })
    if (i.isoJudge === (shortOrPe ? 'nok' : 'ok')) iso += 2
    else extra.push({ sev: 'error', msg: 'A szigetelési/folytonossági mérés értékelése hibás.' })
  } else extra.push({ sev: 'error', msg: 'Szigetelési ellenállást és PE-folytonosságot nem mértél.' })
  if (!i.vfree) extra.push({ sev: 'error', msg: 'Nem ellenőrizted a feszültségmentességet.' })

  const switches = task.layout.mounts.filter((m) => m.kind === 'switch').map((m) => m.id)
  const motion = task.layout.mounts.some((m) => m.expect === 'lampMotion')
  const funcTotal = switches.length + (motion ? 1 : 0) + 1
  const funcDone = switches.filter((k) => s.tested.sw[k]).length + (motion && s.tested.motion ? 1 : 0) + (s.tested.rcdTest ? 1 : 0)
  const funkcio = Math.round((4 * funcDone) / funcTotal)
  if (funcDone < funcTotal) extra.push({ sev: 'warn', msg: 'A funkciópróba nem terjedt ki minden kezelőszervre és az ÁVK-próbagombra.' })

  let meres = 0
  const num = (x: string) => Number(x.replace(',', '.'))
  if (i.iRead && i.iValue > 0 && Math.abs(num(i.jk.I) - i.iValue) < 0.005) meres += 2
  else extra.push({ sev: 'warn', msg: 'A jegyzőkönyvben nincs (helyes) mért áramérték.' })
  const pTrue = s.supplyU * i.iValue
  if (pTrue > 0 && Math.abs(num(i.jk.P) - pTrue) / pTrue < 0.03) meres += 4
  else extra.push({ sev: 'warn', msg: `Teljesítmény: P = U · I (ohmos terhelésnél cos φ = 1)${pTrue > 0 ? ` ≈ ${pTrue.toFixed(1)} W` : ''}.` })
  if (i.uRead && Math.abs(num(i.jk.U) - s.supplyU) < 0.5) meres += 2
  const inTol = s.supplyU >= 207 && s.supplyU <= 253
  if (i.jk.judge && (i.jk.judge === 'ok') === inTol) meres += 2
  else extra.push({ sev: 'warn', msg: 'Tűréshatár: 230 V ±10% → 207–253 V (MSZ EN 50160).' })

  const parts = [
    { name: 'Rajzi dokumentáció értelmezése', v: rajz, max: 15 },
    { name: 'Anyagválasztás', v: anyag, max: 8 },
    { name: 'Szerszámválasztás', v: szerszam, max: 10 },
    { name: 'Szerszámhasználat', v: hasznalat, max: 7 },
    { name: 'Kábelcsatorna – pontosság, esztétika', v: csatorna, max: 15 },
    { name: 'Bekötés helyessége', v: vez, max: 20 },
    { name: 'Feszültségmentesítés 5 szabálya', v: biztonsag, max: 5 },
    { name: 'Szigetelés, PE folytonosság', v: iso, max: 6 },
    { name: 'Funkciópróba', v: funkcio, max: 4 },
    { name: 'Mérés, jegyzőkönyv', v: meres, max: 10 },
  ]
  const total = parts.reduce((a, p) => a + p.v, 0)
  const notes = s.notes.filter((n) => n.sev !== 'info' && n.sev !== 'event') as Finding[]
  const critical = [...findings, ...notes].filter((f) => f.sev === 'critical')
  return { parts, total, critical, findings, extra, notes, rajzDetail: { symOk, quiz, segOk, segs, sch } }
}

// ---------- Hivatalos értékelés (KKK 2024.08.29 v4, 12/2020. Korm. rendelet 290. §) ----------
export function grade(pct: number): { jegy: number; nev: string } {
  const p = Math.round(pct)
  if (p >= 80) return { jegy: 5, nev: 'jeles' }
  if (p >= 60) return { jegy: 4, nev: 'jó' }
  if (p >= 50) return { jegy: 3, nev: 'közepes' }
  if (p >= 40) return { jegy: 2, nev: 'elégséges' }
  return { jegy: 1, nev: 'elégtelen' }
}

export interface SheetRow {
  name: string
  /** a KKK szerinti súly a projektfeladaton belül, % */
  weight: number
  /** elért arány 0..1 */
  ratio: number
  basis: string
}

type Result = ReturnType<typeof computeResult>
const part = (r: Result, ...names: string[]) => {
  const ps = r.parts.filter((p) => names.includes(p.name))
  const max = ps.reduce((a, p) => a + p.max, 0)
  return max ? ps.reduce((a, p) => a + p.v, 0) / max : 0
}

/** A II. vizsgarész (épületvillamossági szerelés, a projekt 40%-a) értékelőlapja */
export function sheetII(r: Result): SheetRow[] {
  return [
    { name: 'Rajzi dokumentáció értelmezése', weight: 10, ratio: part(r, 'Rajzi dokumentáció értelmezése'), basis: 'rajzjelek, érszámok, áramútrajz' },
    { name: 'Eszközök és mérőeszközök kiválasztása, helyes használata', weight: 20, ratio: part(r, 'Anyagválasztás', 'Szerszámválasztás', 'Szerszámhasználat'), basis: 'anyag, szerszám, használat' },
    {
      name: 'A végrehajtott feladat, mérési és ellenőrzési eredmények bemutatása, megvédése',
      weight: 10,
      ratio: part(r, 'Kábelcsatorna – pontosság, esztétika', 'Bekötés helyessége', 'Feszültségmentesítés 5 szabálya', 'Szigetelés, PE folytonosság', 'Funkciópróba', 'Mérés, jegyzőkönyv'),
      basis: 'kivitelezés, bekötés, ellenőrzés, mérés, jegyzőkönyv',
    },
  ]
}

/** Súlyozott eredmény a sorokból, a sorok súlyösszegéhez viszonyítva (0..100) */
export const sheetPct = (rows: SheetRow[]) => (100 * rows.reduce((a, x) => a + x.weight * x.ratio, 0)) / rows.reduce((a, x) => a + x.weight, 0)

export interface ExamRecord {
  ii?: { pct: number; invalid: boolean; task: string; at: number }
  iii?: { pct: number; invalid: boolean; at: number }
  interaktiv?: { pct: number; at: number }
  /** a portfólió: Hot Seat portfólióvédés eredménye vagy saját becslés, % */
  portfolio?: number
  portfolioSrc?: 'hotseat' | 'becsles'
}

/**
 * Szakmai vizsga előrejelzés: projekt = 20% portfólió + 40% II. rész + 40% III. rész,
 * szakmai vizsga = 70% projekt + 30% interaktív. Bármely vizsgatevékenység 40% alatt → sikertelen.
 * Hiányzó részt nem találunk ki: csak a meglévők alapján, jelölve.
 */
export function forecast(rec: ExamRecord) {
  const proj: { w: number; v: number }[] = []
  if (rec.portfolio !== undefined) proj.push({ w: 20, v: rec.portfolio })
  if (rec.ii) proj.push({ w: 40, v: rec.ii.invalid ? 0 : rec.ii.pct })
  if (rec.iii) proj.push({ w: 40, v: rec.iii.invalid ? 0 : rec.iii.pct })
  const projPct = proj.length ? proj.reduce((a, x) => a + x.w * x.v, 0) / proj.reduce((a, x) => a + x.w, 0) : undefined
  const invalid = !!(rec.ii?.invalid || rec.iii?.invalid)
  const acts: { w: number; v: number }[] = []
  if (projPct !== undefined) acts.push({ w: 70, v: projPct })
  if (rec.interaktiv) acts.push({ w: 30, v: rec.interaktiv.pct })
  const total = acts.length ? acts.reduce((a, x) => a + x.w * x.v, 0) / acts.reduce((a, x) => a + x.w, 0) : undefined
  const complete = rec.portfolio !== undefined && !!rec.ii && !!rec.iii && !!rec.interaktiv
  const failed = invalid || (projPct !== undefined && projPct < 40) || (rec.interaktiv !== undefined && rec.interaktiv.pct < 40)
  return { projPct, total, complete, failed, invalid, grade: total !== undefined && !failed ? grade(total) : grade(0) }
}

/** A III. vizsgarész (fogyasztásmérő hely, a projekt 40%-a) értékelőlapja a szerelői ellenőrzés megállapításaiból */
export function sheetIII(r: Result): SheetRow[] {
  const bad = (re: RegExp) => r.findings.filter((f) => (f.sev === 'error' || f.sev === 'critical') && re.test(f.msg)).length
  const shock = /PE|PEN|EPH|ÁVK|védővezető|nullázás|N és PE|Testzárlat/
  const prot = /kismegszakító|túláramvédelem|főkismegszakító|B32|Túlfeszültség/
  const shockErr = bad(shock)
  const protErr = bad(prot) + (r.findings.some((f) => /Túlfeszültség-levezető nincs/.test(f.msg)) ? 1 : 0)
  const wireErr = r.findings.filter((f) => (f.sev === 'error' || f.sev === 'critical') && !shock.test(f.msg) && !prot.test(f.msg)).length
  const clamp = (x: number) => Math.max(0, Math.min(1, x))
  return [
    { name: 'Mérőszekrény, mérő elhelyezése, esztétikai kivitel', weight: 5, ratio: part(r, 'Kábelcsatorna – pontosság, esztétika'), basis: 'csatorna, elrendezés' },
    { name: 'Túláram- és túlfeszültség-védelem, helyes technológia', weight: 5, ratio: clamp(1 - protErr * 0.34), basis: `${protErr} hiba` },
    { name: 'Áramütés elleni védelem kialakítása', weight: 20, ratio: r.critical.length ? 0 : clamp(1 - shockErr * 0.34), basis: r.critical.length ? 'kritikus hiba → érvénytelen' : `${shockErr} hiba` },
    { name: 'Kábel-/vezetékbekötés a főelosztóba', weight: 10, ratio: r.parts.find((p) => p.name === 'Bekötés helyessége')!.v ? clamp(1 - wireErr * 0.2) : 0, basis: `${wireErr} hiba` },
  ]
}
