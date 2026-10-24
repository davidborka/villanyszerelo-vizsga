import { useEffect, useMemo, useRef, useState } from 'react'
import { CIRCUIT_DRILLS, LADDERS, PARTS, checkLadder, type Cell } from '../sim/drills'
import { CALC_TYPES, generateOne } from '../sim/generated'
import { saveRecord } from '../sim/progress'
import { useGame } from '../sim/store'
import { checkSchematic } from '../sim/score'
import { Pathway, SCHEM_NAMES, SchemSym, Sym, SYM_NAMES, type SchemKind, type SymKind } from './Drawings'

const shuffle = <T,>(a: T[]) => [...a].sort(() => Math.random() - 0.5)

// ---------- Számolás: végtelen feladat lépésenkénti megoldással ----------
function CalcTab() {
  const [type, setType] = useState('vegyes')
  const [q, setQ] = useState(() => generateOne('vegyes'))
  const order = useMemo(() => shuffle(q.options!.map((_, i) => i)), [q])
  const [pick, setPick] = useState<number | null>(null)
  const [steps, setSteps] = useState(false)
  const [score, setScore] = useState({ good: 0, all: 0 })
  const next = (t = type) => (setQ(generateOne(t)), setPick(null), setSteps(false))
  const choose = (i: number) => {
    if (pick !== null) return
    setPick(i)
    setScore((s) => ({ good: s.good + (i === q.answer ? 1 : 0), all: s.all + 1 }))
  }
  return (
    <div>
      <div className="row wrap">
        <label>
          Feladattípus
          <select value={type} onChange={(e) => (setType(e.target.value), next(e.target.value))}>
            <option value="vegyes">Vegyes (minden típus)</option>
            {CALC_TYPES.map((t) => <option key={t.key} value={t.key}>{t.label}</option>)}
          </select>
        </label>
        <span className="muted">Eredmény: <b>{score.good}</b> / {score.all}</span>
      </div>
      <h2 className="qtext">{q.q}</h2>
      <div className="opts">
        {order.map((i) => (
          <button key={i} className={'opt' + (pick !== null ? (i === q.answer ? ' right' : i === pick ? ' wrong' : '') : '')} onClick={() => choose(i)}>{q.options![i]}</button>
        ))}
      </div>
      {(pick !== null || steps) && <div className={'note ' + (pick === q.answer ? 'good' : pick === null ? '' : 'bad')}><b>Megoldás lépésenként</b><div className="steps">{q.explain}</div></div>}
      <div className="row">
        {pick === null && !steps && <button onClick={() => setSteps(true)}>Megoldás lépésenként</button>}
        <button className="primary" onClick={() => next()}>Új feladat →</button>
      </div>
      <p className="muted small">A számok minden feladatnál újak; a rossz válaszok a tipikus hibákból jönnek (kimaradt 2-es szorzó vagy √3, rossz feszültség, mértékegység).</p>
    </div>
  )
}

// ---------- Áramútrajz: minden alapkapcsolás ----------
function CircuitTab() {
  const [id, setId] = useState(CIRCUIT_DRILLS[0].id)
  const d = CIRCUIT_DRILLS.find((x) => x.id === id)!
  const [links, setLinks] = useState<[string, string][]>([])
  const [res, setRes] = useState<null | { ok: boolean; msg: string }>(null)
  const [hint, setHint] = useState(false)
  const choose = (x: string) => (setId(x), setLinks([]), setRes(null), setHint(false))
  return (
    <div>
      <div className="drills">
        {CIRCUIT_DRILLS.map((x) => <button key={x.id} className={x.id === id ? 'on' : ''} onClick={() => choose(x.id)}>{x.title}</button>)}
      </div>
      <h2 className="qtext">{d.title}</h2>
      <p className="muted small">Kattints két kapocsra az összekötéshez, vonalra a törléshez. A forrás: L (a kismegszakító után), N, PE{d.task.supply === 'tncs' ? '; mérőhelynél a PE-sín és az N-kapocs már szétválasztva' : ''}.</p>
      <Pathway key={id} task={d.task} links={links} setLinks={(l) => (setLinks(l), setRes(null))} />
      <div className="row wrap">
        <button className="primary" onClick={() => setRes(checkSchematic(d.task, links))}>Ellenőrzés</button>
        <button onClick={() => setHint(!hint)}>{hint ? 'Tipp elrejtése' : 'Tipp'}</button>
        <button onClick={() => (setLinks([]), setRes(null))}>Törlés</button>
      </div>
      {hint && <div className="note">💡 {d.hint}</div>}
      {res && <div className={'note ' + (res.ok ? 'good' : 'bad')}>{res.ok ? '✔ ' : '✘ '}{res.msg}</div>}
      <p className="muted small">Az ellenőrzés minden kapcsoló- és nyomógomb-állásban végigszámolja a hálózatot: zárlat, PE, a fázis kapcsolása és a működés is számít.</p>
    </div>
  )
}

