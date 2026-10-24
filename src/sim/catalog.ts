import type { DeviceType } from './layout'

// ---------- Szerszámok ----------
export type ToolId =
  | 'mero'
  | 'ceruza'
  | 'vizmertek'
  | 'furo'
  | 'furesz'
  | 'gerlada'
  | 'sorja'
  | 'csupaszolo'
  | 'oldalcsipo'
  | 'csavLapos'
  | 'csavPZ'
  | 'feszVizsg'
  | 'multifunkcios'
  | 'lakatfogo'
  | 'multimeter'
  | 'kombinalt'
  | 'kalapacs'
  | 'fazisceruza'
  | 'flex'
  | 'csavNemSzig'
  | 'csofogo'

export interface Tool {
  id: ToolId
  name: string
  icon: string
  /** need: kell a feladathoz, neutral: nem hiba, wrong: nem megfelelő/veszélyes */
  role: 'need' | 'neutral' | 'wrong'
  why: string
}

export const TOOLS: Tool[] = [
  { id: 'mero', name: 'Mérőszalag', icon: '📏', role: 'need', why: 'Nyomvonal és csatornahosszak kimérése.' },
  { id: 'ceruza', name: 'Ácsceruza', icon: '✏️', role: 'need', why: 'Vágási vonal és furatok bejelölése.' },
  { id: 'vizmertek', name: 'Vízmérték', icon: '📐', role: 'need', why: 'Vízszintes/függőleges csatorna – esztétika.' },
  { id: 'furo', name: 'Akkus fúró-csavarozó', icon: '🪛', role: 'need', why: 'Csatorna, dobozok, elosztó felcsavarozása.' },
  { id: 'furesz', name: 'Finomfogú fémfűrész', icon: '🪚', role: 'need', why: 'PVC csatorna vágása tiszta, egyenes éllel.' },
  { id: 'gerlada', name: 'Gérvágóláda', icon: '📦', role: 'need', why: 'Pontos 45°/90° vágás a sarokillesztéshez.' },
  { id: 'sorja', name: 'Sorjázó / reszelő', icon: '🗡️', role: 'need', why: 'Vágás utáni sorja eltávolítása (vezeték-szigetelés védelme).' },
  { id: 'csupaszolo', name: 'Automata csupaszoló fogó', icon: '✂️', role: 'need', why: 'Szigetelés eltávolítása a rézér sérülése nélkül.' },
  { id: 'oldalcsipo', name: 'Szigetelt oldalcsípő fogó (VDE)', icon: '🔪', role: 'need', why: 'Vezetékek méretre vágása.' },
  { id: 'csavLapos', name: 'Szigetelt lapos csavarhúzó 3,5 (VDE 1000 V)', icon: '🔧', role: 'need', why: 'Kapcsok meghúzása szerelvényeken, kismegszakítókon.' },
  { id: 'csavPZ', name: 'Szigetelt PZ2 csavarhúzó (VDE 1000 V)', icon: '🔩', role: 'need', why: 'Kombinált fejű kapcsok, burkolatok.' },
  { id: 'feszVizsg', name: 'Kétpólusú feszültségvizsgáló', icon: '🔦', role: 'need', why: 'Feszültségmentesség ellenőrzése (5 szabály 3. lépése).' },
  { id: 'multifunkcios', name: 'Installációs multifunkciós műszer', icon: '🧰', role: 'need', why: 'Szigetelési ellenállás, PE folytonosság, ÁVK mérés.' },
  { id: 'lakatfogo', name: 'Lakatfogó (AC ampermérő)', icon: '🧲', role: 'need', why: 'Áramerősség mérése a 2. áramkörben.' },
  { id: 'multimeter', name: 'Digitális multiméter CAT III', icon: '📟', role: 'need', why: 'Fázisfeszültség mérése a dugaljban.' },
  { id: 'kombinalt', name: 'Kombinált fogó', icon: '🗜️', role: 'neutral', why: 'Használható, de nem nélkülözhetetlen.' },
  { id: 'kalapacs', name: 'Kalapács', icon: '🔨', role: 'wrong', why: 'Szerelőlapon nincs mit verni – a PVC csatorna megreped.' },
  { id: 'fazisceruza', name: 'Fázisceruza (egypólusú)', icon: '🖊️', role: 'wrong', why: 'NEM alkalmas feszültségmentesség megállapítására!' },
  { id: 'flex', name: 'Sarokcsiszoló (flex)', icon: '💥', role: 'wrong', why: 'PVC csatornát megolvasztja, pontatlan, balesetveszélyes.' },
  { id: 'csavNemSzig', name: 'Nem szigetelt csavarhúzó', icon: '⚠️', role: 'wrong', why: 'Villamos kapcsokhoz csak VDE szigetelt szerszám használható.' },
  { id: 'csofogo', name: 'Csőfogó (vízvezeték)', icon: '🚰', role: 'wrong', why: 'Nem villanyszerelő szerszám.' },
]
export const toolById = Object.fromEntries(TOOLS.map((t) => [t.id, t])) as Record<ToolId, Tool>

