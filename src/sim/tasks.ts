import type { DinType } from './catalog'
import type { Finding, Rig, Wire } from './circuit'
import { buildLayout, type DeviceType, type Layout, type Mount } from './layout'

export interface LoadDef {
  id: string
  name: string
  mcb: DinType
  socket?: boolean
  watt?: number
}

/** Amit a feladat-specifikus működés-ellenőrzés megkap a hálózatmodelltől */
export interface FunctionalCtx {
  rig: Rig
  /** minden kapcsoló-, nyomógomb- és relé-állapot kombinációja, bekapcsolt védelmekkel */
  combos: () => Rig[]
  same: (r: Rig, a: string, b: string) => boolean
  lit: (r: Rig, load: string) => boolean
  dinUid: (t: DinType) => string | undefined
  /** mint same, de a felsorolt érintkezők ("uid.a-b", vagy "bridge") kényszerítetten nyitva */
  sameOpen: (r: Rig, open: string[], a: string, b: string) => boolean
}

export interface OneLineCircuit {
  mcb: string
  title: string
  chain: { sym: string; label: string }[]
}

export interface Task {
  id: string
  title: string
  short: string
  intro: string
  bullets: string[]
  layout: Layout
  din: Partial<Record<DinType, number>>
  optionalDin: DinType[]
  loads: LoadDef[]
  functional: (ctx: FunctionalCtx) => Finding[]
  /** 'nyariKonyha' = a vizsgaközponti minta saját rajza érszámokkal */
  oneLine: 'nyariKonyha' | OneLineCircuit[]
  schematic: { mounts: string[]; din: DinType[]; goal: string }
  measure: { currentLoads: string[]; currentLabel: string; voltageAt: string }
  extraSymbols: string[]
  /** érszám-feladat az egyvonalas rajzon (csak ahol a rajz ezt egyértelműen megadja) */
  segments?: { id: string; label: string; answer: number; x: number; y: number }[]
  /** 'tncs': PEN-betáp mérőszekrénnyel (III. vizsgarész); alapértelmezés: TN-S betáp a lakáselosztóba */
  supply?: 'tncs'
  /** feladatfüggő minimális keresztmetszet egy vezetékre (mm²), ha nincs, az általános szabály él */
  minCs?: (rig: Rig, w: Wire) => number | undefined
  /** melyik vizsgarészbe számít: II. (épületvillamosság) vagy III. (mérőhely) */
  part?: 'II' | 'III'
}

const m = (id: string, label: string, kind: Mount['kind'], pos: [number, number], expect: DeviceType): Mount => ({ id, label, kind, pos, expect })

const phaseCheck = (ctx: FunctionalCtx, loads: string[], name: string): Finding[] => {
  for (const r of ctx.combos())
    for (const l of loads)
      if (r.mounts[l] && !ctx.lit(r, l) && ctx.same(r, `${l}.L`, 'bet.L'))
        return [{ sev: 'critical', msg: `${name}: kikapcsolt állapotban fázis marad a lámpán – nem a fázist kapcsolod.` }]
  return []
}

