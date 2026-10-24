import { Canvas } from '@react-three/fiber'
import { useEffect, useState } from 'react'
import * as THREE from 'three'
import { Scene } from './scene/Scene'
import { isMuted, startSfx, toggleMuted } from './scene/sfx'
import { STAGES, useGame, type Mode } from './sim/store'
import { TASK_LIST, TASKS } from './sim/tasks'
import { forecast } from './sim/score'
import { HOTSEAT_AVAILABLE, loadRecord, loadSeen, resetProgress } from './sim/progress'
import { QUESTIONS } from './sim/questions'
import { ConfirmButton } from './ui/ConfirmButton'
import { HotSeat } from './ui/HotSeat'
import { Practice } from './ui/Practice'
import { Interactive } from './ui/Interactive'
import { Log, StagePanel, TaskSheetContent, ToolBelt } from './ui/Panels'

function Timer() {
  const startedAt = useGame((s) => s.startedAt)
  const [now, setNow] = useState(() => Date.now())
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(t)
  }, [])
  const s = Math.floor((now - startedAt) / 1000)
  return <span className="timer">⏱ {Math.floor(s / 60)}:{String(s % 60).padStart(2, '0')} <span className="muted">/ 300:00</span></span>
}

function Forecast() {
  const [, bump] = useState(0)
  const rec = loadRecord()
  const seen = loadSeen().size
  const fc = forecast(rec)
  const row = (name: string, v: string) => (
    <div className="fc-row"><span>{name}</span><b>{v}</b></div>
  )
  return (
    <div className="forecast">
      <div className="kicker">Vizsga-előrejelzés</div>
      {row('I. Portfólió · 20%', rec.portfolio !== undefined ? `${rec.portfolio}%${rec.portfolioSrc === 'hotseat' ? ' (Hot Seat)' : ' (becslés)'}` : '–')}
      {row('II. Épületvillamosság · 40%', rec.ii ? (rec.ii.invalid ? 'érvénytelen' : `${rec.ii.pct}%`) : '–')}
      {row('III. Mérőhely · 40%', rec.iii ? (rec.iii.invalid ? 'érvénytelen' : `${rec.iii.pct}%`) : '–')}
      {row('Projektfeladat · 70%', fc.projPct !== undefined ? `${Math.round(fc.projPct)}%` : '–')}
      {row('Interaktív vizsga · 30%', rec.interaktiv ? `${rec.interaktiv.pct}%` : '–')}
      <div className={'fc-total ' + (fc.total === undefined ? '' : fc.failed ? 'bad' : 'good')}>
        <span>Szakmai vizsga</span>
        <b>{fc.total === undefined ? 'még nincs eredmény' : fc.failed ? 'sikertelen' : `${Math.round(fc.total)}% · ${fc.grade.nev} (${fc.grade.jegy})`}</b>
      </div>
      <div className="small muted">{fc.complete ? 'Mind a négy részből van eredményed.' : 'Vizsga módban beadott eredményekből számol; ami hiányzik, azt nem találja ki.'}</div>
      <div className="small muted fc-seen">Interaktív vizsgán látott kérdések: {seen} / {QUESTIONS.length}</div>
      <div className="row wrap">
        <ConfirmButton onConfirm={() => (resetProgress({ record: true }), bump((x) => x + 1))}>Eredmények törlése</ConfirmButton>
        <ConfirmButton onConfirm={() => (resetProgress({ seen: true }), bump((x) => x + 1))}>Kérdések újrakezdése</ConfirmButton>
      </div>
    </div>
  )
}