// ---------- Motorvezérlés: rajzkiegészítés ----------
function LadderTab() {
  const [id, setId] = useState(LADDERS[0].id)
  const l = LADDERS.find((x) => x.id === id)!
  const [ans, setAns] = useState<Record<string, string>>({})
  const [res, setRes] = useState<null | { ok: boolean; wrong: string[] }>(null)
  const opts = useMemo(() => Object.entries(PARTS), [])
  const choose = (x: string) => (setId(x), setAns({}), setRes(null))
  const cell = (c: Cell, k: number): React.ReactNode => {
    if ('fixed' in c) return <div key={k} className="lc fixed">{c.fixed}</div>
    if ('slot' in c)
      return (
        <select key={k} className={'lc slot' + (res ? (res.wrong.includes(c.slot) ? ' bad' : ' good') : '')} value={ans[c.slot] ?? ''} onChange={(e) => (setAns({ ...ans, [c.slot]: e.target.value }), setRes(null))}>
          <option value="">– ? –</option>
          {opts.map(([v, t]) => <option key={v} value={v}>{t}</option>)}
        </select>
      )
    return <div key={k} className="lc par">{c.par.map((br, i) => <div key={i} className="branch">{br.map(cell)}</div>)}</div>
  }
  return (
    <div>
      <div className="drills">{LADDERS.map((x) => <button key={x.id} className={x.id === id ? 'on' : ''} onClick={() => choose(x.id)}>{x.title}</button>)}</div>
      <h2 className="qtext">{l.title}</h2>
      <p>{l.task}</p>
      <div className="ladder">
        <div className="rail">L1 (vezérlő fázis, F3 után)</div>
        {l.rungs.map((r, i) => (
          <div key={i} className="rung">
            <span className="wire" />
            {r.cells.map(cell)}
            <span className="wire" />
            <div className="lc coil">{r.coil}</div>
          </div>
        ))}
        <div className="rail">N</div>
      </div>
      <div className="row wrap">
        <button className="primary" onClick={() => setRes(checkLadder(l, ans))}>Ellenőrzés</button>
        <button onClick={() => (setAns({}), setRes(null))}>Törlés</button>
      </div>
      {res && <div className={'note ' + (res.ok ? 'good' : 'bad')}>{res.ok ? '✔ Helyes! ' : `✘ ${res.wrong.length} hely hibás (pirossal jelölve). `}{l.explain}</div>}
    </div>
  )
}

// ---------- Rajzjelek: installációs és kapcsolási jelek ----------
type AnySym = { set: 'inst'; k: SymKind } | { set: 'schem'; k: SchemKind }
const ALL_SYMS: AnySym[] = [
  ...(Object.keys(SYM_NAMES) as SymKind[]).map((k) => ({ set: 'inst' as const, k })),
  ...(Object.keys(SCHEM_NAMES) as SchemKind[]).map((k) => ({ set: 'schem' as const, k })),
]
const symName = (s: AnySym) => (s.set === 'inst' ? SYM_NAMES[s.k] : SCHEM_NAMES[s.k])
function SymbolTab() {
  const [set, setSet] = useState(() => shuffle(ALL_SYMS).slice(0, 9))
  const [ans, setAns] = useState<Record<number, string>>({})
  const [shown, setShown] = useState(false)
  const names = useMemo(() => [...new Set(ALL_SYMS.map(symName))].sort(), [])
  const good = set.filter((s, i) => ans[i] === symName(s)).length
  return (
    <div>
      <p className="muted">Installációs (alaprajzi) és kapcsolási (áramúti) rajzjelek – válaszd ki a nevüket.</p>
      <div className="grid syms3">
        {set.map((s, i) => (
          <div key={i} className={'symq' + (shown ? (ans[i] === symName(s) ? ' good' : ' bad') : '')}>
            {s.set === 'inst' ? <Sym kind={s.k} /> : <SchemSym kind={s.k} />}
            <select value={ans[i] ?? ''} onChange={(e) => setAns({ ...ans, [i]: e.target.value })}>
              <option value="">– válassz –</option>
              {names.map((n) => <option key={n}>{n}</option>)}
            </select>
            {shown && ans[i] !== symName(s) && <div className="small">Helyes: {symName(s)}</div>}
          </div>
        ))}
      </div>
      <div className="row">
        {!shown ? <button className="primary" onClick={() => setShown(true)}>Ellenőrzés</button> : <b>{good} / {set.length} helyes</b>}
        <button onClick={() => (setSet(shuffle(ALL_SYMS).slice(0, 9)), setAns({}), setShown(false))}>Új sor</button>
      </div>
    </div>
  )
}