// ---------- 1. Nyári konyha (Nagykunsági Független Vizsgaközpont, 2026-os minta) ----------
const nyariKonyha: Task = {
  id: 'nyariKonyha',
  title: 'Nyári konyha villamos hálózata',
  short: 'Mozgásérzékelős lámpa, váltó–kereszt–váltó, 2P+F dugalj',
  intro: 'Valós 2026-os vizsgaközponti mintafeladat. Egyfázisú rendszer, 230 V.',
  bullets: [
    'Elosztó: ÁVK 40 A/30 mA, kismegszakítók a rajz szerint, lehetőség szerint túlfeszültség-levezető.',
    '1. áramkör: 101-es kapcsoló + mozgásérzékelős „Lámpa 1”. A lámpa a kapcsolóval feszültségmentesíthető.',
    '2. áramkör: két váltó- és egy keresztkapcsoló, a „Lámpa 2” három helyről kapcsolható.',
    '3. áramkör: egyfázisú 2P+F dugaszolóaljzat.',
    'Mérd meg a 2. áramkör áramát (Lámpa 2 világít), számold ki a felvett teljesítményt. Mérd a fázisfeszültséget a dugaljban, értékeld a tűréshatárhoz. Készíts jegyzőkönyvet.',
  ],
  layout: buildLayout({
    mainY: 0.52,
    x0: 0.06,
    cornerMount: 'SO',
    mounts: [
      m('L1', 'Lámpa 1 (mozgásérzékelős)', 'lamp', [0.5, 0.86], 'lampMotion'),
      m('S1', 'Kapcsoló (1. áramkör)', 'switch', [0.5, 0.3], 'sw101'),
      m('V1', 'Kapcsoló V1 (2. áramkör)', 'switch', [0.72, 0.3], 'sw106'),
      m('K', 'Kapcsoló K (2. áramkör)', 'switch', [0.92, 0.3], 'sw107'),
      m('V2', 'Kapcsoló V2 (2. áramkör)', 'switch', [1.12, 0.3], 'sw106'),
      m('L2', 'Lámpa 2', 'lamp', [1.12, 0.86], 'lamp'),
      m('SO', 'Dugaszolóaljzat (3. áramkör)', 'socket', [1.36, 0.22], 'socket'),
    ],
  }),
  din: { rcd40: 1, mcbB10: 2, mcbB16: 1, spd: 1 },
  optionalDin: ['spd'],
  loads: [
    { id: 'L1', name: 'Lámpa 1', mcb: 'mcbB10', watt: 40 },
    { id: 'L2', name: 'Lámpa 2', mcb: 'mcbB10', watt: 60 },
    { id: 'SO', name: 'Dugalj', mcb: 'mcbB16', socket: true },
  ],
  functional: (ctx) => {
    const f: Finding[] = []
    const { rig } = ctx
    if (rig.mounts.L1) {
      let ok = true
      for (const r of ctx.combos()) if (ctx.lit(r, 'L1') !== ((r.sw.S1 ?? 0) === 1)) ok = false
      f.push(ok ? { sev: 'ok', msg: '1. áramkör: Lámpa 1 kapcsolható, mozgásérzékelővel működik.' } : { sev: 'error', msg: '1. áramkör: a Lámpa 1 nem a 101-es kapcsoló szerint működik.' })
      if (ok) f.push(...phaseCheck(ctx, ['L1'], '1. áramkör'))
    }
    if (rig.mounts.L2) {
      const t = ctx.combos().map((r) => ({ x: ((r.sw.V1 ?? 0) + (r.sw.K ?? 0) + (r.sw.V2 ?? 0)) % 2, lit: ctx.lit(r, 'L2') }))
      const ok = t.every((q) => q.lit === (q.x === 1)) || t.every((q) => q.lit === (q.x === 0))
      f.push(ok ? { sev: 'ok', msg: '2. áramkör: Lámpa 2 három helyről kapcsolható.' } : { sev: 'error', msg: '2. áramkör: a Lámpa 2 nem kapcsolható mindhárom helyről (váltó–kereszt–váltó hibás).' })
      if (ok) f.push(...phaseCheck(ctx, ['L2'], '2. áramkör'))
    }
    return f
  },
  oneLine: 'nyariKonyha',
  schematic: { mounts: ['V1', 'K', 'V2', 'L2'], din: [], goal: 'Lámpa 2 kapcsolása három helyről (váltó–kereszt–váltó)' },
  measure: { currentLoads: ['L2'], currentLabel: 'a 2. áramkör fázisvezetőjére (Lámpa 2 világít)', voltageAt: 'SO' },
  extraSymbols: [],
  segments: [
    { id: 's1a', label: 'B10 → leágazás (1. kör)', answer: 3, x: 66, y: 168 },
    { id: 's1sw', label: 'leágazás → 101-es kapcsoló', answer: 2, x: 40, y: 212 },
    { id: 's1l', label: 'leágazás → Lámpa 1', answer: 3, x: 88, y: 250 },
    { id: 's2a', label: 'B10 → V1 (2. kör)', answer: 3, x: 186, y: 168 },
    { id: 's2b', label: 'V1 → K', answer: 4, x: 268, y: 208 },
    { id: 's2c', label: 'K → V2', answer: 4, x: 348, y: 208 },
    { id: 's2d', label: 'V2 → Lámpa 2', answer: 3, x: 430, y: 208 },
    { id: 's3', label: 'B16 → dugalj (3. kör)', answer: 3, x: 346, y: 140 },
  ],
}