// ---------- Készülékek, szerelvények ----------
export type DinType = 'rcd40' | 'rcd25_300' | 'mcbB10' | 'mcbB16' | 'mcbB32' | 'mcbC32' | 'spd' | 'timer' | 'ir' | 'meter1f'
export type ItemType = DeviceType | DinType

export interface TermDef {
  id: string
  label: string
  off: [number, number] // helyi eltolás a készülék közepétől
}
export interface ItemDef {
  type: ItemType
  name: string
  symbol?: string
  din?: number // modulszélesség
  terms: TermDef[]
  /** zárt belső érintkezők a kapcsolóállás (state) függvényében */
  contacts: (state: number) => [string, string][]
  states: number
  /** állapotát nem kézzel, hanem a vezérlés (nyomógomb) váltja: impulzusrelé, lépcsőházi automata */
  driven?: boolean
  /** nyomógomb: elengedve visszaugrik */
  momentary?: boolean
}

const sw = (t: string[]): TermDef[] =>
  t.map((id, i) => ({ id, label: id, off: [(i - (t.length - 1) / 2) * 0.016, -0.012] as [number, number] }))
const lnpe: TermDef[] = [
  { id: 'L', label: 'L', off: [-0.016, 0] },
  { id: 'N', label: 'N', off: [0, 0] },
  { id: 'PE', label: 'PE', off: [0.016, 0] },
]