function Start() {
  const start = useGame((s) => s.start)
  const openQuiz = useGame((s) => s.openQuiz)
  const openHotSeat = useGame((s) => s.openHotSeat)
  const openPractice = useGame((s) => s.openPractice)
  const [mode, setMode] = useState<Mode>('vizsga')
  return (
    <div className="start">
      <div className="start-inner">
        <div className="kicker">4 0713 04 07 · Villanyszerelő · Épületvillamosság</div>
        <h1>Gyakorlati vizsga-szimulátor</h1>
        <p className="muted">Szerelőfal, valós vizsgafeladatok. Mérsz, vágsz, szerelsz, bekötsz, mérsz – és hibázhatsz is, mint a vizsgán.</p>
        <div className="modes">
          <button className={mode === 'vizsga' ? 'on' : ''} onClick={() => setMode('vizsga')}>
            <b>Vizsga mód</b>
            <span>Nincs segítség, nincs azonnali visszajelzés. Szabad sorrend, a hibák a beadás után derülnek ki.</span>
          </button>
          <button className={mode === 'gyakorlo' ? 'on' : ''} onClick={() => setMode('gyakorlo')}>
            <b>Gyakorló mód</b>
            <span>Tippek, azonnali visszajelzés minden lépésnél, ellenőrizhető rajzfeladatok.</span>
          </button>
        </div>
        <div className="start-grid">
          <div>
            <h3 className="section">Projektfeladat · II. vizsgarész – épületvillamossági szerelés</h3>
            <div className="tasks">
              {TASK_LIST.filter((t) => (t.part ?? 'II') === 'II').map((t, i) => (
                <button key={t.id} className="taskcard" onClick={() => start(t.id, mode)}>
                  <span className="num">{String(i + 1).padStart(2, '0')}</span>
                  <b>{t.title}</b>
                  <span className="muted small">{t.short}</span>
                </button>
              ))}
            </div>
            <h3 className="section">III. vizsgarész · I. portfólió · interaktív vizsga</h3>
            <div className="tasks">
              {TASK_LIST.filter((t) => t.part === 'III').map((t) => (
                <button key={t.id} className="taskcard" onClick={() => start(t.id, mode)}>
                  <span className="num">III</span>
                  <b>{t.title}</b>
                  <span className="muted small">{t.short}</span>
                </button>
              ))}
              {HOTSEAT_AVAILABLE ? (
                <button className="taskcard" onClick={openHotSeat}>
                  <span className="num">I</span>
                  <b>Portfólióvédés (Hot Seat)</b>
                  <span className="muted small">10 perces bemutatás, kérdések az AI-vizsgabizottságtól. Az eredmény bekerül az előrejelzésbe.</span>
                </button>
              ) : (
                <>
                <button className="taskcard" disabled title="A Hot Seat AI-zsűrije helyi LLM-et hív, a megosztott oldalon nem érhető el">
                  <span className="num">I</span>
                  <b>Portfólióvédés (Hot Seat) – kikapcsolva</b>
                  <span className="muted small">Az AI-zsűris védés helyi LLM-et igényel, ezért itt nem érhető el. Gyakorolni a mellette lévő kártyával lehet.</span>
                </button>
                <button className="taskcard" onClick={() => openPractice('portfolio')}>
                  <span className="num">I</span>
                  <b>Portfólióvédés</b>
                  <span className="muted small">Bizottsági kérdések, önértékelés a KKK szempontjai szerint, eredmény az előrejelzésbe. LLM nélkül.</span>
                </button>
                </>
              )}
              <button className="taskcard" onClick={() => openPractice()}>
                <span className="num">✎</span>
                <b>Gyakorlóterem</b>
                <span className="muted small">Végtelen számolás lépésenkénti megoldással, áramútrajzok, motorvezérlés-rajzkiegészítés, rajzjelek, portfólióvédés LLM nélkül.</span>
              </button>
              <a className="taskcard" href="./tanulas/" target="_blank" rel="noreferrer">
                <span className="num">📚</span>
                <b>Tanulási útmutató</b>
                <span className="muted small">Mai terv, 15 modul hangleckékkel és infografikákkal, NotebookLM kvíz és tanulókártyák.</span>
              </a>
              <button className="taskcard" onClick={() => openQuiz(mode)}>
                <span className="num">90'</span>
                <b>Interaktív vizsga</b>
                <span className="muted small">40 feladat, 4 témakör (20/20/20/40%), {QUESTIONS.length} kérdéses bankból + generált számolós feladatok.</span>
              </button>
            </div>
          </div>
          <Forecast />
        </div>
      </div>
    </div>
  )
}