// ---------- közös: nyomógombos vezérlés (lépcsőházi automata / impulzusrelé) ----------
const pbMounts = (lampLabel: string) => [
  m('NY1', 'Nyomógomb – földszint', 'switch', [0.5, 0.3], 'pb'),
  m('NY2', 'Nyomógomb – 1. emelet', 'switch', [0.8, 0.3], 'pb'),
  m('NY3', 'Nyomógomb – 2. emelet', 'switch', [1.1, 0.3], 'pb'),
  m('L1', `${lampLabel} 1`, 'lamp', [0.65, 0.86], 'lamp'),
  m('L2', `${lampLabel} 2`, 'lamp', [1.1, 0.86], 'lamp'),
  m('SO', 'Dugaszolóaljzat (takarítás)', 'socket', [1.36, 0.22], 'socket'),
]
const anyPressed = (r: Rig) => ['NY1', 'NY2', 'NY3'].some((k) => (r.sw[k] ?? 0) === 1)
const pbLoads: LoadDef[] = [
  { id: 'L1', name: 'Lámpa 1', mcb: 'mcbB10', watt: 40 },
  { id: 'L2', name: 'Lámpa 2', mcb: 'mcbB10', watt: 40 },
  { id: 'SO', name: 'Dugalj', mcb: 'mcbB16', socket: true },
]

function drivenFunctional(ctx: FunctionalCtx, type: 'timer' | 'ir'): Finding[] {
  const uid = ctx.dinUid(type)
  const name = type === 'timer' ? 'lépcsőházi automata' : 'impulzusrelé'
  if (!uid) return [{ sev: 'error', msg: `Nincs ${name} az elosztóban – a vezérlés nem működhet.` }]
  const f: Finding[] = []
  let ctrlOk = true, lampOk = true
  for (const r of ctx.combos()) {
    const active =
      type === 'timer'
        ? ctx.same(r, `${uid}.S`, 'bet.L') && ctx.same(r, `${uid}.L`, 'bet.L') && ctx.same(r, `${uid}.N`, 'bet.N')
        : (ctx.same(r, `${uid}.A1`, 'bet.L') && ctx.same(r, `${uid}.A2`, 'bet.N')) || (ctx.same(r, `${uid}.A2`, 'bet.L') && ctx.same(r, `${uid}.A1`, 'bet.N'))
    if (active !== anyPressed(r)) ctrlOk = false
    const on = (r.dinState[uid] ?? 0) === 1
    for (const l of ['L1', 'L2']) if (r.mounts[l] && ctx.lit(r, l) !== on) lampOk = false
  }
  f.push(
    ctrlOk
      ? { sev: 'ok', msg: `Nyomógombok: bármelyik gomb ${type === 'timer' ? 'indítja az automatát' : 'meghúzza a relét'}.` }
      : { sev: 'error', msg: `Nyomógombok: nem minden gomb ${type === 'timer' ? 'indítja az automatát' : 'húzza meg a relét'}, vagy gomb nélkül is működik.` },
    lampOk
      ? { sev: 'ok', msg: `Lámpák: a ${name} kimenete kapcsolja mindkét lámpát.` }
      : { sev: 'error', msg: `Lámpák: nem a ${name} kimenetéről működnek.` },
  )
  if (lampOk) f.push(...phaseCheck(ctx, ['L1', 'L2'], 'Világítás'))
  return f
}

