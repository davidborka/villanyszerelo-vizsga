import { create } from 'zustand'
import { itemByType, toolById, TOOLS, type CrossSection, type DinType, type ItemType, type ToolId, type WireColor } from './catalog'
import { combos, nets, pressEffects, settle, simulate, type Rig, type Wire } from './circuit'
import type { DeviceType, EndCut, Vec2 } from './layout'
import { solveStage } from './solutions'
import { taskOf, TASKS } from './tasks'

export const STAGES = [
  { id: 'feladat', name: 'Feladatlap' },
  { id: 'anyag', name: 'Anyag + szerszám' },
  { id: 'rajz', name: 'Rajzolvasás' },
  { id: 'csatorna', name: 'Kábelcsatorna' },
  { id: 'szereles', name: 'Készülékek' },
  { id: 'vezetekezes', name: 'Vezetékezés' },
  { id: 'ellenorzes', name: 'Ellenőrzés, mérés' },
  { id: 'ertekeles', name: 'Értékelés' },
] as const
export type StageId = (typeof STAGES)[number]['id']
export type Mode = 'vizsga' | 'gyakorlo'

export type Action =
  | 'measure' | 'cut' | 'deburr' | 'mount' | 'level' | 'device' | 'wire' | 'unwire' | 'voltTest' | 'iso' | 'current' | 'voltage'
/** a szakszerű szerszám */
export const ACTION_TOOLS: Record<Action, ToolId[]> = {
  measure: ['mero'],
  cut: ['furesz'],
  deburr: ['sorja'],
  mount: ['furo'],
  level: ['vizmertek'],
  device: ['furo', 'csavPZ'],
  wire: ['csavLapos', 'csavPZ'],
  unwire: ['oldalcsipo', 'csavLapos', 'csavPZ'],
  voltTest: ['feszVizsg'],
  iso: ['multifunkcios'],
  current: ['lakatfogo'],
  voltage: ['multimeter', 'multifunkcios'],
}
/** amivel a művelet elvégezhető, de szakszerűtlenül – a vizsgán ez is hiba */
const ACTION_ALT: Record<Action, ToolId[]> = {
  measure: [],
  cut: ['flex', 'oldalcsipo', 'kombinalt'],
  deburr: ['oldalcsipo', 'csavLapos'],
  mount: ['csavPZ', 'csavLapos', 'csavNemSzig'],
  level: [],
  device: ['csavLapos', 'csavNemSzig'],
  wire: ['csavNemSzig'],
  unwire: ['kombinalt', 'csavNemSzig'],
  voltTest: ['fazisceruza', 'multimeter', 'multifunkcios'],
  iso: [],
  current: ['multimeter'],
  voltage: [],
}
const ACTION_NAME: Record<Action, string> = {
  measure: 'méréshez', cut: 'vágáshoz', deburr: 'sorjázáshoz', mount: 'felcsavarozáshoz', level: 'vízszint ellenőrzéshez',
  device: 'szerelvény rögzítéséhez', wire: 'vezeték bekötéséhez', unwire: 'vezeték eltávolításához',
  voltTest: 'feszültségmentesség ellenőrzéséhez', iso: 'szigetelési/folytonossági méréshez', current: 'árammérés­hez', voltage: 'feszültségméréshez',
}

export interface Cut {
  len: number // m, a leghosszabb élen
  ends: [EndCut, EndCut]
  deburred: boolean
  mounted: boolean
  leveled: boolean
  /** nem szakszerű szerszámmal vágva: csorba, pontatlan él */
  rough?: boolean
}

export interface LogEntry {
  sev: 'ok' | 'warn' | 'error' | 'critical' | 'info' | 'event'
  msg: string
}

export interface Insp {
  order: number[]
  vfree: boolean
  isoV: number
  isoRes: null | { iso: string; pe: string }
  isoLimit: string
  isoJudge: string
  iRead: string | null
  iValue: number
  uRead: string | null
  jk: { I: string; P: string; U: string; judge: string }
  protocolClosed: boolean
}