export default function App() {
  const screen = useGame((s) => s.screen)
  const stage = useGame((s) => s.stage)
  const taskId = useGame((s) => s.taskId)
  const mode = useGame((s) => s.mode)
  const submitted = useGame((s) => s.submitted)
  const activeTool = useGame((s) => s.activeTool)
  const setStage = useGame((s) => s.setStage)
  const submit = useGame((s) => s.submit)
  const toMenu = useGame((s) => s.toMenu)
  const start = useGame((s) => s.start)
  const solve = useGame((s) => s.solve)
  const [quizKey, setQuizKey] = useState(0)
  const [sheet, setSheet] = useState(false)
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setSheet(false)
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])
  const [muted, setMuted] = useState(isMuted)
  useEffect(startSfx, [])
  if (screen === 'start') return <Start />
  if (screen === 'quiz') return <Interactive key={quizKey} mode={mode} onExit={toMenu} onRestart={() => setQuizKey((k) => k + 1)} />
  if (screen === 'hotseat') return <HotSeat onExit={toMenu} />
  if (screen === 'gyakorlo') return <Practice onExit={toMenu} />
  const idx = STAGES.findIndex((s) => s.id === stage)
  return (
    <div className="app">
      <header>
        <button className="brand" onClick={toMenu} title="Főmenü">⚡ {TASKS[taskId].title}</button>
        <span className={'modetag ' + mode}>{mode === 'vizsga' ? 'VIZSGA' : 'GYAKORLÓ'}</span>
        <nav>
          {STAGES.map((s, i) => (
            <button key={s.id} className={i === idx ? 'cur' : ''} disabled={submitted && s.id !== 'ertekeles'} onClick={() => setStage(s.id)}>
              {i + 1}. {s.name}
            </button>
          ))}
        </nav>
        <button className="mute" onClick={() => setMuted(toggleMuted())} title={muted ? 'Hang bekapcsolása' : 'Hang némítása'} aria-label={muted ? 'Hang bekapcsolása' : 'Hang némítása'} aria-pressed={muted}>
          {muted ? '🔇' : '🔊'}
        </button>
        <button className={'sheetbtn' + (sheet ? ' on' : '')} onClick={() => setSheet(!sheet)} title="A kiadott feladatlap és rajz (Esc: bezár)">📄 Feladatlap</button>
        <Timer />
        {!submitted && stage !== 'feladat' && (
          <ConfirmButton confirm="Biztos? A szakasz megoldódik" onConfirm={solve}>💡 Megoldás</ConfirmButton>
        )}
        <ConfirmButton confirm="Újrakezded? Minden elvész" onConfirm={() => start(taskId, mode)}>↺ Újrakezdés</ConfirmButton>
        {!submitted && <button className="submit" onClick={submit}>Beadás</button>}
      </header>
      <aside>
        <StagePanel />
      </aside>
      <main className={activeTool ? `tool-${activeTool}` : ''}>
        <Canvas
          shadows
          dpr={[1, 1.5]}
          gl={{ antialias: false, powerPreference: 'high-performance', toneMapping: THREE.ACESFilmicToneMapping }}
          camera={{ position: [0.75, 0.55, 1.45], fov: 45, near: 0.01, far: 20 }}
          onCreated={({ gl, scene }) => {
            if (import.meta.env.DEV) (window as unknown as { __sceneStats: () => { triangles: number; dpr: number } }).__sceneStats = () => {
              let triangles = 0
              scene.traverse((object) => {
                if (!(object instanceof THREE.Mesh)) return
                const geometry = object.geometry
                triangles += (geometry.index?.count ?? geometry.attributes.position.count) / 3
              })
              return { triangles, dpr: gl.getPixelRatio() }
            }
          }}
        >
          <Scene />
        </Canvas>
        <Log />
        <ToolBelt />
        {sheet && (
          <div className="sheet-drawer" role="dialog" aria-label="Feladatlap">
            <div className="sheet-tools">
              <button onClick={() => print()}>Nyomtatás</button>
              <button onClick={() => setSheet(false)} aria-label="Bezárás">✕</button>
            </div>
            <TaskSheetContent />
          </div>
        )}
      </main>
    </div>
  )
}