// ---------- Portfólióvédés LLM nélkül: időzítő, bizottsági kérdések, felvétel, önértékelés ----------
const PHASES = [
  { min: 1, t: 'Mi volt a munka: hol, milyen épület, mi volt a feladat, mi volt a te szereped.' },
  { min: 3, t: 'Hogyan csináltad: tervezés, anyagválasztás (miért az a keresztmetszet és védelem), a kivitelezés fázisai fotókkal.' },
  { min: 2, t: 'Ellenőrzés és mérés: milyen méréseket, milyen műszerrel, milyen eredménnyel; megfelelt-e.' },
  { min: 2, t: 'Saját rajzi dokumentáció: mutasd és magyarázd el a rajzod jeleit.' },
  { min: 2, t: 'Önreflexió: mi ment jól, mit csinálnál ma másként, mit tanultál.' },
]
const COMMITTEE = [
  'Ezt a rajzot ön készítette? Mit jelent ez a jel?', 'Miért ezt a keresztmetszetet választotta a dugaljkörhöz?', 'Miért B karakterisztikájú kismegszakítót választott, és nem C-t?',
  'Hogyan helyezte feszültségmentesre a munkaterületet? Milyen vizsgálóval ellenőrizte?', 'Milyen méréseket végzett átadás előtt? Mi volt a szigetelési ellenállás határértéke?',
  'Mi történik, ha egy dugalj védőérintkezője nincs bekötve?', 'Mit véd az áram-védőkapcsoló, és mekkora a kioldóárama?', 'Hol választotta szét a PEN-vezetőt, és mi a szabály utána?',
  'Hogyan kötötte be a váltó- és keresztkapcsolókat?', 'Milyen kábelt használt, és mit jelent a típusjele?', 'Milyen műszerrel mérte az áramot, és hogyan számolta ki a teljesítményt?',
  'Mi volt a legnehezebb része a munkának, és hogyan oldotta meg?', 'Mit csinálna ma másként?', 'Hogyan dokumentálta a kivitelezés fázisait?', 'Milyen munkavédelmi szabályokat tartott be?',
  'Hol kell túlfeszültség-levezetőt alkalmazni, és milyen fokozatút?', 'Mit tartalmaz a mérési jegyzőkönyv?', 'Hogyan ellenőrizte a védővezető folytonosságát?',
]
const CRIT = ['Szakszerű szöveges leírás', 'Saját rajzi dokumentáció', 'A kivitelezési fázisok dokumentálása', 'Szóbeli védés és önreflexió']

