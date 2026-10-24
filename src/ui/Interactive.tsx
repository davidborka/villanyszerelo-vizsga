import { useEffect, useMemo, useState } from 'react'
import { drawExam, EXAM_MINUTES, isCorrect, scoreExam, TOPICS, type Answer } from '../sim/interaktiv'
import { addSeen, loadSeen, saveRecord } from '../sim/progress'
import { ConfirmButton } from './ConfirmButton'
import type { Mode } from '../sim/store'

const TOPIC_NAME = Object.fromEntries(TOPICS.map((t) => [t.id, t.name]))

/** Központi interaktív vizsga: 90 perc, 4 témakör, a KKK súlyai szerint */
export function Interactive({ mode, onExit, onRestart }: { mode: Mode; onExit: () => void; onRestart: () => void }) {
  // új feladatsor: előbb a még nem látott bankkérdések, a számításoknál friss számok
  const items = useMemo(() => drawExam(Math.random, loadSeen()), [])
  const [answers, setAnswers] = useState<Record<string, Answer>>({})
  const [i, setI] = useState(0)
  const [flags, setFlags] = useState<Record<string, boolean>>({})
  const [shown, setShown] = useState<Record<string, boolean>>({})
  const [done, setDone] = useState(false)
  const [started] = useState(() => Date.now())
  const [now, setNow] = useState(() => Date.now())
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(t)
  }, [])
  const left = Math.max(0, EXAM_MINUTES * 60 - Math.floor((now - started) / 1000))
  const result = useMemo(() => (done ? scoreExam(items, answers) : null), [done, items, answers])
  const finish = () => {
    setDone(true)
    addSeen(items.map((x) => x.q.id))
    if (mode === 'vizsga') saveRecord({ interaktiv: { pct: scoreExam(items, answers).pct, at: Date.now() } })
  }
  useEffect(() => {
    if (left === 0 && !done) finish()
  })

  const it = items[i]
  const q = it.q
  const a = answers[q.id]
  const set = (v: Answer) => !done && setAnswers({ ...answers, [q.id]: v })
  const reveal = done || (mode === 'gyakorlo' && shown[q.id])
  // sorba rendezésnél a válasz az eredeti indexek aktuális sorrendje
  const order = (Array.isArray(a) && q.kind === 'order' ? a : it.optOrder) as number[]
  const move = (k: number, d: number) => {
    const o = [...order]
    const j = k + d
    if (j < 0 || j >= o.length) return
    ;[o[k], o[j]] = [o[j], o[k]]
    set(o)
  }

  return (
    <div className="quiz">
      <header>
        <button className="brand" onClick={onExit}>⚡ Interaktív vizsga</button>
        <span className={'modetag ' + mode}>{mode === 'vizsga' ? 'VIZSGA' : 'GYAKORLÓ'}</span>
        <span className="muted small">{items.length} feladat · 4 témakör · a KKK súlyai szerint</span>
        <span style={{ flex: 1 }} />
        <span className={'timer' + (left < 600 ? ' low' : '')}>⏱ {Math.floor(left / 60)}:{String(left % 60).padStart(2, '0')}</span>
        {done ? <button onClick={onRestart}>Új feladatsor</button> : (
          <ConfirmButton confirm="Új feladatsor? A válaszok elvesznek" onConfirm={onRestart}>Újrakeverés</ConfirmButton>
        )}
        {!done && <button className="submit" onClick={finish}>Beadás</button>}
      </header>
      <div className="quiz-body">
        <nav className="qnav">
          {TOPICS.map((t) => (
            <div key={t.id}>
              <div className="small muted">{t.name} · {t.weight}%</div>
              <div className="qgrid">
                {items.map((x, k) =>
                  x.q.topic !== t.id ? null : (
                    <button
                      key={x.q.id}
                      className={
                        (k === i ? 'cur ' : '') +
                        (answers[x.q.id] !== undefined ? 'ans ' : '') +
                        (flags[x.q.id] ? 'flag ' : '') +
                        (done ? (isCorrect(x.q, answers[x.q.id]) ? 'good' : 'bad') : '')
                      }
                      onClick={() => setI(k)}
                    >
                      {k + 1}
                    </button>
                  ),
                )}
              </div>
            </div>
          ))}
        </nav>
        <section className="qcard">
          {result && (
            <div className={'verdict ' + (result.passed ? 'good' : 'bad')}>
              <div className="big">{result.pct}%</div>
              <div>{result.passed ? 'Sikeres (≥ 40%)' : 'Sikertelen (< 40%)'}</div>
              <table className="mat">
                <tbody>
                  {result.topics.map((t) => (
                    <tr key={t.id}>
                      <td>{t.name}</td>
                      <td className="qty">{t.got}/{t.max} pont</td>
                      <td className="qty">{Math.round(t.weight * t.ratio)}/{t.weight}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div className="row">
                <button className="primary" onClick={onRestart}>Új feladatsor (új kérdések)</button>
                <button onClick={onExit}>Vissza a főmenübe</button>
              </div>
            </div>
          )}
          <div className="kicker">{i + 1}. feladat · {TOPIC_NAME[q.topic]} · {q.points} pont</div>
          <h2 className="qtext">{q.q}</h2>
          {q.kind === 'single' && (
            <div className="opts">
              {it.optOrder.map((o) => (
                <button key={o} className={'opt' + (a === o ? ' on' : '') + (reveal ? (o === q.answer ? ' right' : a === o ? ' wrong' : '') : '')} onClick={() => set(o)}>
                  {q.options![o]}
                </button>
              ))}
            </div>
          )}
          {q.kind === 'multi' && (
            <div className="opts">
              <div className="small muted">Több helyes válasz is lehet.</div>
              {it.optOrder.map((o) => {
                const sel = Array.isArray(a) && a.includes(o)
                const right = (q.answer as number[]).includes(o)
                return (
                  <button key={o} className={'opt' + (sel ? ' on' : '') + (reveal ? (right ? ' right' : sel ? ' wrong' : '') : '')}
                    onClick={() => set(sel ? (a as number[]).filter((x) => x !== o) : [...((a as number[]) ?? []), o])}>
                    {sel ? '☑ ' : '☐ '}{q.options![o]}
                  </button>
                )
              })}
            </div>
          )}
          {q.kind === 'order' && (
            <div className="opts">
              <div className="small muted">Állítsd helyes sorrendbe a nyilakkal.</div>
              {order.map((o, k) => (
                <div key={o} className={'opt ord' + (reveal ? (o === k ? ' right' : ' wrong') : '')}>
                  <b>{k + 1}.</b> <span>{q.options![o]}</span>
                  <span className="ordbtns">
                    <button onClick={() => move(k, -1)} disabled={done}>▲</button>
                    <button onClick={() => move(k, 1)} disabled={done}>▼</button>
                  </span>
                </div>
              ))}
            </div>
          )}
          {q.kind === 'number' && (
            <div className="row">
              <label>
                Eredmény {q.unit ? `(${q.unit})` : ''}
                <input value={(a as string) ?? ''} onChange={(e) => set(e.target.value)} disabled={done} inputMode="decimal" />
              </label>
              {reveal && <span className="reading">{q.value} {q.unit}</span>}
            </div>
          )}
          {reveal && (
            <div className={'note ' + (isCorrect(q, a) ? 'good' : 'bad')}>
              <b>{isCorrect(q, a) ? 'Helyes.' : 'Nem helyes.'}</b> <span className="steps">{q.explain}</span>
              {q.source && <div className="small muted">Forrás: {q.source}</div>}
            </div>
          )}
          <div className="row">
            <button onClick={() => setI(Math.max(0, i - 1))} disabled={i === 0}>← Előző</button>
            {!done && <button onClick={() => setFlags({ ...flags, [q.id]: !flags[q.id] })}>{flags[q.id] ? 'Jelölés le' : '⚑ Megjelölöm'}</button>}
            {mode === 'gyakorlo' && !done && <button onClick={() => setShown({ ...shown, [q.id]: true })}>Ellenőrzés</button>}
            <button className="primary" onClick={() => setI(Math.min(items.length - 1, i + 1))} disabled={i === items.length - 1}>Következő →</button>
          </div>
        </section>
      </div>
    </div>
  )
}
