import { useEffect, useMemo, useState } from 'react'
import { CROSS_SECTIONS, ITEMS, itemByType, STRIP_LENGTHS, TOOLS, WIRE_COLORS, type DinType } from '../sim/catalog'
import { simulate, termLabel } from '../sim/circuit'
import type { DeviceType, EndCut } from '../sim/layout'
import { checkSchematic, computeResult, expectedCount, forecast, quizFor, RULES, sheetII, sheetIII, sheetPct, WIRE_NEED } from '../sim/score'
import { loadRecord, saveRecord } from '../sim/progress'
import { STAGES, useGame, type StageId } from '../sim/store'
import { TASKS } from '../sim/tasks'
import { OneLine, OneLineGeneric, Pathway, Sym, SYM_NAMES, type SymKind } from './Drawings'

const useTask = () => useGame((s) => TASKS[s.taskId])
const usePractice = () => useGame((s) => s.mode === 'gyakorlo')
const next = (id: StageId): StageId => STAGES[STAGES.findIndex((s) => s.id === id) + 1]?.id ?? id

function NextBtn({ label = 'Tovább →', onClick }: { label?: string; onClick?: () => void }) {
  const stage = useGame((s) => s.stage)
  const setStage = useGame((s) => s.setStage)
  if (stage === 'ellenorzes') return null
  return (
    <button className="primary" onClick={() => (onClick?.(), setStage(next(stage)))}>
      {label}
    </button>
  )
}

function Hint({ children }: { children: React.ReactNode }) {
  return usePractice() ? <div className="hint">💡 {children}</div> : null
}

// ---------- 1. Feladatlap ----------
/** A kiadott feladatlap tartalma: a Feladatlap szakaszban és a bármikor megnyitható oldalsó lapon is ez látszik */
export function TaskSheetContent() {
  const task = useTask()
  return (
    <div>
      <div className="kicker">Projektfeladat · {task.part === 'III' ? 'III. vizsgarész – fogyasztásmérő hely' : 'II. vizsgarész – épületvillamosság'}</div>
      <h2>{task.title}</h2>
      <p className="muted">{task.intro}</p>
      <ul className="bullets">
        {task.bullets.map((b, i) => <li key={i}>{b}</li>)}
      </ul>
      <h3>Bekötési (egyvonalas) rajz</h3>
      {/* az érszámok a rajzolvasási feladat részei, ezért itt nem látszanak */}
      {task.oneLine === 'nyariKonyha' ? <OneLine segments={[]} /> : <OneLineGeneric circuits={task.oneLine} />}
      <h3>Mérés</h3>
      <ul className="bullets">
        <li>Árammérés {task.measure.currentLabel}, a felvett teljesítmény kiszámítása (P = U · I).</li>
        <li>Fázisfeszültség mérése a(z) {task.measure.voltageAt} dugaszolóaljzatban, értékelés a tűréshatárhoz.</li>
        <li>Mérési jegyzőkönyv: mérés tárgya, műszerek, kapcsolási rajz, mért és számított értékek.</li>
      </ul>
      <p className="muted small">Valós vizsga: 300 perc. A projektfeladat 70%, az interaktív vizsga 30% súlyú; mindkettőn külön min. 40% kell. Az áramütés elleni védelem hibája érvénytelen vizsgát jelent.</p>
    </div>
  )
}

function Feladat() {
  return (
    <div>
      <TaskSheetContent />
      <NextBtn label="Anyagvételezés →" />
    </div>
  )
}

