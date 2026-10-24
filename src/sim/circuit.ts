import { itemByType, type CrossSection, type DinType, type WireColor } from './catalog'
import type { DeviceType } from './layout'
import { taskOf, type FunctionalCtx } from './tasks'

export interface Wire {
  id: string
  a: string
  b: string
  color: WireColor
  cs: CrossSection
  strip: number
}
export interface DinDev {
  uid: string
  type: DinType
  /** 'cab' = mérőszekrény, egyébként a lakás (fő)elosztó DIN-sínje */
  zone?: 'cab'
}
export interface Rig {
  taskId: string
  mounts: Record<string, DeviceType | undefined>
  din: DinDev[]
  wires: Wire[]
  sw: Record<string, number> // mountId -> kapcsolóállás
  dinOn: Record<string, boolean> // védelmi készülékek karja
  dinState: Record<string, number> // vezérelt készülékek (impulzusrelé, lépcsőházi automata) állapota
  motion: boolean
}

export const RAIL_TERMS = 6
export const BAR_TERMS = 4
export const FIXED_TERMS = [
  'bet.L', 'bet.N', 'bet.PE',
  ...Array.from({ length: RAIL_TERMS }, (_, i) => `N.${i}`),
  ...Array.from({ length: RAIL_TERMS }, (_, i) => `PE.${i}`),
]
/** TN-C-S mérőhely: PEN betáp, mérőszekrényben PE-(főföldelő) sín és N-kapocs gyári híddal, EPH */
export const TNCS_TERMS = [
  'bet.L', 'bet.PEN',
  ...Array.from({ length: RAIL_TERMS }, (_, i) => `N.${i}`),
  ...Array.from({ length: RAIL_TERMS }, (_, i) => `PE.${i}`),
  ...Array.from({ length: BAR_TERMS }, (_, i) => `PEs.${i}`),
  ...Array.from({ length: BAR_TERMS }, (_, i) => `Nk.${i}`),
  'EPH.1',
]
export const fixedTerms = (rig: { taskId: string }) => (taskOf(rig).supply === 'tncs' ? TNCS_TERMS : FIXED_TERMS)

/** Referencia-csomópontok: honnan jön a fázis, hova tér vissza az áram, mi a védővezető */
export function refs(rig: { taskId: string }) {
  return taskOf(rig).supply === 'tncs'
    ? { L: 'bet.L', N: 'bet.PEN', PE: 'bet.PEN', Nbar: 'Nk.0', PEbar: 'PEs.0', tncs: true }
    : { L: 'bet.L', N: 'bet.N', PE: 'bet.PE', Nbar: 'bet.N', PEbar: 'bet.PE', tncs: false }
}

export function termLabel(t: string): string {
  const [dev, term] = t.split('.')
  if (dev === 'bet') return `Betáp ${term}`
  if (dev === 'N') return `N-sín ${+term + 1}`
  if (dev === 'PE') return `PE-sín ${+term + 1}`
  if (dev === 'PEs') return `Főföldelő (PE) sín ${+term + 1}`
  if (dev === 'Nk') return `N-kapocs ${+term + 1}`
  if (dev === 'EPH') return 'EPH-vezető (fő védőösszekötő)'
  return `${dev} ${term}`
}

class UF {
  p = new Map<string, string>()
  find(x: string): string {
    let r = this.p.get(x) ?? x
    if (r !== x) {
      r = this.find(r)
      this.p.set(x, r)
    }
    return r
  }
  union(a: string, b: string) {
    const ra = this.find(a), rb = this.find(b)
    if (ra !== rb) this.p.set(ra, rb)
  }
  same(a: string, b: string) {
    return this.find(a) === this.find(b)
  }
}