// ---------- 2. Lépcsőház lépcsőházi automatával ----------
const lepcsohaz: Task = {
  id: 'lepcsohaz',
  title: 'Társasház lépcsőházi világítása',
  short: 'Lépcsőházi automata, 3 nyomógomb, 2 lámpa, dugalj',
  intro: 'Világításvezérlés vezérlőelemmel (KKK II. rész, 3. feladattípus). Egyfázisú rendszer, 230 V.',
  bullets: [
    'Elosztó: ÁVK 40 A/30 mA, B10 a világításnak, B16 a dugaljnak, lépcsőházi automata (LA), lehetőség szerint túlfeszültség-levezető.',
    'Három szinten egy-egy nyomógomb: bármelyik megnyomására mindkét lámpa felkapcsol, és az idő leteltével lekapcsol.',
    'Négyvezetékes bekötés: a nyomógombok a fázist adják az automata nyomógomb-bemenetére.',
    'Takarításhoz egy 2P+F dugaszolóaljzat a lépcsőházban.',
    'Mérd meg a világítási áramkör áramát mindkét lámpa világításakor, számold ki a teljesítményt; mérd a dugalj feszültségét, értékeld.',
  ],
  layout: buildLayout({ mainY: 0.52, x0: 0.06, cornerMount: 'SO', mounts: pbMounts('Lépcsőházi lámpa') }),
  din: { rcd40: 1, mcbB10: 1, mcbB16: 1, timer: 1, spd: 1 },
  optionalDin: ['spd'],
  loads: pbLoads,
  functional: (ctx) => drivenFunctional(ctx, 'timer'),
  oneLine: [
    { mcb: 'B10A', title: 'Világítás', chain: [{ sym: 'box:LA', label: 'lépcsőházi automata' }, { sym: 'nyomogomb', label: 'NY1–NY3' }, { sym: 'lampa', label: 'L1, L2' }] },
    { mcb: 'B16A', title: 'Dugalj', chain: [{ sym: 'dugalj', label: '1× 2P+F' }] },
  ],
  schematic: { mounts: ['NY1', 'NY2', 'L1'], din: ['timer'], goal: 'Lépcsőházi automata négyvezetékes bekötése két nyomógombbal' },
  measure: { currentLoads: ['L1', 'L2'], currentLabel: 'a világítási áramkör fázisvezetőjére (mindkét lámpa világít)', voltageAt: 'SO' },
  extraSymbols: ['nyomogomb'],
}

// ---------- 3. Folyosó impulzusrelével ----------
const impulzus: Task = {
  id: 'impulzus',
  title: 'Folyosóvilágítás impulzusrelével',
  short: 'Impulzusrelé (távkapcsoló), 3 nyomógomb, 2 lámpa, dugalj',
  intro: 'Világításvezérlés vezérlőelemmel (KKK II. rész, 3. feladattípus). Egyfázisú rendszer, 230 V.',
  bullets: [
    'Elosztó: ÁVK 40 A/30 mA, B10 a világításnak, B16 a dugaljnak, impulzusrelé, lehetőség szerint túlfeszültség-levezető.',
    'Három nyomógomb: bármelyik megnyomása átváltja a világítást (be → ki → be).',
    'A relé tekercsét (A1–A2) a nyomógombok működtetik, a 11–14 érintkező kapcsolja a lámpák fázisát.',
    'Egy 2P+F dugaszolóaljzat a folyosón.',
    'Mérd meg a világítási áramkör áramát mindkét lámpa világításakor, számold ki a teljesítményt; mérd a dugalj feszültségét, értékeld.',
  ],
  layout: buildLayout({ mainY: 0.52, x0: 0.06, cornerMount: 'SO', mounts: pbMounts('Folyosói lámpa') }),
  din: { rcd40: 1, mcbB10: 1, mcbB16: 1, ir: 1, spd: 1 },
  optionalDin: ['spd'],
  loads: pbLoads,
  functional: (ctx) => drivenFunctional(ctx, 'ir'),
  oneLine: [
    { mcb: 'B10A', title: 'Világítás', chain: [{ sym: 'box:IR', label: 'impulzusrelé' }, { sym: 'nyomogomb', label: 'NY1–NY3' }, { sym: 'lampa', label: 'L1, L2' }] },
    { mcb: 'B16A', title: 'Dugalj', chain: [{ sym: 'dugalj', label: '1× 2P+F' }] },
  ],
  schematic: { mounts: ['NY1', 'NY2', 'L1'], din: ['ir'], goal: 'Impulzusrelé bekötése két nyomógombbal' },
  measure: { currentLoads: ['L1', 'L2'], currentLabel: 'a világítási áramkör fázisvezetőjére (mindkét lámpa világít)', voltageAt: 'SO' },
  extraSymbols: ['nyomogomb'],
}