function PortfolioTab() {
  const [start, setStart] = useState<number | null>(null)
  const [now, setNow] = useState(() => Date.now())
  const [qs, setQs] = useState(() => shuffle(COMMITTEE).slice(0, 4))
  const [rec, setRec] = useState<{ on: boolean; url: string | null; err?: string }>({ on: false, url: null })
  const media = useRef<MediaRecorder | null>(null)
  const [self, setSelf] = useState<number[]>([3, 3, 3, 3])
  const [saved, setSaved] = useState(false)
  useEffect(() => {
    if (start === null) return
    const t = setInterval(() => setNow(Date.now()), 500)
    return () => clearInterval(t)
  }, [start])
  const sec = start === null ? 0 : Math.floor((now - start) / 1000)
  let acc = 0
  const phase = PHASES.findIndex((p) => (acc += p.min * 60) > sec)
  const startRec = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const chunks: Blob[] = []
      const m = new MediaRecorder(stream)
      m.ondataavailable = (e) => chunks.push(e.data)
      m.onstop = () => (stream.getTracks().forEach((t) => t.stop()), setRec({ on: false, url: URL.createObjectURL(new Blob(chunks, { type: m.mimeType })) }))
      m.start()
      media.current = m
      setRec({ on: true, url: null })
    } catch {
      setRec({ on: false, url: null, err: 'A mikrofon nem érhető el – a gyakorlás felvétel nélkül is működik.' })
    }
  }
  const pct = Math.round((100 * self.reduce((a, b) => a + b, 0)) / 20)
  return (
    <div>
      <p className="muted">I. vizsgarész (a projekt 20%-a): 10 perces bemutatás és kérdések. Ez a gyakorló mesterséges intelligencia nélkül, a böngészőben fut; a felvétel csak nálad marad.</p>
      <div className="row wrap">
        {start === null ? <button className="primary" onClick={() => (setStart(Date.now()), setNow(Date.now()))}>▶ 10 perc indítása</button> : <button onClick={() => setStart(null)}>Leállítás</button>}
        {!rec.on ? <button onClick={startRec}>● Hangfelvétel</button> : <button onClick={() => media.current?.stop()}>■ Felvétel leállítása</button>}
        <span className={'timer' + (sec > 600 ? ' low' : '')}>{Math.floor(sec / 60)}:{String(sec % 60).padStart(2, '0')} / 10:00</span>
      </div>
      {rec.err && <p className="muted small">{rec.err}</p>}
      {rec.url && <audio controls src={rec.url} />}
      <ol className="phases">
        {PHASES.map((p, i) => <li key={i} className={start !== null && i === phase ? 'cur' : ''}><b>{p.min} perc</b> – {p.t}</li>)}
      </ol>
      {sec > 600 && <div className="note bad">Túllépted a 10 percet – a vizsgán a bizottság itt megállít.</div>}
      <h3>A bizottság kérdései</h3>
      <ul>{qs.map((q) => <li key={q}>{q}</li>)}</ul>
      <button onClick={() => setQs(shuffle(COMMITTEE).slice(0, 4))}>Új kérdések</button>
      <p className="muted small">Válasz előbb, indoklás utána: „B16, mert a 2,5 mm²-es vezetéket ez védi.” Ha nem tudod, mondd ki, és mondd el, hol néznél utána.</p>
      <h3>Önértékelés (KKK: 4 × 5%)</h3>
      {CRIT.map((c, i) => (
        <label key={c} className="crit">
          <span>{c}</span>
          <input type="range" min={0} max={5} value={self[i]} onChange={(e) => (setSelf(self.map((v, j) => (j === i ? +e.target.value : v))), setSaved(false))} />
          <b>{self[i]} / 5</b>
        </label>
      ))}
      <div className="row">
        <b>Portfólió: {pct}%</b>
        <button className="primary" onClick={() => (saveRecord({ portfolio: pct, portfolioSrc: 'becsles' }), setSaved(true))}>Mentés a vizsga-előrejelzésbe</button>
        {saved && <span className="good-t">✓ mentve</span>}
      </div>
    </div>
  )
}

const TABS = [
  { id: 'szamolas', name: 'Számolás', C: CalcTab },
  { id: 'aramut', name: 'Áramútrajz', C: CircuitTab },
  { id: 'motor', name: 'Motorvezérlés', C: LadderTab },
  { id: 'jelek', name: 'Rajzjelek', C: SymbolTab },
  { id: 'portfolio', name: 'Portfólióvédés', C: PortfolioTab },
]

export function Practice({ onExit }: { onExit: () => void }) {
  const [tab, setTab] = useState(useGame.getState().practiceTab)
  const T = TABS.find((t) => t.id === tab)!
  return (
    <div className="quiz">
      <header>
        <button className="brand" onClick={onExit}>⚡ Gyakorlóterem</button>
        <nav className="tabs">{TABS.map((t) => <button key={t.id} className={t.id === tab ? 'cur' : ''} onClick={() => setTab(t.id)}>{t.name}</button>)}</nav>
        <span style={{ flex: 1 }} />
        <button onClick={onExit}>Főmenü</button>
      </header>
      <section className="qcard practice">
        <T.C />
      </section>
    </div>
  )
}