/** A hálózat csomópontjai adott állapotban. `open` = kényszerítetten nyitott érintkezők ("uid.Lin-Lout"). */
export function nets(rig: Rig, open: Set<string> = new Set()): UF {
  const uf = new UF()
  for (let i = 1; i < RAIL_TERMS; i++) {
    uf.union(`N.${i}`, 'N.0')
    uf.union(`PE.${i}`, 'PE.0')
  }
  if (taskOf(rig).supply === 'tncs') {
    for (let i = 1; i < BAR_TERMS; i++) {
      uf.union(`PEs.${i}`, 'PEs.0')
      uf.union(`Nk.${i}`, 'Nk.0')
    }
    // PEN-szétválasztás: gyári híd a PE-sín és az N-kapocs között
    if (!open.has('bridge')) uf.union('PEs.0', 'Nk.0')
  }
  for (const w of rig.wires) uf.union(w.a, w.b)
  for (const d of rig.din) {
    const def = itemByType[d.type]
    const st = def.driven ? (rig.dinState[d.uid] ?? 0) : rig.dinOn[d.uid] ? 1 : 0
    for (const [a, b] of def.contacts(st)) if (!open.has(`${d.uid}.${a}-${b}`)) uf.union(`${d.uid}.${a}`, `${d.uid}.${b}`)
  }
  for (const m of taskOf(rig).layout.mounts) {
    const t = rig.mounts[m.id]
    if (!t) continue
    for (const [a, b] of itemByType[t].contacts(rig.sw[m.id] ?? 0)) uf.union(`${m.id}.${a}`, `${m.id}.${b}`)
  }
  return uf
}

export interface SimResult {
  lit: Record<string, boolean>
  sockets: Record<string, { live: boolean; ok: boolean }>
  trips: { uid: string | null; reason: string }[]
}

const rcds = (rig: Rig) => rig.din.filter((d) => d.type.startsWith('rcd'))
const mcbs = (rig: Rig) => rig.din.filter((d) => d.type.startsWith('mcb'))

/** Feszültség alatti állapot: lámpák, dugaljak, kioldások. */
export function simulate(rig: Rig): SimResult {
  const res: SimResult = { lit: {}, sockets: {}, trips: [] }
  const { L, N, PE, tncs, PEbar, Nbar } = refs(rig)
  const uf = nets(rig)
  const shortLN = uf.same(L, N)
  if (shortLN || uf.same(L, PE)) {
    // a legközelebbi (a betáptól legtávolabbi) kismegszakító old ki: amelyik bontása megszünteti a zárlatot, mérőszekrényi főkismegszakító utoljára
    const cands = [...mcbs(rig).filter((m) => m.zone !== 'cab'), ...mcbs(rig).filter((m) => m.zone === 'cab')]
    const culprit = cands.find((m) => rig.dinOn[m.uid] && (() => {
      const u = nets(rig, new Set([`${m.uid}.in-out`]))
      return !u.same(L, N) && !u.same(L, PE)
    })())
    const toPE = tncs ? nets(rig, new Set(['bridge'])).same(L, PEbar) && !nets(rig, new Set(['bridge'])).same(L, Nbar) : uf.same(L, PE) && !shortLN
    res.trips.push({ uid: culprit?.uid ?? null, reason: toPE ? 'Testzárlat L–PE között' : 'Zárlat L–N között' })
    if (toPE) for (const r of rcds(rig)) if (rig.dinOn[r.uid]) res.trips.push({ uid: r.uid, reason: 'Hibaáram a védővezetőn' })
    return res
  }
  // a tekercsek/automaták is fogyasztók: ha a fázis nem az ÁVK-n át, a nulla igen (vagy fordítva), kiold
  const consumers: { id: string; l: string; n: string; name: string }[] = []
  for (const ld of taskOf(rig).loads) {
    const t = rig.mounts[ld.id]
    if (!t || ld.socket) continue
    const active = t !== 'lampMotion' || rig.motion
    const hasL = uf.same(`${ld.id}.L`, L)
    const retN = uf.same(`${ld.id}.N`, N)
    const retPE = uf.same(`${ld.id}.N`, PE)
    if (active && hasL && (retN || retPE)) {
      res.lit[ld.id] = true
      consumers.push({ id: ld.id, l: `${ld.id}.L`, n: `${ld.id}.N`, name: ld.name })
    }
  }
  // TN-C-S: ha a szétválasztás után N és PE újra össze van kötve, az áram egy része a PE-n tér vissza → ÁVK kiold
  if (tncs && consumers.length && nets(rig, new Set(['bridge'])).same(Nbar, PEbar))
    for (const r of rcds(rig)) if (rig.dinOn[r.uid]) res.trips.push({ uid: r.uid, reason: 'N és PE a szétválasztás után újra összekötve – hibaáram' })
  for (const r of rcds(rig)) {
    if (!rig.dinOn[r.uid]) continue
    for (const c of consumers) {
      const lThrough = !nets(rig, new Set([`${r.uid}.Lin-Lout`])).same(c.l, L)
      const nThrough = uf.same(c.n, N) && !nets(rig, new Set([`${r.uid}.Nin-Nout`])).same(c.n, N)
      if (lThrough !== nThrough) {
        res.trips.push({ uid: r.uid, reason: `${c.name}: a fázis és a nulla nem ugyanazon az ÁVK-n halad (hibaáram)` })
        res.lit[c.id] = false
      }
    }
  }
  for (const ld of taskOf(rig).loads) {
    if (!ld.socket || !rig.mounts[ld.id]) continue
    const live = uf.same(`${ld.id}.L`, L)
    res.sockets[ld.id] = { live, ok: live && uf.same(`${ld.id}.N`, N) && uf.same(`${ld.id}.PE`, PE) }
  }
  return res
}