// ---------- 4. Nappali csillárkapcsolóval ----------
const csillar: Task = {
  id: 'csillar',
  title: 'Nappali: csillárkapcsoló és dugaljak',
  short: 'Csillárkapcsoló (105) két lámpakörrel, 2 dugalj',
  intro: 'Szerelvényezés, falon kívüli vezetékezés (KKK II. rész, 5. feladattípus). Egyfázisú rendszer, 230 V.',
  bullets: [
    'Elosztó: ÁVK 40 A/30 mA, B10 a világításnak, B16 a dugaljaknak, lehetőség szerint túlfeszültség-levezető.',
    'Csillárkapcsoló (105): az egyik billentyű az 1. lámpakört, a másik a 2. lámpakört kapcsolja, a kettő együtt is.',
    'Két 2P+F dugaszolóaljzat egy áramkörön.',
    'Mérd meg a világítási áramkör áramát mindkét kör bekapcsolásakor, számold ki a teljesítményt; mérd a 2. dugalj feszültségét, értékeld.',
  ],
  layout: buildLayout({
    mainY: 0.52,
    x0: 0.06,
    cornerMount: 'SO2',
    mounts: [
      m('L1', 'Csillár – 1. lámpakör', 'lamp', [0.6, 0.86], 'lamp'),
      m('L2', 'Csillár – 2. lámpakör', 'lamp', [0.9, 0.86], 'lamp'),
      m('S1', 'Csillárkapcsoló', 'switch', [0.6, 0.3], 'sw105'),
      m('SO1', 'Dugaszolóaljzat 1', 'socket', [1.0, 0.3], 'socket'),
      m('SO2', 'Dugaszolóaljzat 2', 'socket', [1.36, 0.22], 'socket'),
    ],
  }),
  din: { rcd40: 1, mcbB10: 1, mcbB16: 1, spd: 1 },
  optionalDin: ['spd'],
  loads: [
    { id: 'L1', name: '1. lámpakör', mcb: 'mcbB10', watt: 60 },
    { id: 'L2', name: '2. lámpakör', mcb: 'mcbB10', watt: 60 },
    { id: 'SO1', name: 'Dugalj 1', mcb: 'mcbB16', socket: true },
    { id: 'SO2', name: 'Dugalj 2', mcb: 'mcbB16', socket: true },
  ],
  functional: (ctx) => {
    if (!ctx.rig.mounts.S1) return []
    const rows = ctx.combos().map((r) => ({ s: r.sw.S1 ?? 0, a: ctx.lit(r, 'L1'), b: ctx.lit(r, 'L2') }))
    const want = (s: number, swap: boolean) => {
      const one = s === 1 || s === 3, two = s === 2 || s === 3
      return swap ? [two, one] : [one, two]
    }
    const ok = [false, true].some((swap) => rows.every((q) => { const [a, b] = want(q.s, swap); return q.a === a && q.b === b }))
    const f: Finding[] = [ok ? { sev: 'ok', msg: 'Csillárkapcsoló: a két lámpakör külön és együtt is kapcsolható.' } : { sev: 'error', msg: 'Csillárkapcsoló: a lámpakörök nem a 105-ös kapcsoló szerint működnek.' }]
    if (ok) f.push(...phaseCheck(ctx, ['L1', 'L2'], 'Világítás'))
    return f
  },
  oneLine: [
    { mcb: 'B10A', title: 'Világítás', chain: [{ sym: 'csillar', label: '105' }, { sym: 'lampa', label: 'csillár 2 kör' }] },
    { mcb: 'B16A', title: 'Dugaljak', chain: [{ sym: 'dugalj', label: 'SO1' }, { sym: 'dugalj', label: 'SO2' }] },
  ],
  schematic: { mounts: ['S1', 'L1', 'L2'], din: [], goal: 'Csillárkapcsoló bekötése két lámpakörrel' },
  measure: { currentLoads: ['L1', 'L2'], currentLabel: 'a világítási áramkör fázisvezetőjére (mindkét kör világít)', voltageAt: 'SO2' },
  extraSymbols: [],
}