export interface RajzAns {
  sym: Record<number, string>
  seg: Record<string, string>
  links: [string, string][]
}

interface State extends Rig {
  screen: 'start' | 'game' | 'quiz' | 'hotseat' | 'gyakorlo'
  mode: Mode
  stage: StageId
  startedAt: number
  submitted: boolean
  belt: ToolId[]
  lateTools: ToolId[]
  activeTool: ToolId | null
  toolMisuse: number
  materials: Partial<Record<ItemType, number>>
  wireStock: string[] // "2.5-barna"
  cuts: Record<string, Cut>
  stockUsed: number
  wasted: number
  selectedPiece: string | null
  selectedMount: string | null
  tape: Vec2[]
  wireColor: WireColor
  wireCs: CrossSection
  wireStrip: number
  pendingTerm: string | null
  hoverTerm: string | null
  lidsOn: boolean
  powered: boolean
  tested: { sw: Record<string, boolean>; motion: boolean; rcdTest: boolean }
  rajz: RajzAns
  insp: Insp
  supplyU: number
  /** értékelő megjegyzések: gyakorló módban azonnal látszanak, vizsga módban csak az értékelésnél */
  notes: LogEntry[]
  log: LogEntry[]
  /** szakaszok, amelyeknél a „Megoldás” gombot használtad – az ilyen eredmény nem számít az előrejelzésbe */
  solved: StageId[]
  // műveletek
  start: (taskId: string, mode: Mode) => void
  toMenu: () => void
  openQuiz: (mode: Mode) => void
  openHotSeat: () => void
  openPractice: () => void
  setStage: (s: StageId) => void
  submit: () => void
  say: (msg: string, sev?: 'info' | 'event') => void
  judge: (sev: LogEntry['sev'], msg: string) => void
  toggleBelt: (t: ToolId) => void
  addLateTool: (t: ToolId) => void
  setActiveTool: (t: ToolId | null) => void
  tryTool: (a: Action) => 'ok' | 'bad' | 'no'
  setMaterial: (t: ItemType, n: number) => void
  toggleWireStock: (k: string) => void
  set: (p: Partial<State>) => void
  setRajz: (p: Partial<RajzAns>) => void
  setInsp: (p: Partial<Insp>) => void
  cutPiece: (id: string, lenMm: number, ends: [EndCut, EndCut]) => void
  pieceAction: (id: string, a: 'deburr' | 'mount' | 'level' | 'unmount') => void
  placeDevice: (mountId: string, t: DeviceType | undefined) => void
  addDin: (t: DinType, zone?: 'cab') => void
  removeDin: (uid: string) => void
  clickTerm: (t: string) => void
  removeWire: (id: string) => void
  operate: (mountId: string) => void
  toggleDin: (uid: string) => void
  setPowered: (on: boolean) => void
  rcdTest: () => void
  setMotion: (m: boolean) => void
  solve: () => void
}

const newInsp = (): Insp => ({
  order: [], vfree: false, isoV: 250, isoRes: null, isoLimit: '', isoJudge: '', iRead: null, iValue: 0, uRead: null,
  jk: { I: '', P: '', U: '', judge: '' }, protocolClosed: false,
})

const initial = (taskId = 'nyariKonyha', mode: Mode = 'vizsga') => ({
  screen: 'start' as const,
  taskId,
  mode,
  stage: 'feladat' as StageId,
  startedAt: Date.now(),
  submitted: false,
  belt: [] as ToolId[],
  lateTools: [] as ToolId[],
  activeTool: null,
  toolMisuse: 0,
  materials: {},
  wireStock: [],
  cuts: {},
  stockUsed: 0,
  wasted: 0,
  selectedPiece: null,
  selectedMount: null,
  tape: [],
  wireColor: 'barna' as WireColor,
  wireCs: 1.5 as CrossSection,
  wireStrip: 10,
  pendingTerm: null,
  hoverTerm: null,
  lidsOn: false,
  powered: false,
  tested: { sw: {}, motion: false, rcdTest: false },
  rajz: { sym: {}, seg: {}, links: [] },
  insp: newInsp(),
  // a hálózati feszültség: néha tűréshatáron kívül, hogy az értékelésnek tétje legyen
  supplyU: Math.random() < 0.18 ? 254.6 : Math.round((224 + Math.random() * 12) * 10) / 10,
  notes: [] as LogEntry[],
  log: [] as LogEntry[],
  solved: [] as StageId[],
  mounts: {},
  din: [],
  wires: [] as Wire[],
  sw: {},
  dinOn: {},
  dinState: {},
  motion: false,
})