/** Kioldásokat alkalmaz, amíg stabil állapot nem jön létre. */
export function settle(rig: Rig): { rig: Rig; result: SimResult; tripLog: string[] } {
  let cur = rig
  const log: string[] = []
  for (let i = 0; i < 6; i++) {
    const r = simulate(cur)
    if (!r.trips.length) return { rig: cur, result: r, tripLog: log }
    const dinOn = { ...cur.dinOn }
    let changed = false
    for (const t of r.trips) {
      log.push(t.uid ? `${nameOf(cur, t.uid)} kioldott: ${t.reason}` : `A főbiztosító kiolvadt: ${t.reason}`)
      if (t.uid && dinOn[t.uid]) ((dinOn[t.uid] = false), (changed = true))
    }
    if (!changed) {
      for (const d of cur.din) dinOn[d.uid] = false
      cur = { ...cur, dinOn }
      return { rig: cur, result: simulate(cur), tripLog: log }
    }
    cur = { ...cur, dinOn }
  }
  return { rig: cur, result: simulate(cur), tripLog: log }
}

function nameOf(rig: Rig, uid: string) {
  const d = rig.din.find((x) => x.uid === uid)
  return d ? itemByType[d.type].name.split(' ').slice(0, 2).join(' ') + ` (${uid})` : uid
}

/**
 * Nyomógomb megnyomásának hatása a vezérelt készülékekre (a gomb már zárt állapotban van a rig-ben).
 * Impulzusrelé: meghúzó tekercs → vált. Lépcsőházi automata: indítójel → bekapcsol.
 */
export function pressEffects(rig: Rig): { dinState: Record<string, number>; started: string[] } {
  const { L, N } = refs(rig)
  const uf = nets(rig)
  const dinState = { ...rig.dinState }
  const started: string[] = []
  for (const d of rig.din) {
    const u = d.uid
    if (d.type === 'ir') {
      const coil = (uf.same(`${u}.A1`, L) && uf.same(`${u}.A2`, N)) || (uf.same(`${u}.A2`, L) && uf.same(`${u}.A1`, N))
      if (coil) dinState[u] = dinState[u] ? 0 : 1
    }
    if (d.type === 'timer' && uf.same(`${u}.S`, L) && uf.same(`${u}.L`, L) && uf.same(`${u}.N`, N)) {
      dinState[u] = 1
      started.push(u)
    }
  }
  return { dinState, started }
}

// ---------- Szerelői ellenőrzés (statikus kiértékelés) ----------
export type Severity = 'critical' | 'error' | 'warn' | 'ok'
export interface Finding {
  sev: Severity
  msg: string
}

/** Minden kapcsoló-, nyomógomb- és vezérelt-készülék állapot kombinációja */
export function combos(rig: Rig): Rig[] {
  const vars: { kind: 'sw' | 'din'; id: string; n: number }[] = []
  for (const m of taskOf(rig).layout.mounts) {
    const t = rig.mounts[m.id]
    if (t && itemByType[t].states > 1 && m.kind === 'switch') vars.push({ kind: 'sw', id: m.id, n: itemByType[t].states })
  }
  for (const d of rig.din) if (itemByType[d.type].driven) vars.push({ kind: 'din', id: d.uid, n: 2 })
  const total = vars.reduce((a, v) => a * v.n, 1)
  const out: Rig[] = []
  for (let k = 0; k < Math.min(total, 512); k++) {
    const sw = { ...rig.sw }, dinState = { ...rig.dinState }
    let x = k
    for (const v of vars) {
      if (v.kind === 'sw') sw[v.id] = x % v.n
      else dinState[v.id] = x % v.n
      x = Math.floor(x / v.n)
    }
    out.push({ ...rig, sw, dinState })
  }
  return out
}