export const ITEMS: ItemDef[] = [
  { type: 'rcd40', name: 'Áramvédő kapcsoló (FI) 2P 40 A / 30 mA', din: 2,
    terms: [
      { id: 'Lin', label: 'L be', off: [-0.009, 0.032] }, { id: 'Nin', label: 'N be', off: [0.009, 0.032] },
      { id: 'Lout', label: 'L ki', off: [-0.009, -0.032] }, { id: 'Nout', label: 'N ki', off: [0.009, -0.032] },
    ],
    contacts: (s) => (s ? [['Lin', 'Lout'], ['Nin', 'Nout']] : []), states: 2 },
  { type: 'rcd25_300', name: 'Áramvédő kapcsoló 2P 25 A / 300 mA', din: 2,
    terms: [
      { id: 'Lin', label: 'L be', off: [-0.009, 0.032] }, { id: 'Nin', label: 'N be', off: [0.009, 0.032] },
      { id: 'Lout', label: 'L ki', off: [-0.009, -0.032] }, { id: 'Nout', label: 'N ki', off: [0.009, -0.032] },
    ],
    contacts: (s) => (s ? [['Lin', 'Lout'], ['Nin', 'Nout']] : []), states: 2 },
  { type: 'mcbB10', name: 'Kismegszakító B10 1P', din: 1,
    terms: [{ id: 'in', label: 'be', off: [0, 0.032] }, { id: 'out', label: 'ki', off: [0, -0.032] }],
    contacts: (s) => (s ? [['in', 'out']] : []), states: 2 },
  { type: 'mcbB16', name: 'Kismegszakító B16 1P', din: 1,
    terms: [{ id: 'in', label: 'be', off: [0, 0.032] }, { id: 'out', label: 'ki', off: [0, -0.032] }],
    contacts: (s) => (s ? [['in', 'out']] : []), states: 2 },
  { type: 'mcbB32', name: 'Kismegszakító B32 1P (plombálható főkismegszakító)', din: 1,
    terms: [{ id: 'in', label: 'be', off: [0, 0.032] }, { id: 'out', label: 'ki', off: [0, -0.032] }],
    contacts: (s) => (s ? [['in', 'out']] : []), states: 2 },
  { type: 'meter1f', name: 'Egyfázisú fogyasztásmérő, direkt (1–3–4–6 kapcsos)', din: 5,
    terms: [
      { id: '1', label: '1 (L be)', off: [-0.03, -0.05] }, { id: '3', label: '3 (L ki)', off: [-0.01, -0.05] },
      { id: '4', label: '4 (N be)', off: [0.01, -0.05] }, { id: '6', label: '6 (N ki)', off: [0.03, -0.05] },
    ],
    contacts: () => [['1', '3'], ['4', '6']], states: 1 },
  { type: 'mcbC32', name: 'Kismegszakító C32 1P', din: 1,
    terms: [{ id: 'in', label: 'be', off: [0, 0.032] }, { id: 'out', label: 'ki', off: [0, -0.032] }],
    contacts: (s) => (s ? [['in', 'out']] : []), states: 2 },
  { type: 'spd', name: 'Túlfeszültség-levezető 1+N (T2)', din: 2,
    terms: [
      { id: 'L', label: 'L', off: [-0.009, 0.032] }, { id: 'N', label: 'N', off: [0.009, 0.032] },
      { id: 'PE', label: 'PE', off: [0, -0.032] },
    ],
    contacts: () => [], states: 1 },
  { type: 'timer', name: 'Lépcsőházi automata (LA), 1 modul', din: 1,
    terms: [
      { id: 'L', label: 'L', off: [-0.0045, 0.032] }, { id: 'S', label: 'nyomógomb', off: [0.0045, 0.032] },
      { id: 'N', label: 'N', off: [-0.0045, -0.032] }, { id: 'Q', label: 'lámpa', off: [0.0045, -0.032] },
    ],
    contacts: (s) => (s ? [['L', 'Q']] : []), states: 2, driven: true },
  { type: 'ir', name: 'Impulzusrelé (távkapcsoló) 230 V, 1 modul', din: 1,
    terms: [
      { id: 'A1', label: 'A1', off: [-0.0045, 0.032] }, { id: 'A2', label: 'A2', off: [0.0045, 0.032] },
      { id: '11', label: '11', off: [-0.0045, -0.032] }, { id: '14', label: '14', off: [0.0045, -0.032] },
    ],
    contacts: (s) => (s ? [['11', '14']] : []), states: 2, driven: true },
  { type: 'pb', name: 'Nyomógomb (záró), falon kívüli', terms: sw(['1', '2']),
    contacts: (s) => (s ? [['1', '2']] : []), states: 2, momentary: true },
  { type: 'sw101', name: 'Egypólusú kapcsoló (101)', terms: sw(['L', '1']),
    contacts: (s) => (s ? [['L', '1']] : []), states: 2 },
  { type: 'sw105', name: 'Csillárkapcsoló (105)',
    terms: sw(['L', '1', '2']), contacts: (s) => [[], [['L', '1']], [['L', '2']], [['L', '1'], ['L', '2']]][s] as [string, string][], states: 4 },
  { type: 'sw106', name: 'Váltókapcsoló (106)', terms: sw(['1', 'C', '2']),
    contacts: (s) => (s ? [['C', '2']] : [['C', '1']]), states: 2 },
  { type: 'sw107', name: 'Keresztkapcsoló (107)', terms: sw(['1', '2', '3', '4']),
    contacts: (s) => (s ? [['1', '4'], ['2', '3']] : [['1', '3'], ['2', '4']]), states: 2 },
  { type: 'lampMotion', name: 'Lámpatest mozgásérzékelővel (I. érintésvédelmi o.)', terms: lnpe,
    contacts: () => [], states: 2 },
  { type: 'lamp', name: 'Lámpatest (I. érintésvédelmi o.)', terms: lnpe, contacts: () => [], states: 1 },
  { type: 'socket', name: 'Dugaszolóaljzat 2P+F, falon kívüli', terms: lnpe, contacts: () => [], states: 1 },
]
export const itemByType = Object.fromEntries(ITEMS.map((d) => [d.type, d])) as Record<ItemType, ItemDef>
export const isDin = (t: ItemType) => !!itemByType[t].din

// ---------- Vezetékek ----------
export type WireColor = 'barna' | 'fekete' | 'szurke' | 'kek' | 'zoldsarga' | 'pen'
export type CrossSection = 1.5 | 2.5 | 4 | 6 | 10
export const WIRE_COLORS: { id: WireColor; name: string; hex: string; hex2?: string }[] = [
  { id: 'barna', name: 'Barna (L)', hex: '#6b3b1f' },
  { id: 'fekete', name: 'Fekete (L)', hex: '#151515' },
  { id: 'szurke', name: 'Szürke (L)', hex: '#8a8a8a' },
  { id: 'kek', name: 'Kék (N)', hex: '#1f5fd6' },
  { id: 'zoldsarga', name: 'Zöld-sárga (PE)', hex: '#2f9e44', hex2: '#f2d024' },
  { id: 'pen', name: 'Zöld-sárga, kék végjelöléssel (PEN)', hex: '#2f9e44', hex2: '#1f5fd6' },
]
export const colorHex = Object.fromEntries(WIRE_COLORS.map((c) => [c.id, c.hex])) as Record<WireColor, string>
export const CROSS_SECTIONS: CrossSection[] = [1.5, 2.5, 4, 6, 10]
export const STRIP_LENGTHS = [5, 10, 13, 20] // mm