let uidN = 0
const timers = new Map<string, ReturnType<typeof setTimeout>>()
const TIMER_MS = 15000
/** a mozgásérzékelő ennyi ideig tartja bekapcsolva a lámpát, ha valaki a lap előtt dolgozik */
const MOTION_MS = 60000
let motionTimer: ReturnType<typeof setTimeout> | undefined

export const useGame = create<State>((set, get) => {
  /** Feszültség alatt minden változás után lefuttatjuk a kioldásokat */
  const energize = () => {
    const s = get()
    if (!s.powered) return
    const { rig, tripLog } = settle(s)
    if (tripLog.length) set({ dinOn: rig.dinOn, log: [...get().log, ...tripLog.map((m) => ({ sev: 'event' as const, msg: '⚡ ' + m }))] })
  }
  const setPoweredOff = () => {
    for (const t of timers.values()) clearTimeout(t)
    set({ powered: false })
  }
  /** Bemutatás: bekapcsol, és olyan kapcsoló-/reléállást választ, amelyben a legtöbb lámpa világít */
  const demo = () => {
    const s = get()
    const on: Rig = { ...s, dinOn: Object.fromEntries(s.din.map((d) => [d.uid, true])), motion: true }
    let best = on, bestLit = -1
    for (const r of combos(on)) {
      const n = Object.values(simulate(r).lit).filter(Boolean).length
      if (n > bestLit) ((best = r), (bestLit = n))
    }
    // a nyomógombot elengedjük; a reléállás/automata megmarad
    const sw = Object.fromEntries(Object.entries(best.sw).map(([k, v]) => [k, s.mounts[k] === 'pb' ? 0 : v]))
    set({ dinOn: on.dinOn, sw, dinState: best.dinState, powered: true, lidsOn: true })
    get().setMotion(true)
    for (const d of s.din.filter((x) => x.type === 'timer' && best.dinState[x.uid])) {
      clearTimeout(timers.get(d.uid))
      timers.set(d.uid, setTimeout(() => (set({ dinState: { ...get().dinState, [d.uid]: 0 } }), energize()), TIMER_MS * 4))
    }
    get().say('Feszültség alá helyezve, bemutatás: a lámpák a kapcsolóállás szerint világítanak.', 'event')
  }
  const isLive = (term: string) => {
    const s = get()
    if (!s.powered) return false
    const uf = nets(settle(s).rig)
    return uf.same(term, 'bet.L')
  }
  return {
    ...initial(),
    start: (taskId, mode) => {
      for (const t of timers.values()) clearTimeout(t)
      timers.clear()
      set({ ...initial(taskId, mode), screen: 'game', startedAt: Date.now() })
    },
    toMenu: () => set({ screen: 'start' }),
    openQuiz: (mode) => set({ screen: 'quiz', mode }),
    openHotSeat: () => set({ screen: 'hotseat' }),
    openPractice: () => set({ screen: 'gyakorlo' }),
    setStage: (stage) => {
      if (get().submitted && stage !== 'ertekeles') return
      set({ stage, pendingTerm: null, tape: [], selectedPiece: null, selectedMount: null })
    },
    // a bemutatás miatt a berendezés feszültség alatt marad, ha az volt
    submit: () => set({ submitted: true, stage: 'ertekeles' }),
    say: (msg, sev = 'info') => set({ log: [...get().log, { sev, msg }] }),
    judge: (sev, msg) => {
      const e = { sev, msg }
      set({ notes: [...get().notes, e], log: get().mode === 'gyakorlo' ? [...get().log, e] : get().log })
    },
    toggleBelt: (t) => {
      const b = get().belt
      set({ belt: b.includes(t) ? b.filter((x) => x !== t) : [...b, t] })
    },
    addLateTool: (t) => {
      const s = get()
      if (s.belt.includes(t)) return
      set({ belt: [...s.belt, t], lateTools: [...s.lateTools, t], activeTool: t })
      s.say(`Pótlólag kivetted a szerszámosládából: ${toolById[t].name}.`)
    },
    setActiveTool: (activeTool) => set({ activeTool, tape: [] }),
    tryTool: (a) => {
      const s = get()
      const t = s.activeTool
      const right = ACTION_TOOLS[a].map((x) => toolById[x].name).join(' / ')
      if (!t) {
        s.say('Nincs szerszám a kezedben – válassz a szerszámövről.')
        return 'no'
      }
      if (ACTION_TOOLS[a].includes(t)) return 'ok'
      set({ toolMisuse: s.toolMisuse + 1 })
      if (ACTION_ALT[a].includes(t)) {
        if (a === 'voltTest' && t === 'fazisceruza') s.judge('critical', 'Fázisceruzával ellenőrizted a feszültségmentességet – erre nem alkalmas, kétpólusú feszültségvizsgáló kell.')
        else s.judge('error', `Szakszerűtlen szerszám a ${ACTION_NAME[a]}: ${toolById[t].name}. Helyes: ${right}.`)
        return 'bad'
      }
      s.say(`${toolById[t].name}: ezzel ezt nem lehet elvégezni.`)
      s.judge('warn', `Rossz szerszám a ${ACTION_NAME[a]} (${toolById[t].name}). Helyes: ${right}.`)
      return 'no'
    },
    setMaterial: (t, n) => set({ materials: { ...get().materials, [t]: Math.max(0, n) } }),
    toggleWireStock: (k) => {
      const w = get().wireStock
      set({ wireStock: w.includes(k) ? w.filter((x) => x !== k) : [...w, k] })
    },
    set: (p) => set(p),
    setRajz: (p) => set({ rajz: { ...get().rajz, ...p } }),
    setInsp: (p) => set({ insp: { ...get().insp, ...p } }),
    cutPiece: (id, lenMm, ends) => {
      const s = get()
      const p = taskOf(s).layout.pieces.find((x) => x.id === id)!
      const prev = s.cuts[id]
      if (prev?.mounted) return s.say('Felszerelt darabot előbb le kell szerelni.')
      const res = s.tryTool('cut')
      if (res === 'no') return
      let real = lenMm
      const rough = res === 'bad'
      if (rough) real += Math.round((Math.random() - 0.5) * 16)
      if (ends.includes(45) && !s.belt.includes('gerlada')) {
        real += Math.round((Math.random() - 0.5) * 10)
        s.judge('warn', 'Gérvágóláda nélkül, szabad kézzel vágtál 45°-ot – pontatlan.')
      }
      const len = real / 1000
      // rövidebbre lehet utánvágni, hosszabbra nem: akkor új szál kell
      const fresh = !prev || len > prev.len + 1e-6
      set({
        cuts: { ...s.cuts, [id]: { len, ends, deburred: false, mounted: false, leveled: false, rough: rough || prev?.rough } },
        stockUsed: s.stockUsed + (fresh ? len : 0),
        wasted: s.wasted + (prev && fresh ? prev.len : 0),
      })
      s.say(`${p.label}: levágva${prev && !fresh ? ' (utánvágás)' : ''}, ${ends[0]}°/${ends[1]}° végekkel.`)
      const err = Math.round((len - p.len) * 1000)
      if (Math.abs(err) > 2) s.judge('warn', `${p.label}: ${err > 0 ? `${err} mm-rel hosszabb` : `${-err} mm-rel rövidebb`} a szükségesnél.`)
      if (ends.some((e, i) => e !== p.ends[i])) s.judge('warn', `${p.label}: a vágási szög nem illeszkedik a nyomvonalhoz.`)
    },
    pieceAction: (id, a) => {
      const s = get()
      const c = s.cuts[id]
      const p = taskOf(s).layout.pieces.find((x) => x.id === id)!
      if (a === 'unmount') {
        if (!c?.mounted) return
        set({ cuts: { ...s.cuts, [id]: { ...c, mounted: false, leveled: false } } })
        return s.say(`${p.label}: leszerelve.`)
      }
      if (!c) return s.say('Ehhez a nyomvonalhoz még nincs levágott darab.')
      if (a === 'level' && !c.mounted) return s.say('Vízszintet a felszerelt csatornán lehet ellenőrizni.')
      const res = s.tryTool(a)
      if (res === 'no') return
      if (a === 'deburr') {
        set({ cuts: { ...s.cuts, [id]: { ...c, deburred: true } } })
        return s.say(`${p.label}: sorjázva.`)
      }
      if (a === 'mount') {
        if (c.len - p.len > 0.002) s.judge('error', `${p.label}: túl hosszú darabot erőltettél be – felpúposodik, nem illeszkedik.`)
        if (!c.deburred) s.judge('warn', `${p.label}: sorjázatlan vágott él – sértheti a vezeték szigetelését.`)
        set({ cuts: { ...s.cuts, [id]: { ...c, mounted: true } } })
        return s.say(`${p.label}: felcsavarozva.`)
      }
      set({ cuts: { ...s.cuts, [id]: { ...c, leveled: true } } })
      s.say(`${p.label}: vízszintbe állítva.`)
    },
    placeDevice: (mountId, t) => {
      const s = get()
      if (t) {
        const used = Object.entries(s.mounts).filter(([k, v]) => v === t && k !== mountId).length
        if (used >= (s.materials[t] ?? 0)) return s.say(`Nincs több ${itemByType[t].name} – nem vételeztél eleget.`)
        if (s.tryTool('device') === 'no') return
      }
      set({ mounts: { ...s.mounts, [mountId]: t }, wires: t ? s.wires : s.wires.filter((w) => !w.a.startsWith(mountId + '.') && !w.b.startsWith(mountId + '.')) })
      if (t) s.say(`${mountId}: ${itemByType[t].name} felszerelve.`)
    },
    addDin: (t, zone) => {
      const s = get()
      if (s.din.filter((d) => d.type === t).length >= (s.materials[t] ?? 0)) return s.say('Ebből nincs több – nem vételeztél eleget.')
      const uid = t === 'meter1f' ? `P${++uidN}` : zone === 'cab' ? `F${++uidN}` : `Q${++uidN}`
      set({ din: [...s.din, zone ? { uid, type: t, zone } : { uid, type: t }], dinOn: { ...s.dinOn, [uid]: false }, dinState: { ...s.dinState, [uid]: 0 } })
    },
    removeDin: (uid) => {
      const s = get()
      set({ din: s.din.filter((d) => d.uid !== uid), wires: s.wires.filter((w) => !w.a.startsWith(uid + '.') && !w.b.startsWith(uid + '.')) })
    },
    clickTerm: (t) => {
      const s = get()
      if (s.stage !== 'vezetekezes') return
      if (!s.pendingTerm) return set({ pendingTerm: t })
      if (s.pendingTerm === t) return set({ pendingTerm: null })
      const res = s.tryTool('wire')
      if (res === 'no') return set({ pendingTerm: null })
      if (s.powered) {
        s.judge('critical', 'Feszültség alatt szereltél – a feszültségmentesítés szabályait megszegted.')
        if (isLive(s.pendingTerm) || isLive(t)) s.say('⚡ Megrázott az áram! Feszültség alatti kapocshoz nyúltál.', 'event')
      }
      if (!s.belt.includes('csupaszolo')) {
        s.judge('warn', 'Csupaszoló fogó nélkül, késsel csupaszoltál – az ér megsérülhet.')
        set({ toolMisuse: get().toolMisuse + 1 })
      }
      const key = `${s.wireCs}-${s.wireColor}`
      if (!s.wireStock.includes(key)) {
        set({ pendingTerm: null })
        return s.say(`Ilyen vezetéket (${String(s.wireCs).replace('.', ',')} mm², ${s.wireColor}) nem vételeztél.`)
      }
      const w: Wire = { id: `W${++uidN}`, a: s.pendingTerm, b: t, color: s.wireColor, cs: s.wireCs, strip: s.wireStrip }
      set({ wires: [...s.wires, w], pendingTerm: null })
    },
    removeWire: (id) => {
      const s = get()
      if (s.tryTool('unwire') === 'no') return
      set({ wires: s.wires.filter((w) => w.id !== id) })
    },
    operate: (m) => {
      const s = get()
      const t = s.mounts[m]
      if (!t) return
      // aki a kapcsolót kezeli, az a mozgásérzékelő előtt áll
      if (s.powered) get().setMotion(true)
      const def = itemByType[t]
      set({ tested: { ...s.tested, sw: { ...s.tested.sw, [m]: true } } })
      if (def.momentary) {
        // nyomógomb: megnyom, vezérelt készülékek reagálnak, elenged
        set({ sw: { ...get().sw, [m]: 1 } })
        if (get().powered) {
          const { dinState, started } = pressEffects(settle(get()).rig)
          set({ dinState })
          for (const u of started) {
            clearTimeout(timers.get(u))
            timers.set(u, setTimeout(() => (set({ dinState: { ...get().dinState, [u]: 0 } }), energize()), TIMER_MS))
          }
        }
        energize()
        setTimeout(() => (set({ sw: { ...get().sw, [m]: 0 } }), energize()), 350)
        return
      }
      set({ sw: { ...s.sw, [m]: ((s.sw[m] ?? 0) + 1) % def.states } })
      energize()
    },
    toggleDin: (uid) => {
      const s = get()
      set({ dinOn: { ...s.dinOn, [uid]: !s.dinOn[uid] } })
      energize()
    },
    setPowered: (powered) => {
      set({ powered })
      if (!powered) for (const t of timers.values()) clearTimeout(t)
      energize()
    },
    rcdTest: () => {
      const s = get()
      const r = s.din.find((d) => d.type.startsWith('rcd'))
      if (!r || !s.powered || !s.dinOn[r.uid]) return s.say('A próbagomb csak bekapcsolt, feszültség alatti ÁVK-n működik.')
      set({ dinOn: { ...s.dinOn, [r.uid]: false }, tested: { ...s.tested, rcdTest: true } })
      s.say('ÁVK próbagomb (T): az áramvédő kioldott.', 'event')
    },
    solve: () => {
      const s = get()
      if (s.submitted) return
      if (s.powered && s.stage !== 'ellenorzes') setPoweredOff()
      set({ ...(solveStage(get(), s.stage) as Partial<State>), solved: s.solved.includes(s.stage) ? s.solved : [...s.solved, s.stage], pendingTerm: null })
      get().say(`Mintamegoldás betöltve: ${STAGES.find((x) => x.id === s.stage)!.name}.`)
      if (s.stage === 'ellenorzes') demo()
      energize()
    },
    setMotion: (motion) => {
      clearTimeout(motionTimer)
      if (motion) motionTimer = setTimeout(() => (set({ motion: false }), energize()), MOTION_MS)
      set({ motion, tested: { ...get().tested, motion: get().tested.motion || motion } })
      energize()
    },
  }
})

export const neededTools = TOOLS.filter((t) => t.role === 'need').map((t) => t.id)
export { TASKS }

if (import.meta.env?.DEV) (window as unknown as { __game: typeof useGame }).__game = useGame