export function functionalCtx(rig: Rig): FunctionalCtx {
  return {
    rig,
    combos: () => combos(rig),
    same: (r, a, b) => nets(r).same(a, b),
    lit: (r, id) => !!simulate(r).lit[id],
    dinUid: (t) => rig.din.find((d) => d.type === t)?.uid,
    sameOpen: (r, open, a, b) => nets(r, new Set(open)).same(a, b),
  }
}

export function inspect(rig: Rig): Finding[] {
  const task = taskOf(rig)
  const { L, N, PE, tncs, Nbar, PEbar } = refs(rig)
  /** a védővezető/nulla szétválasztását a TN-C-S hídnyitással vizsgáljuk */
  const split = (r: Rig) => (tncs ? nets(r, new Set(['bridge'])) : nets(r))
  const f: Finding[] = []
  const base: Rig = { ...rig, dinOn: Object.fromEntries(rig.din.map((d) => [d.uid, true])), motion: true }

  // 0. Készülékek
  for (const m of task.layout.mounts) {
    const t = rig.mounts[m.id]
    if (!t) f.push({ sev: 'error', msg: `${m.label}: nincs felszerelve.` })
    else if (t !== m.expect) f.push({ sev: 'error', msg: `${m.label}: rossz szerelvény (${itemByType[t].name}).` })
  }
  const rcd = rig.din.filter((d) => d.type.startsWith('rcd'))
  if (!rcd.length) f.push({ sev: 'critical', msg: 'Nincs áramvédő kapcsoló (ÁVK) – az áramütés elleni kiegészítő védelem hiányzik.' })
  if (rcd.some((d) => d.type === 'rcd25_300')) f.push({ sev: 'critical', msg: '300 mA-es ÁVK: dugaljkörhöz 30 mA-es kiegészítő védelem kötelező.' })
  if (!rig.din.some((d) => d.type === 'spd')) f.push({ sev: 'warn', msg: 'Túlfeszültség-levezető nincs beépítve (a feladat „lehetőség szerint” kéri).' })

  // 1. Zárlat bármely állapotban, vezetékszerepek
  const all = combos(base)
  const roles = new Map<string, Set<string>>()
  let shortFound = false
  for (const r of all) {
    const uf = nets(r)
    const sp = split(r)
    const npe = tncs ? sp.same(Nbar, PEbar) : uf.same(N, PE)
    if (!shortFound && (uf.same(L, N) || uf.same(L, PE) || npe)) {
      shortFound = true
      f.push({ sev: 'critical', msg: uf.same(L, N) || uf.same(L, PE) ? (sp.same(L, PEbar) ? 'Testzárlat: fázis a védővezetőre kötve.' : 'Zárlat: a fázis és a nulla összekötve (valamely kapcsolóállásban).') : tncs ? 'N és PE a PEN-szétválasztás után újra összekötve – tilos, az ÁVK kiold.' : 'N és PE összekötve – az ÁVK azonnal kiold.' })
    }
    for (const w of r.wires) {
      const s = roles.get(w.id) ?? new Set()
      if (sp.same(w.a, PEbar) && !(tncs && sp.same(w.a, Nbar))) s.add('PE')
      else if (sp.same(w.a, Nbar)) s.add('N')
      else if (uf.same(w.a, L)) s.add('L')
      else s.add('float')
      roles.set(w.id, s)
    }
  }

  // 2. Működés (feladatfüggő)
  if (!shortFound) f.push(...task.functional(functionalCtx(base)))

  // 3. Dugaljak
  for (const ld of task.loads.filter((l) => l.socket && rig.mounts[l.id])) {
    const uf = nets(base)
    if (!uf.same(`${ld.id}.L`, L) || !uf.same(`${ld.id}.N`, N)) f.push({ sev: 'error', msg: `${ld.name}: nem kap fázist és nullát.` })
    else f.push({ sev: 'ok', msg: `${ld.name}: bekötve.` })
  }

  // 4. Védővezető (TN-C-S-nél a PE-sínhez, nem az N-hez kell kötni: utólagos „nullázás” tilos)
  {
    const sp = split(base)
    for (const ld of task.loads) {
      if (!rig.mounts[ld.id]) continue
      if (!sp.same(`${ld.id}.PE`, PEbar))
        f.push({ sev: 'critical', msg: `${ld.name}: a védővezető (PE) nincs bekötve – áramütés elleni védelem hibás.` })
      else if (tncs && sp.same(`${ld.id}.PE`, Nbar))
        f.push({ sev: 'critical', msg: `${ld.name}: a védővezető az N-re van kötve (nullázás a szétválasztás után) – tilos.` })
    }
    for (const s of rig.din.filter((d) => d.type === 'spd'))
      if (!sp.same(`${s.uid}.PE`, PEbar)) f.push({ sev: 'error', msg: 'Túlfeszültség-levezető PE kapcsa nincs bekötve.' })
  }

  // 5. ÁVK megkerülés, túláramvédelem
  if (!shortFound) {
    for (const ld of task.loads) {
      if (!rig.mounts[ld.id]) continue
      const st = all.find((r) => nets(r).same(`${ld.id}.L`, L))
      if (!st) continue
      for (const r of rcd) {
        const viaL = !nets(st, new Set([`${r.uid}.Lin-Lout`])).same(`${ld.id}.L`, L)
        const viaN = !nets(st, new Set([`${r.uid}.Nin-Nout`])).same(`${ld.id}.N`, N)
        if (!viaL || !viaN) f.push({ sev: 'critical', msg: `${ld.name}: az áramkör ${!viaL ? 'fázisa' : 'nullája'} megkerüli az ÁVK-t.` })
      }
      const prot = mcbs(st).filter((m) => !nets(st, new Set([`${m.uid}.in-out`])).same(`${ld.id}.L`, L))
      if (!prot.length) f.push({ sev: 'critical', msg: `${ld.name}: nincs túláramvédelem (kismegszakító) az áramkörben.` })
      else if (!prot.some((p) => p.type === ld.mcb)) f.push({ sev: 'error', msg: `${ld.name}: nem a rajz szerinti kismegszakító (${ld.mcb.replace('mcb', '')}) védi.` })
    }
  }

  // 6. Színek, keresztmetszet, kapcsok, csupaszolás
  const socketIds = new Set(task.loads.filter((l) => l.socket).map((l) => l.id))
  const perTerm = new Map<string, number>()
  let colorErr = 0, csErr = 0, stripErr = 0
  for (const w of rig.wires) {
    for (const t of [w.a, w.b]) perTerm.set(t, (perTerm.get(t) ?? 0) + 1)
    const r = roles.get(w.id) ?? new Set()
    const where = `${termLabel(w.a)} – ${termLabel(w.b)}`
    const gy = w.color === 'zoldsarga' || w.color === 'pen'
    if (gy && !r.has('PE')) f.push({ sev: 'critical', msg: `Zöld-sárga vezeték nem védővezetőként (${where}).` })
    else if (r.has('PE') && !gy) ((colorErr++), f.push({ sev: 'error', msg: `Védővezető/PEN nem zöld-sárga (${where}).` }))
    else if (r.has('N') && w.color !== 'kek') ((colorErr++), f.push({ sev: 'error', msg: `Nullavezető nem kék (${where}).` }))
    else if (!r.has('N') && !r.has('PE') && w.color === 'kek') ((colorErr++), f.push({ sev: 'error', msg: `Kék vezeték fázisként (${where}).` }))
    const rule = task.minCs?.(rig, w)
    const need = rule ?? ([w.a, w.b].some((t) => socketIds.has(t.split('.')[0]) || t.startsWith('bet.') || isFeed(rig, t)) ? 2.5 : 1.5)
    if (w.cs < need) ((csErr++), f.push({ sev: 'error', msg: `Kicsi keresztmetszet: ${where} legalább ${String(need).replace('.', ',')} mm² legyen.` }))
    if (w.strip < 8 || w.strip > 14) stripErr++
  }
  for (const [t, n] of perTerm) if (n > 2 || ((t.startsWith('N.') || t.startsWith('PE.')) && n > 1))
    f.push({ sev: 'error', msg: `${termLabel(t)}: túl sok vezeték egy kapocsban (${n}).` })
  if (stripErr) f.push({ sev: 'error', msg: `${stripErr} vezetéknél rossz a csupaszolási hossz (8–14 mm: rövid → laza kötés, hosszú → szabad rézfelület).` })
  if (rig.wires.length && !colorErr) f.push({ sev: 'ok', msg: 'Vezetékszínek rendben (L barna/fekete/szürke, N kék, PE zöld-sárga).' })
  if (rig.wires.length && !csErr) f.push({ sev: 'ok', msg: 'Keresztmetszetek rendben.' })
  return f
}

function isFeed(rig: Rig, t: string) {
  const [uid, term] = t.split('.')
  const d = rig.din.find((x) => x.uid === uid)
  if (!d) return false
  if (d.type.startsWith('rcd') || d.type === 'mcbB16') return true
  return d.type.startsWith('mcb') && term === 'in'
}