// ---------- 5. Mérőhely (III. vizsgarész) ----------
const L = 'bet.L', RET = 'bet.PEN'
const merohely: Task = {
  id: 'merohely',
  part: 'III',
  supply: 'tncs',
  title: 'Egyfázisú fogyasztásmérő hely',
  short: 'Mérőszekrény, főkismegszakító, 1F direkt mérő, PEN-szétválasztás, lakás főelosztó',
  intro: 'III. vizsgarész: egyfázisú direkt mérés kialakítása oktatási szerelőlapon. A betáp TN-C (L + PEN). A kiadott mérő 1–3–4–6 kapcsos, átmenő nullás.',
  bullets: [
    'Mérőszekrény: plombálható főkismegszakító a mérő ELŐTT (B32), egyfázisú direkt fogyasztásmérő, főföldelő (PE) sín és N-kapocs gyári híddal.',
    'A PEN-t a főföldelő (PE) sínre kösd; az N a hídon át, az N-kapocsról indul. A szétválasztás után N és PE nem köthető újra össze.',
    'Mérő: 1 = méretlen L be, 3 = mért L ki, 4 = N be, 6 = N ki. Méretlen leágazás nem lehet.',
    'Az EPH (fő védőösszekötő) vezetőt a főföldelő sínre kösd.',
    'Méretlen és mért fővezeték: 10 mm² Cu; EPH legalább 6 mm².',
    'Lakás főelosztó (mért oldal): ÁVK 40 A/30 mA, B10 világítás (101 + lámpa), B16 dugalj, lehetőség szerint túlfeszültség-levezető.',
    'Mérd meg a mért fővezeték áramát a lámpa világításakor, számold ki a teljesítményt; mérd a dugalj feszültségét, értékeld.',
  ],
  layout: buildLayout({
    mainY: 0.52,
    x0: 0.06,
    cornerMount: 'SO',
    cabinet: true,
    mounts: [
      m('L1', 'Lámpa 1', 'lamp', [0.62, 0.86], 'lamp'),
      m('S1', 'Kapcsoló (101)', 'switch', [0.62, 0.3], 'sw101'),
      m('SO', 'Dugaszolóaljzat', 'socket', [1.36, 0.22], 'socket'),
    ],
  }),
  din: { mcbB32: 1, meter1f: 1, rcd40: 1, mcbB10: 1, mcbB16: 1, spd: 1 },
  optionalDin: ['spd'],
  loads: [
    { id: 'L1', name: 'Lámpa 1', mcb: 'mcbB10', watt: 100 },
    { id: 'SO', name: 'Dugalj', mcb: 'mcbB16', socket: true },
  ],
  minCs: (rig, w) => {
    const ends = [w.a, w.b]
    if (ends.some((t) => t.startsWith('EPH.'))) return 6
    const main = (t: string) => {
      const [dev, term] = t.split('.')
      if (['bet', 'PEs', 'Nk'].includes(dev)) return true
      const d = rig.din.find((x) => x.uid === dev)
      return !!d && (d.type === 'meter1f' || (d.zone === 'cab' && d.type.startsWith('mcb')) || (d.type.startsWith('rcd') && term.endsWith('in')))
    }
    return ends.some(main) ? 10 : undefined
  },
  functional: (ctx) => {
    const f: Finding[] = []
    const { rig } = ctx
    const meter = ctx.dinUid('meter1f')
    if (!meter) return [{ sev: 'error', msg: 'Nincs fogyasztásmérő a mérőhelyen.' }]
    const onBoard = rig.din.some((d) => d.zone === 'cab')
    const base = ctx.combos()[0] ?? rig
    // fázis iránya: 1 a betáp felől, 3 a fogyasztók felé
    const in1 = ctx.sameOpen(base, [`${meter}.1-3`], `${meter}.1`, L)
    const in3 = ctx.sameOpen(base, [`${meter}.1-3`], `${meter}.3`, L)
    if (!in1 && !in3) f.push({ sev: 'error', msg: 'A mérő nem kap fázist.' })
    else if (in3 && !in1) f.push({ sev: 'error', msg: 'A mérő fázisa fordítva van bekötve (1 = méretlen L be, 3 = mért L ki).' })
    else if (in1 && in3) f.push({ sev: 'critical', msg: 'A mérő fázisága át van hidalva – méretlen vételezés.' })
    const n4 = ctx.sameOpen(base, [`${meter}.4-6`], `${meter}.4`, RET)
    const n6 = ctx.sameOpen(base, [`${meter}.4-6`], `${meter}.6`, RET)
    if (n6 && !n4) f.push({ sev: 'error', msg: 'A mérő nullája fordítva van bekötve (4 = N be, 6 = N ki).' })
    // a mérő előtti túláramvédelem
    const mainBrk = rig.din.filter((d) => d.type.startsWith('mcb')).find((d) => in1 && !ctx.sameOpen(base, [`${d.uid}.in-out`], `${meter}.1`, L))
    if (!mainBrk) f.push({ sev: 'error', msg: 'Nincs túláramvédelem a mérő előtt (plombálható főkismegszakító).' })
    else if (mainBrk.type !== 'mcbB32') f.push({ sev: 'error', msg: `A mérő előtti védelem nem a feladat szerinti B32 (${mainBrk.type.replace('mcb', '')}).` })
    else f.push({ sev: 'ok', msg: 'Mérő előtti B32 főkismegszakító rendben.' })
    // ÁVK csak a mért, szétválasztott oldalon
    for (const r of rig.din.filter((d) => d.type.startsWith('rcd')))
      if (r.zone === 'cab' || (in1 && !ctx.sameOpen(base, [`${r.uid}.Lin-Lout`], `${meter}.1`, L)))
        f.push({ sev: 'critical', msg: 'ÁVK a méretlen oldalon / a PEN-ben – csak a mért, szétválasztott hálózatban alkalmazható.' })
    // méretlen vételezés és a nulla útja
    for (const ld of ['L1', 'SO']) {
      if (!rig.mounts[ld]) continue
      const live = ctx.combos().find((r) => ctx.same(r, `${ld}.L`, L))
      if (!live) continue
      if (ctx.sameOpen(live, [`${meter}.1-3`], `${ld}.L`, L)) f.push({ sev: 'critical', msg: `${ld}: a mérő megkerülésével kap fázist – méretlen vételezés.` })
      if (ctx.sameOpen(live, [`${meter}.4-6`, 'bridge'], `${ld}.N`, 'Nk.0') && !ctx.sameOpen(live, [`${meter}.4-6`, 'bridge'], `${ld}.N`, 'PEs.0'))
        f.push({ sev: 'error', msg: `${ld}: a nulla nem a mérőn át (4→6) jut a fogyasztóhoz.` })
    }
    if (onBoard) {
      const penWire = rig.wires.find((w) => w.a === 'bet.PEN' || w.b === 'bet.PEN')
      const other = penWire ? (penWire.a === 'bet.PEN' ? penWire.b : penWire.a) : ''
      if (!penWire) f.push({ sev: 'error', msg: 'A PEN-vezető nincs bekötve.' })
      else if (!other.startsWith('PEs.')) f.push({ sev: 'error', msg: 'A PEN-t a főföldelő (PE) sínre kell kötni; az N a hídon át, az N-kapocsról indul.' })
      if (!ctx.sameOpen(base, ['bridge'], 'EPH.1', 'PEs.0')) f.push({ sev: 'error', msg: 'Az EPH (fő védőösszekötő) nincs a főföldelő sínre kötve.' })
      for (const d of rig.din.filter((x) => x.zone === 'cab' && !x.type.startsWith('mcb') && x.type !== 'meter1f'))
        f.push({ sev: 'error', msg: `${d.uid}: ${d.type === 'spd' ? 'a túlfeszültség-levezető helye egy mérőnél a mért főelosztó' : 'ez a készülék nem a mérőszekrénybe való'}.` })
    }
    if (rig.mounts.L1) {
      let ok = true
      for (const r of ctx.combos()) if (ctx.lit(r, 'L1') !== (!rig.mounts.S1 || (r.sw.S1 ?? 0) === 1)) ok = false
      f.push(ok ? { sev: 'ok', msg: 'Világítás: a lámpa a mért oldalról, kapcsolóval működik.' } : { sev: 'error', msg: 'Világítás: a lámpa nem a kapcsoló szerint működik.' })
      if (ok && rig.mounts.S1) f.push(...phaseCheck(ctx, ['L1'], 'Világítás'))
    }
    return f
  },
  oneLine: [
    { mcb: 'B32A', title: 'Mérőszekrény (méretlen → mért)', chain: [{ sym: 'box:kWh', label: '1F direkt mérő' }, { sym: 'box:FI', label: 'lakás főelosztó, ÁVK' }] },
    { mcb: 'B10A', title: 'Világítás', chain: [{ sym: 'egypolusu', label: '101' }, { sym: 'lampa', label: 'Lámpa 1' }] },
    { mcb: 'B16A', title: 'Dugalj', chain: [{ sym: 'dugalj', label: '2P+F' }] },
  ],
  schematic: { mounts: ['L1'], din: ['mcbB32', 'meter1f'], goal: 'Mérő bekötése: méretlen L → főkismegszakító → mérő 1→3, N 4→6, mért oldalon a lámpa' },
  measure: { currentLoads: ['L1'], currentLabel: 'a mért fővezetékre (a lámpa világít)', voltageAt: 'SO' },
  extraSymbols: [],
}

export const TASKS: Record<string, Task> = { nyariKonyha, lepcsohaz, impulzus, csillar, merohely }
export const TASK_LIST = Object.values(TASKS)
export const taskOf = (rig: { taskId: string }) => TASKS[rig.taskId] ?? nyariKonyha