// ---------- 2. Anyag + szerszám ----------
function Anyag() {
  const { belt, toggleBelt, materials, setMaterial, wireStock, toggleWireStock } = useGame()
  const task = useTask()
  const practice = usePractice()
  const [shown, setShown] = useState(false)
  const reveal = practice && shown
  return (
    <div>
      <h2>Anyagvételezés, szerszámválasztás</h2>
      <p className="muted">Válaszd ki a készülékeket, szerelvényeket, vezetékeket és a szerszámaidat. Amit itt nem viszel, azt később csak a ládához visszamenve (időveszteséggel) kapod meg.</p>
      <h3>Szerszámok</h3>
      <div className="grid tools">
        {TOOLS.map((t) => (
          <button key={t.id} className={'chip' + (belt.includes(t.id) ? ' on' : '') + (reveal ? ` r-${t.role}` : '')} onClick={() => toggleBelt(t.id)} title={reveal ? t.why : t.name}>
            <span className="ico">{t.icon}</span>
            {t.name}
          </button>
        ))}
      </div>
      <h3>Készülékek, szerelvények</h3>
      <table className="mat">
        <tbody>
          {ITEMS.map((it) => {
            const n = materials[it.type] ?? 0
            const want = expectedCount(task, it.type)
            return (
              <tr key={it.type} className={reveal ? (n === want ? 'good' : 'bad') : ''}>
                <td>{it.name}{reveal && n !== want && <span className="small muted"> (kell: {want})</span>}</td>
                <td className="qty">
                  <button onClick={() => setMaterial(it.type, n - 1)}>−</button>
                  <b>{n}</b>
                  <button onClick={() => setMaterial(it.type, n + 1)}>+</button>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
      <h3>Vezeték (H07V-U, tömör réz)</h3>
      <table className="mat">
        <tbody>
          {CROSS_SECTIONS.map((cs) => (
            <tr key={cs}>
              <td>{String(cs).replace('.', ',')} mm²</td>
              <td>
                {WIRE_COLORS.map((c) => {
                  const k = `${cs}-${c.id}`
                  return (
                    <label key={k} className={'wirechk' + (reveal && WIRE_NEED.includes(k) && !wireStock.includes(k) ? ' miss' : '')} title={c.name}>
                      <input type="checkbox" checked={wireStock.includes(k)} onChange={() => toggleWireStock(k)} />
                      <span className="sw" style={{ background: c.hex2 ? `repeating-linear-gradient(45deg, ${c.hex} 0 5px, ${c.hex2} 5px 10px)` : c.hex }} />
                    </label>
                  )
                })}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {practice && !shown && <button onClick={() => setShown(true)}>Gyakorló: mutasd, mi kell</button>}
      <NextBtn />
    </div>
  )
}

// ---------- 3. Rajzolvasás ----------
function Rajz() {
  const task = useTask()
  const practice = usePractice()
  const { rajz, setRajz } = useGame()
  const [checked, setChecked] = useState(false)
  const quiz = quizFor(task)
  const reveal = practice && checked
  const sch = useMemo(() => (reveal ? checkSchematic(task, rajz.links) : null), [reveal, task, rajz.links])
  return (
    <div>
      <h2>Rajzi dokumentáció értelmezése</h2>
      <h3>A) Rajzjelek (MSZ EN 60617)</h3>
      <div className="grid syms">
        {quiz.map((k, i) => (
          <div key={i} className={'symq' + (reveal ? (rajz.sym[i] === k ? ' good' : ' bad') : '')}>
            <Sym kind={k as SymKind} />
            <select value={rajz.sym[i] ?? ''} onChange={(e) => setRajz({ sym: { ...rajz.sym, [i]: e.target.value } })}>
              <option value="">– válassz –</option>
              {Object.entries(SYM_NAMES).map(([id, n]) => <option key={id} value={id}>{n}</option>)}
            </select>
            {reveal && rajz.sym[i] !== k && <div className="small">Helyes: {SYM_NAMES[k as SymKind]}</div>}
          </div>
        ))}
      </div>
      {task.segments && task.oneLine === 'nyariKonyha' && (
        <>
          <h3>B) Hány eres a vezetékezés az egyes szakaszokon?</h3>
          <OneLine segments={task.segments} inputs={rajz.seg} onInput={(id, v) => setRajz({ seg: { ...rajz.seg, [id]: v } })} reveal={reveal} />
        </>
      )}
      <h3>{task.segments ? 'C' : 'B'}) Áramútrajz: {task.schematic.goal}</h3>
      <p className="muted small">Kattints két kapocsra az összekötéshez, vonalra a törléshez.</p>
      <Pathway task={task} links={rajz.links} setLinks={(links) => setRajz({ links })} />
      {sch && <div className={'note ' + (sch.ok ? 'good' : 'bad')}>{sch.msg}</div>}
      {practice && <button onClick={() => setChecked(!checked)}>{checked ? 'Elrejt' : 'Gyakorló: ellenőrzés'}</button>}
      <NextBtn />
    </div>
  )
}

// ---------- 4. Kábelcsatorna ----------
function Csatorna() {
  const { selectedPiece, cuts, cutPiece, pieceAction, say, set, tape, stockUsed, wasted } = useGame()
  const task = useTask()
  const p = task.layout.pieces.find((x) => x.id === selectedPiece)
  const [len, setLen] = useState('')
  const [ends, setEnds] = useState<[EndCut, EndCut]>([90, 90])
  const doCut = () => {
    if (!p) return
    const mm = Number(len.replace(',', '.'))
    if (!mm || mm < 20 || mm > 2000) return say('Adj meg hosszt mm-ben (20–2000).')
    cutPiece(p.id, Math.round(mm), ends)
  }
  const tapeMm = tape.length === 2 ? Math.round(Math.hypot(tape[0][0] - tape[1][0], tape[0][1] - tape[1][1]) * 1000) : null
  return (
    <div>
      <h2>Kábelcsatorna</h2>
      <p className="muted small">A kézben lévő szerszámmal dolgozol (lent a szerszámöv). Mérőszalaggal két pontra kattintva mérsz a lapon; a nyomvonalakat a lapra kattintva választod ki.</p>
      <Hint>Gérvágott darabnál a hosszabb (külső) élen mérj. Vágás után sorjázz, felszerelés után a fő csatornát vízmértékkel állítsd be.</Hint>
      {tapeMm !== null && <div className="note">📏 <b>{tapeMm} mm</b> <button onClick={() => set({ tape: [] })}>törlés</button></div>}
      <table className="mat pieces">
        <tbody>
          {task.layout.pieces.map((x) => {
            const c = cuts[x.id]
            return (
              <tr key={x.id} className={selectedPiece === x.id ? 'sel' : ''} onClick={() => set({ selectedPiece: x.id })}>
                <td>{x.label}</td>
                <td className="small">{c ? `${Math.round(c.len * 1000)} mm ${c.ends[0]}°/${c.ends[1]}°` : '–'}</td>
                <td className="small">{c?.deburred ? '✓sorja ' : ''}{c?.mounted ? '✓fent' : ''}{c?.leveled ? ' ✓víz' : ''}</td>
              </tr>
            )
          })}
        </tbody>
      </table>
      {p && (
        <div className="card">
          <b>{p.label}</b>
          <div className="row">
            <label>
              Hossz (mm)
              <input value={len} onChange={(e) => setLen(e.target.value)} inputMode="numeric" />
            </label>
            {[0, 1].map((i) => (
              <label key={i}>
                {i === 0 ? 'Kezdő vég' : 'Záró vég'}
                <select value={ends[i]} onChange={(e) => setEnds((i === 0 ? [Number(e.target.value), ends[1]] : [ends[0], Number(e.target.value)]) as [EndCut, EndCut])}>
                  <option value={90}>90°</option>
                  <option value={45}>45°</option>
                </select>
              </label>
            ))}
          </div>
          <div className="row wrap">
            <button onClick={doCut}>Vágás</button>
            <button onClick={() => pieceAction(p.id, 'deburr')}>Sorjázás</button>
            {cuts[p.id]?.mounted ? <button onClick={() => pieceAction(p.id, 'unmount')}>Leszerelés</button> : <button onClick={() => pieceAction(p.id, 'mount')}>Felszerelés</button>}
            <button onClick={() => pieceAction(p.id, 'level')}>Vízszint</button>
          </div>
        </div>
      )}
      <p className="muted small">Felhasznált csatorna: {stockUsed.toFixed(2)} m · hulladék: {wasted.toFixed(2)} m</p>
      <NextBtn />
    </div>
  )
}

// ---------- 5. Készülékek ----------
function Szereles() {
  const { materials, din, addDin, removeDin, selectedMount, mounts, placeDevice, set } = useGame()
  const task = useTask()
  const m = task.layout.mounts.find((x) => x.id === selectedMount)
  const dinItems = ITEMS.filter((i) => i.din && (materials[i.type] ?? 0) > 0)
  const wallItems = ITEMS.filter((i) => !i.din && (materials[i.type] ?? 0) > 0)
  const cab = task.supply === 'tncs'
  return (
    <div>
      <h2>Készülékek elhelyezése</h2>
      {cab && (
        <>
          <h3>Mérőszekrény</h3>
          <div className="row wrap">
            {dinItems.map((i) => <button key={i.type} onClick={() => addDin(i.type as DinType, 'cab')}>+ {i.name}</button>)}
          </div>
          <div className="dinrow">
            {din.filter((d) => d.zone === 'cab').map((d) => (
              <span key={d.uid} className="din">
                {d.uid}: {itemByType[d.type].name.split(' ').slice(0, 3).join(' ')} <button onClick={() => removeDin(d.uid)}>×</button>
              </span>
            ))}
          </div>
        </>
      )}
      <h3>{cab ? 'Lakás főelosztó (mért oldal)' : 'Elosztó'} – DIN-sín (balról jobbra)</h3>
      <div className="row wrap">
        {dinItems.map((i) => <button key={i.type} onClick={() => addDin(i.type as DinType)}>+ {i.name}</button>)}
        {!dinItems.length && <span className="muted small">Nem vételeztél DIN-készüléket.</span>}
      </div>
      <div className="dinrow">
        {din.filter((d) => d.zone !== 'cab').map((d) => (
          <span key={d.uid} className="din">
            {d.uid}: {itemByType[d.type].name.split(' ').slice(0, 3).join(' ')} <button onClick={() => removeDin(d.uid)}>×</button>
          </span>
        ))}
      </div>
      <h3>Szerelvények a falon</h3>
      <p className="muted small">Válassz dobozhelyet a lapon vagy a listában.</p>
      <table className="mat">
        <tbody>
          {task.layout.mounts.map((x) => (
            <tr key={x.id} className={selectedMount === x.id ? 'sel' : ''} onClick={() => set({ selectedMount: x.id })}>
              <td>{x.label}</td>
              <td className="small">{mounts[x.id] ? itemByType[mounts[x.id]!].name : '–'}</td>
            </tr>
          ))}
        </tbody>
      </table>
      {m && (
        <div className="card">
          <b>{m.label}</b>
          <div className="row wrap">
            {wallItems.map((i) => <button key={i.type} onClick={() => placeDevice(m.id, i.type as DeviceType)}>{i.name}</button>)}
            {mounts[m.id] && <button onClick={() => placeDevice(m.id, undefined)}>Leszerel</button>}
          </div>
        </div>
      )}
      <NextBtn />
    </div>
  )
}

// ---------- 6. Vezetékezés ----------
function Vezetekezes() {
  const { wireColor, wireCs, wireStrip, set, hoverTerm, pendingTerm, wires, removeWire, wireStock, lidsOn } = useGame()
  const practice = usePractice()
  return (
    <div>
      <h2>Vezetékezés</h2>
      <p className="muted small">Kattints két kapocsra: a vezeték a csatornában fut. Törlés: kattints a vezetékre (vagy a listában).</p>
      <Hint>L: barna/fekete/szürke, N: kék, PE: zöld-sárga. Világítás 1,5 mm², dugaljkör 2,5 mm². Csupaszolás 8–14 mm. Szerelés előtt feszültségmentesíts!</Hint>
      <div className="row wrap">
        {WIRE_COLORS.map((c) => (
          <button key={c.id} className={'colorbtn' + (wireColor === c.id ? ' on' : '')} onClick={() => set({ wireColor: c.id })}>
            <span className="sw" style={{ background: c.hex2 ? `repeating-linear-gradient(45deg, ${c.hex} 0 5px, ${c.hex2} 5px 10px)` : c.hex }} />
            {practice ? c.name : c.name.replace(/ \(.*\)/, '')}
          </button>
        ))}
      </div>
      <div className="row">
        <label>
          Keresztmetszet
          <select value={wireCs} onChange={(e) => set({ wireCs: Number(e.target.value) as 1.5 })}>
            {CROSS_SECTIONS.map((c) => <option key={c} value={c} disabled={!wireStock.some((k) => k.startsWith(c + '-'))}>{String(c).replace('.', ',')} mm²</option>)}
          </select>
        </label>
        <label>
          Csupaszolás
          <select value={wireStrip} onChange={(e) => set({ wireStrip: Number(e.target.value) })}>
            {STRIP_LENGTHS.map((l) => <option key={l} value={l}>{l} mm</option>)}
          </select>
        </label>
      </div>
      <div className="note">
        {pendingTerm ? <>Kezdőpont: <b>{termLabel(pendingTerm)}</b> → kattints a végpontra</> : 'Kattints egy kapocsra.'}
        {hoverTerm && <div className="small muted">Egér alatt: {termLabel(hoverTerm)}</div>}
      </div>
      <div className="wirelist">
        {wires.map((w) => {
          const c = WIRE_COLORS.find((x) => x.id === w.color)!
          return (
            <div key={w.id} className="wireitem">
              <span className="sw" style={{ background: c.hex2 ? `repeating-linear-gradient(45deg,${c.hex} 0 4px,${c.hex2} 4px 8px)` : c.hex }} />
              {termLabel(w.a)} → {termLabel(w.b)} <span className="muted small">{String(w.cs).replace('.', ',')} mm²</span>
              <button onClick={() => removeWire(w.id)}>×</button>
            </div>
          )
        })}
      </div>
      <button onClick={() => set({ lidsOn: !lidsOn })}>{lidsOn ? 'Csatornafedelek le' : 'Csatornafedelek fel'}</button>
      <NextBtn />
    </div>
  )
}

// ---------- 7. Ellenőrzés, mérés ----------
function Ellenorzes() {
  const g = useGame()
  const task = useTask()
  const practice = usePractice()
  const { insp, setInsp, tryTool, say, judge, powered, setPowered, tested, din, dinOn, set } = g
  const shuffled = useMemo(() => RULES.map((r, i) => ({ r, i })).sort(() => Math.random() - 0.5), [])
  const sim = powered ? simulate(g) : null
  const num = (x: string) => x

  const voltTest = () => {
    const r = tryTool('voltTest')
    if (r === 'no') return
    if (powered) return say('⚡ A vizsgáló 230 V-ot mutat – a berendezés feszültség alatt van!', 'event')
    setInsp({ vfree: true })
    say('L–N, L–PE, N–PE: 0 V. Feszültségmentes.')
  }
  const measureIso = () => {
    if (tryTool('iso') !== 'ok') return
    if (powered) {
      judge('error', 'Szigetelési ellenállást feszültség alatt próbáltál mérni – tilos, a műszer és a készülékek károsodhatnak.')
      return say('A műszer idegen feszültséget jelez a mérőkörön, a mérést letiltja.', 'event')
    }
    const findings = computeResult(g).findings
    const shortOrPe = findings.some((f) => /Zárlat|Testzárlat|N és PE/.test(f.msg))
    const peMissing = findings.some((f) => f.msg.includes('védővezető (PE) nincs'))
    setInsp({ isoRes: { iso: shortOrPe ? '0,00 MΩ' : '>299 MΩ', pe: peMissing ? 'OL (szakadás)' : '0,31 Ω' } })
    say(`Mérés kész (${insp.isoV} V DC).`)
  }
  const powerOn = () => {
    if (!insp.vfree || !insp.isoRes) judge('warn', 'Ellenőrző mérések nélkül helyezted feszültség alá a berendezést.')
    set({ dinOn: Object.fromEntries(din.map((d) => [d.uid, true])), lidsOn: true })
    setPowered(true)
    say('Felügyelő jelenlétében feszültség alá helyezve.', 'event')
  }
  const measureI = () => {
    const r = tryTool('current')
    if (r === 'no') return
    if (r === 'bad') return say('Multiméterrel csak a kör megbontásával mérhetnél áramot – lakatfogó kell.')
    const lit = task.measure.currentLoads.filter((id) => sim?.lit[id])
    const watt = lit.reduce((a, id) => a + (task.loads.find((l) => l.id === id)?.watt ?? 0), 0)
    const I = powered ? watt / g.supplyU : 0
    setInsp({ iRead: I.toFixed(3).replace('.', ',') + ' A', iValue: Number(I.toFixed(3)) })
  }
  const measureU = () => {
    if (tryTool('voltage') === 'no') return
    const so = sim?.sockets[task.measure.voltageAt]
    setInsp({ uRead: so?.live ? g.supplyU.toFixed(1).replace('.', ',') + ' V' : '0,0 V' })
  }
  const controls = task.layout.mounts.filter((m) => m.kind === 'switch')

  return (
    <div>
      <h2>Ellenőrzés, mérés, bemutatás</h2>
      <h3>Feszültségmentesítés öt szabálya</h3>
      <p className="muted small">Kattints a lépésekre a helyes sorrendben.</p>
      <div className="rules">
        {shuffled.map(({ r, i }) => (
          <button key={i} disabled={insp.order.includes(i)} onClick={() => setInsp({ order: [...insp.order, i] })}>
            {insp.order.includes(i) ? `${insp.order.indexOf(i) + 1}. ` : ''}{r}
          </button>
        ))}
      </div>
      {insp.order.length > 0 && <button onClick={() => setInsp({ order: [] })}>Sorrend törlése</button>}

      <h3>Feszültségmentesség ellenőrzése</h3>
      <button onClick={voltTest}>Mérés a betáp kapcsain (kézben lévő műszerrel)</button>
      {insp.vfree && <span className="good-t"> ✓</span>}

      <h3>Szigetelési ellenállás, PE-folytonosság</h3>
      <div className="row">
        <label>
          Mérőfeszültség
          <select value={insp.isoV} onChange={(e) => setInsp({ isoV: Number(e.target.value) })}>
            {[250, 500, 1000].map((v) => <option key={v} value={v}>{v} V DC</option>)}
          </select>
        </label>
        <button onClick={measureIso}>Mérés</button>
      </div>
      {insp.isoRes && (
        <div className="card">
          <div>R<sub>iso</sub> (L+N – PE): <b>{insp.isoRes.iso}</b></div>
          <div>R<sub>PE</sub> (védővezető-folytonosság): <b>{insp.isoRes.pe}</b></div>
          <div className="row">
            <label>
              Határérték
              <select value={insp.isoLimit} onChange={(e) => setInsp({ isoLimit: e.target.value })}>
                <option value="">–</option>
                <option value="0.5">≥ 0,5 MΩ</option>
                <option value="1">≥ 1 MΩ</option>
                <option value="2">≥ 2 MΩ</option>
              </select>
            </label>
            <label>
              Értékelés
              <select value={insp.isoJudge} onChange={(e) => setInsp({ isoJudge: e.target.value })}>
                <option value="">–</option>
                <option value="ok">Megfelel</option>
                <option value="nok">Nem felel meg</option>
              </select>
            </label>
          </div>
        </div>
      )}

      <h3>Feszültség alá helyezés, funkciópróba</h3>
      {!powered ? <button className="primary" onClick={powerOn}>⚡ Bekapcsolás</button> : <button onClick={() => setPowered(false)}>Hálózatról leválasztás</button>}
      {powered && (
        <div className="card small">
          <div>Kezeld a berendezést a lapon: kapcsolók, nyomógombok{task.layout.mounts.some((m) => m.expect === 'lampMotion') ? ', mozgásérzékelő (kattints a lámpára)' : ''}, DIN-készülékek karja, ÁVK sárga próbagombja.</div>
          <div className="row wrap">
            {din.map((d) => <span key={d.uid} className={'pill ' + (dinOn[d.uid] ? 'on' : 'off')}>{d.uid} {itemByType[d.type].driven ? '' : dinOn[d.uid] ? 'BE' : 'KI'}</span>)}
          </div>
          {practice && (
            <div>Próbált: {controls.map((k) => (tested.sw[k.id] ? `✓${k.id} ` : `·${k.id} `))}{tested.rcdTest ? '✓ÁVK' : '·ÁVK'}</div>
          )}
        </div>
      )}

      <h3>Mérések</h3>
      <div className="row wrap">
        <button onClick={measureI}>Árammérés {task.measure.currentLabel}</button>
        {insp.iRead && <b className="reading">{insp.iRead}</b>}
      </div>
      <div className="row wrap">
        <button onClick={measureU}>Feszültség a(z) {task.measure.voltageAt} dugaljban (L–N)</button>
        {insp.uRead && <b className="reading">{insp.uRead}</b>}
      </div>
      <div className="card protocol">
        <b>Mérési jegyzőkönyv</b>
        <div className="row wrap">
          <label>I [A]<input value={num(insp.jk.I)} onChange={(e) => setInsp({ jk: { ...insp.jk, I: e.target.value } })} /></label>
          <label>P = U·I [W]<input value={insp.jk.P} onChange={(e) => setInsp({ jk: { ...insp.jk, P: e.target.value } })} /></label>
          <label>U [V]<input value={insp.jk.U} onChange={(e) => setInsp({ jk: { ...insp.jk, U: e.target.value } })} /></label>
          <label>
            Tűréshatáron belül?
            <select value={insp.jk.judge} onChange={(e) => setInsp({ jk: { ...insp.jk, judge: e.target.value } })}>
              <option value="">–</option>
              <option value="ok">Igen, megfelel</option>
              <option value="nok">Nem felel meg</option>
            </select>
          </label>
        </div>
      </div>
      <Hint>P = U · I (izzó/ohmos terhelés, cos φ = 1). Hálózati tűrés: 230 V ±10%. Szigetelés: 500 V DC, ≥ 1 MΩ.</Hint>
      <button className="primary" onClick={() => g.submit()}>Munka beadása, értékelés →</button>
    </div>
  )
}

// ---------- 8. Értékelés ----------
function Ertekeles() {
  const g = useGame()
  const task = useTask()
  const r = useMemo(() => computeResult(g), [g])
  const mins = Math.round((Date.now() - g.startedAt) / 60000)
  const passed = r.total >= 40 && !r.critical.length
  const part = task.part ?? 'II'
  const sheet = part === 'III' ? sheetIII(r) : sheetII(r)
  const pct = Math.round(sheetPct(sheet))
  const invalid = r.critical.length > 0
  const [rec, setRec] = useState(loadRecord)
  useEffect(() => {
    // vizsga módban a beadott eredmény bekerül a vizsga-előrejelzésbe
    if (g.mode !== 'vizsga' || !g.submitted || g.solved.length) return
    setRec(part === 'III' ? saveRecord({ iii: { pct, invalid, at: Date.now() } }) : saveRecord({ ii: { pct, invalid, task: task.title, at: Date.now() } }))
  }, [g.mode, g.submitted, g.solved.length, part, pct, invalid, task.title])
  const fc = forecast(rec)
  return (
    <div>
      <div className="kicker">{task.title} · {g.mode === 'vizsga' ? 'vizsga mód' : 'gyakorló mód'}</div>
      <h2>Értékelés</h2>
      {g.solved.length > 0 && (
        <div className="note bad">
          <b>Megoldás használva:</b> {g.solved.map((id) => STAGES.find((x) => x.id === id)!.name).join(', ')}. Az eredmény tájékoztató jellegű, és nem kerül be a vizsga-előrejelzésbe.
        </div>
      )}
      <h3>Hivatalos értékelőlap – {part}. vizsgarész ({part === 'III' ? 'fogyasztásmérő hely' : 'épületvillamossági szerelés'}, a projekt 40%-a)</h3>
      <table className="mat sheet">
        <tbody>
          {sheet.map((x) => (
            <tr key={x.name}>
              <td>{x.name}<div className="small muted">{x.basis}</div></td>
              <td className="qty">{Math.round(x.weight * x.ratio * 10) / 10} / {x.weight}%</td>
            </tr>
          ))}
          <tr className="sum">
            <td><b>Vizsgarész eredménye</b></td>
            <td className="qty"><b>{invalid ? 'érvénytelen' : `${pct}%`}</b></td>
          </tr>
        </tbody>
      </table>
      <div className="card">
        <b>Vizsga-előrejelzés</b> <span className="muted small">(vizsga módban beadott legutóbbi eredményeidből)</span>
        <table className="mat">
          <tbody>
            <tr><td>I. Portfólió (20%)</td><td className="qty">{rec.portfolio !== undefined ? `${rec.portfolio}% (${rec.portfolioSrc === 'hotseat' ? 'Hot Seat' : 'becslés'})` : '–'}</td></tr>
            <tr><td>II. Épületvillamosság (40%)</td><td className="qty">{rec.ii ? (rec.ii.invalid ? 'érvénytelen' : `${rec.ii.pct}%`) : '–'}</td></tr>
            <tr><td>III. Mérőhely (40%)</td><td className="qty">{rec.iii ? (rec.iii.invalid ? 'érvénytelen' : `${rec.iii.pct}%`) : '–'}</td></tr>
            <tr><td>Projektfeladat (70%)</td><td className="qty">{fc.projPct !== undefined ? `${Math.round(fc.projPct)}%` : '–'}</td></tr>
            <tr><td>Interaktív vizsga (30%)</td><td className="qty">{rec.interaktiv ? `${rec.interaktiv.pct}%` : '–'}</td></tr>
            <tr className="sum"><td><b>Szakmai vizsga</b></td><td className="qty"><b>{fc.total !== undefined ? (fc.failed ? 'sikertelen' : `${Math.round(fc.total)}% · ${fc.grade.nev} (${fc.grade.jegy})`) : '–'}</b></td></tr>
          </tbody>
        </table>
        {!fc.complete && <div className="small muted">Hiányzó részek nélkül az előrejelzés csak a meglévőkből számol. Érdemjegy: 80%-tól jeles, 60–79% jó, 50–59% közepes, 40–49% elégséges (12/2020. Korm. r. 290. §); bármely vizsgatevékenység 40% alatt vagy áramütés elleni védelmi hiba → sikertelen.</div>}
        <label className="small">Portfólió saját becslés (%) <input type="number" min={0} max={100} value={rec.portfolio ?? ''} onChange={(e) => setRec(saveRecord({ portfolio: e.target.value === '' ? undefined : Math.max(0, Math.min(100, Number(e.target.value))), portfolioSrc: 'becsles' }))} /></label>
      </div>
      <h3>Részletes pontozás</h3>
      <div className={'verdict ' + (passed ? 'good' : 'bad')}>
        <div className="big">{r.critical.length ? 'ÉRVÉNYTELEN' : passed ? 'MEGFELELT' : 'NEM FELELT MEG'}</div>
        <div>{r.total}/100 pont · {mins} perc</div>
      </div>
      {r.critical.length > 0 && (
        <ul className="findings">
          {r.critical.map((f, i) => <li key={i} className="critical">{f.msg}</li>)}
        </ul>
      )}
      <table className="mat">
        <tbody>
          {r.parts.map((p) => (
            <tr key={p.name}>
              <td>{p.name}</td>
              <td className="qty">{p.v}/{p.max}</td>
              <td className="bar"><span style={{ width: `${(100 * p.v) / p.max}%` }} /></td>
            </tr>
          ))}
        </tbody>
      </table>
      <h3>Szerelői ellenőrzés</h3>
      <ul className="findings">{r.findings.map((f, i) => <li key={i} className={f.sev}>{f.msg}</li>)}</ul>
      <h3>Munkavégzés közben</h3>
      <ul className="findings">
        {[...r.notes, ...r.extra].map((f, i) => <li key={i} className={f.sev}>{f.msg}</li>)}
        {!r.notes.length && !r.extra.length && <li className="ok">Nincs megjegyzés.</li>}
      </ul>
      <h3>Rajzfeladatok</h3>
      <p className="small">Rajzjelek: {r.rajzDetail.symOk}/{r.rajzDetail.quiz.length}{r.rajzDetail.segs.length ? ` · érszámok: ${r.rajzDetail.segOk}/${r.rajzDetail.segs.length}` : ''} · áramútrajz: {r.rajzDetail.sch.ok ? 'helyes' : r.rajzDetail.sch.msg}</p>
      <p className="muted small">A részletes pontozás gyakorlási célú bontás; a hivatalos értékelőlap a KKK {part}. vizsgarészének súlyait követi. Sikeres: ≥ 40% és nincs kritikus hiba.</p>
      <div className="row">
        <button className="primary" onClick={() => g.start(g.taskId, g.mode)}>Újra ez a feladat</button>
        <button onClick={() => g.toMenu()}>Másik feladat</button>
      </div>
    </div>
  )
}

export function StagePanel() {
  const stage = useGame((s) => s.stage)
  const C = { feladat: Feladat, anyag: Anyag, rajz: Rajz, csatorna: Csatorna, szereles: Szereles, vezetekezes: Vezetekezes, ellenorzes: Ellenorzes, ertekeles: Ertekeles }[stage]
  return <C />
}

export function ToolBelt() {
  const { belt, activeTool, setActiveTool, addLateTool, submitted } = useGame()
  const [chest, setChest] = useState(false)
  if (submitted) return null
  return (
    <div className="belt-wrap">
      {chest && (
        <div className="chest">
          <div className="small muted">Szerszámosláda – pótlólagos kivétel időbe kerül, a vizsgán levonással jár.</div>
          <div className="grid tools">
            {TOOLS.filter((t) => !belt.includes(t.id)).map((t) => (
              <button key={t.id} className="chip" onClick={() => (addLateTool(t.id), setChest(false))}>
                <span className="ico">{t.icon}</span>{t.name}
              </button>
            ))}
          </div>
        </div>
      )}
      <div className="belt">
        {belt.map((id) => {
          const t = TOOLS.find((x) => x.id === id)!
          return (
            <button key={id} className={activeTool === id ? 'on' : ''} onClick={() => setActiveTool(activeTool === id ? null : id)} title={t.name}>
              <span className="ico">{t.icon}</span>
              <span className="tn">{t.name}</span>
            </button>
          )
        })}
        <button className="chestbtn" onClick={() => setChest(!chest)} title="Szerszámosláda">
          <span className="ico">🧰</span>
          <span className="tn">Láda</span>
        </button>
      </div>
    </div>
  )
}

export function Log() {
  const log = useGame((s) => s.log)
  return (
    <div className="log">
      {log.slice(-5).map((e, i) => <div key={log.length - 5 + i} className={e.sev}>{e.msg}</div>)}
    </div>
  )
}
