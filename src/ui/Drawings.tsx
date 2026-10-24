import { useState } from 'react'
import { itemByType } from '../sim/catalog'
import { schematicUid } from '../sim/score'
import type { OneLineCircuit, Task } from '../sim/tasks'

// ---------- Installációs rajzjelek (MSZ EN 60617-11 szerinti egyszerűsítés) ----------
export type SymKind = 'egypolusu' | 'csillar' | 'valto' | 'kereszt' | 'dugalj' | 'lampa' | 'nyomogomb'
export const SYM_NAMES: Record<SymKind, string> = {
  egypolusu: 'Egypólusú kapcsoló',
  csillar: 'Csillárkapcsoló (sorozatkapcsoló)',
  valto: 'Váltókapcsoló',
  kereszt: 'Keresztkapcsoló',
  dugalj: 'Dugaszolóaljzat védőérintkezővel',
  lampa: 'Lámpa (fényforrás) kimenet',
  nyomogomb: 'Nyomógomb',
}

export function Sym({ kind, size = 64 }: { kind: SymKind; size?: number }) {
  const s = { stroke: 'currentColor', strokeWidth: 2.2, fill: 'none', strokeLinecap: 'round' as const }
  const arm = (dir: 1 | -1, ticks = 1) => {
    const x1 = 32 + dir * 4.2, y1 = 34 - dir * 4.2
    const x2 = 32 + dir * 20, y2 = 34 - dir * 20
    return (
      <g>
        <line x1={x1} y1={y1} x2={x2} y2={y2} {...s} />
        {Array.from({ length: ticks }, (_, i) => {
          const t = 1 - i * 0.22
          const bx = 32 + dir * (4.2 + 15.8 * t), by = 34 - dir * (4.2 + 15.8 * t)
          return <line key={i} x1={bx} y1={by} x2={bx + dir * 5} y2={by + dir * 5} {...s} />
        })}
      </g>
    )
  }
  const armB = (dir: 1 | -1) => {
    const x1 = 32 + dir * 4.2, y1 = 34 + dir * 4.2
    const x2 = 32 + dir * 20, y2 = 34 + dir * 20
    return (
      <g>
        <line x1={x1} y1={y1} x2={x2} y2={y2} {...s} />
        <line x1={x2} y1={y2} x2={x2 - dir * 5} y2={y2 + dir * 5} {...s} />
      </g>
    )
  }
  return (
    <svg viewBox="0 0 64 64" width={size} height={size} className="sym">
      {kind === 'lampa' && (
        <g>
          <circle cx={32} cy={32} r={14} {...s} />
          <line x1={22} y1={22} x2={42} y2={42} {...s} />
          <line x1={42} y1={22} x2={22} y2={42} {...s} />
        </g>
      )}
      {kind === 'dugalj' && (
        <g>
          <path d="M16 30 A16 16 0 0 0 48 30" {...s} />
          <line x1={16} y1={30} x2={48} y2={30} {...s} />
          <line x1={14} y1={22} x2={50} y2={22} {...s} />
          <line x1={32} y1={22} x2={32} y2={10} {...s} />
        </g>
      )}
      {kind === 'nyomogomb' && (
        <g>
          <circle cx={32} cy={32} r={12} {...s} />
          <circle cx={32} cy={32} r={4} fill="currentColor" />
        </g>
      )}
      {kind !== 'lampa' && kind !== 'dugalj' && kind !== 'nyomogomb' && <circle cx={32} cy={34} r={4} fill="currentColor" />}
      {kind === 'egypolusu' && arm(1)}
      {kind === 'csillar' && arm(1, 2)}
      {kind === 'valto' && (
        <g>
          {arm(1)}
          {arm(-1)}
        </g>
      )}
      {kind === 'kereszt' && (
        <g>
          {arm(1)}
          {arm(-1)}
          {armB(1)}
          {armB(-1)}
        </g>
      )}
    </svg>
  )
}

// ---------- Egyvonalas (bekötési) rajz a mintafeladat alapján ----------
type Seg = NonNullable<Task['segments']>[number]
export function OneLine({ segments, inputs, onInput, reveal }: { segments: Seg[]; inputs?: Record<string, string>; onInput?: (id: string, v: string) => void; reveal?: boolean }) {
  const s = { stroke: 'currentColor', strokeWidth: 1.6, fill: 'none' }
  const mcb = (x: number, name: string) => (
    <g>
      <line x1={x} y1={90} x2={x} y2={104} {...s} />
      <line x1={x} y1={104} x2={x + 9} y2={122} {...s} />
      <line x1={x - 3} y1={101} x2={x + 3} y2={107} {...s} />
      <line x1={x + 3} y1={101} x2={x - 3} y2={107} {...s} />
      <line x1={x} y1={124} x2={x} y2={150} {...s} />
      <text x={x - 34} y={118} className="svgt green">{name}</text>
    </g>
  )
  const tick = (x: number, y: number, vertical: boolean) =>
    vertical ? <line x1={x - 5} y1={y + 4} x2={x + 5} y2={y - 4} {...s} /> : <line x1={x - 3} y1={y + 6} x2={x + 3} y2={y - 6} {...s} />
  return (
    <div className="oneline">
      <svg viewBox="0 0 520 300" width="100%">
        {/* betáp, ÁVK, SPD */}
        <line x1={200} y1={4} x2={200} y2={34} {...s} />
        <line x1={200} y1={34} x2={210} y2={52} {...s} />
        <ellipse cx={203} cy={60} rx={8} ry={5} {...s} />
        <line x1={200} y1={66} x2={200} y2={90} {...s} />
        <text x={118} y={50} className="svgt green">ÁVK 40/0,03 A</text>
        <line x1={200} y1={20} x2={250} y2={20} {...s} />
        <rect x={244} y={30} width={12} height={22} {...s} />
        <line x1={250} y1={20} x2={250} y2={30} {...s} />
        <line x1={250} y1={52} x2={250} y2={66} {...s} />
        <line x1={240} y1={66} x2={260} y2={66} {...s} />
        <line x1={244} y1={70} x2={256} y2={70} {...s} />
        <text x={262} y={46} className="svgt">SPD</text>
        <line x1={80} y1={90} x2={330} y2={90} {...s} />
        {mcb(80, 'B10A')}
        {mcb(200, 'B10A')}
        {mcb(330, 'B16A')}
        <text x={58} y={84} className="svgt">1. áramkör</text>
        <text x={206} y={84} className="svgt">2. áramkör</text>
        <text x={288} y={84} className="svgt">3. áramkör</text>
        {/* 1. kör */}
        <line x1={80} y1={150} x2={80} y2={200} {...s} />
        <circle cx={80} cy={200} r={2.5} fill="currentColor" />
        <line x1={80} y1={200} x2={40} y2={200} {...s} />
        <g transform="translate(8 168) scale(0.5)">
          <Sym kind="egypolusu" />
        </g>
        <line x1={80} y1={200} x2={80} y2={258} {...s} />
        <g transform="translate(64 254) scale(0.5)">
          <Sym kind="lampa" />
        </g>
        <text x={98} y={292} className="svgt">Lámpa 1 (m)</text>
        {tick(80, 170, true)}
        {tick(58, 200, false)}
        {tick(80, 232, true)}
        {/* 2. kör */}
        <line x1={200} y1={150} x2={200} y2={200} {...s} />
        <line x1={200} y1={200} x2={470} y2={200} {...s} />
        {[
          [240, 'valto'],
          [310, 'kereszt'],
          [390, 'valto'],
        ].map(([x, k]) => (
          <g key={x as number}>
            <circle cx={x as number} cy={200} r={2.5} fill="currentColor" />
            <line x1={x as number} y1={200} x2={x as number} y2={228} {...s} />
            <g transform={`translate(${(x as number) - 16} 222) scale(0.5)`}>
              <Sym kind={k as 'valto'} />
            </g>
          </g>
        ))}
        <g transform="translate(454 184) scale(0.5)">
          <Sym kind="lampa" />
        </g>
        <text x={448} y={234} className="svgt">Lámpa 2</text>
        {tick(200, 172, true)}
        {tick(275, 200, false)}
        {tick(355, 200, false)}
        {tick(432, 200, false)}
        {/* 3. kör */}
        <line x1={330} y1={150} x2={330} y2={160} {...s} />
        <g transform="translate(314 154) scale(0.5)">
          <Sym kind="dugalj" />
        </g>
        <text x={350} y={180} className="svgt">1× 2P+F</text>
        {tick(330, 140, true)}
        {segments.map((g) =>
          inputs ? (
            <foreignObject key={g.id} x={g.x - 2} y={g.y - 22} width={34} height={22}>
              <input
                className={'seg-in' + (reveal ? (Number(inputs[g.id]) === g.answer ? ' good' : ' bad') : '')}
                value={reveal && Number(inputs[g.id]) !== g.answer ? `${g.answer}` : inputs[g.id] ?? ''}
                onChange={(e) => onInput?.(g.id, e.target.value.replace(/\D/g, '').slice(0, 1))}
                disabled={reveal}
                title={g.label}
              />
            </foreignObject>
          ) : (
            <text key={g.id} x={g.x + 6} y={g.y - 6} className="svgt">{g.answer}</text>
          ),
        )}
      </svg>
    </div>
  )
}

// ---------- Általános egyvonalas rajz (áramkörönként egy sor) ----------
export function OneLineGeneric({ circuits }: { circuits: OneLineCircuit[] }) {
  const s = { stroke: 'currentColor', strokeWidth: 1.6, fill: 'none' }
  const rowH = 74
  const h = 70 + circuits.length * rowH
  return (
    <div className="oneline">
      <svg viewBox={`0 0 520 ${h}`} width="100%">
        <line x1={40} y1={6} x2={40} y2={30} {...s} />
        <line x1={40} y1={30} x2={50} y2={46} {...s} />
        <ellipse cx={43} cy={54} rx={8} ry={5} {...s} />
        <text x={60} y={50} className="svgt green">ÁVK 40/0,03 A</text>
        <rect x={160} y={18} width={12} height={22} {...s} />
        <line x1={40} y1={12} x2={166} y2={12} {...s} />
        <line x1={166} y1={12} x2={166} y2={18} {...s} />
        <text x={178} y={34} className="svgt">SPD</text>
        <line x1={40} y1={60} x2={40} y2={60 + (circuits.length - 1) * rowH + 30} {...s} />
        {circuits.map((c, i) => {
          const y = 90 + i * rowH
          return (
            <g key={i}>
              <line x1={40} y1={y} x2={64} y2={y} {...s} />
              <line x1={64} y1={y} x2={80} y2={y - 9} {...s} />
              <line x1={66} y1={y - 3} x2={72} y2={y + 3} {...s} />
              <line x1={72} y1={y - 3} x2={66} y2={y + 3} {...s} />
              <line x1={82} y1={y} x2={500} y2={y} {...s} />
              <text x={62} y={y - 16} className="svgt green">{c.mcb}</text>
              <text x={62} y={y + 22} className="svgt">{c.title}</text>
              {c.chain.map((e, k) => {
                const x = 170 + k * 120
                return (
                  <g key={k}>
                    <rect x={x - 22} y={y - 22} width={44} height={44} fill="#f4f1e8" stroke="none" />
                    {e.sym.startsWith('box:') ? (
                      <g>
                        <rect x={x - 16} y={y - 14} width={32} height={28} {...s} />
                        <text x={x} y={y + 4} className="svgt" textAnchor="middle">{e.sym.slice(4)}</text>
                      </g>
                    ) : (
                      <g transform={`translate(${x - 16} ${y - 16}) scale(0.5)`}>
                        <Sym kind={e.sym as SymKind} />
                      </g>
                    )}
                    <text x={x} y={y + 34} className="svgt small" textAnchor="middle">{e.label}</text>
                  </g>
                )
              })}
            </g>
          )
        })}
      </svg>
    </div>
  )
}

// ---------- Áramútrajz kiegészítése (feladatonként) ----------
interface PT { id: string; x: number; y: number; label: string }
const SHORT: Record<string, string> = { mcbB32: 'F0 B32', meter1f: 'P1 mérő (kWh)', timer: 'LA automata', ir: 'IR relé' }
function schematicLayout(task: Task) {
  // TN-C-S mérőhelynél a forrás a szétválasztott N-kapocs és PE-sín (a PEN már a PE-sínen van)
  const tncs = task.supply === 'tncs'
  const pts: PT[] = [
    { id: 'bet.L', x: 30, y: 30, label: 'L' },
    { id: tncs ? 'Nk.0' : 'bet.N', x: 30, y: 60, label: 'N' },
    { id: tncs ? 'PEs.0' : 'bet.PE', x: 30, y: 90, label: 'PE' },
  ]
  const boxes: { x: number; y: number; w: number; h: number; name: string; round?: boolean }[] = []
  let x = 90
  const devs = [
    ...task.schematic.din.map((t) => ({ id: schematicUid(t), def: itemByType[t], name: SHORT[t] ?? itemByType[t].name.split(' ')[0], lamp: false })),
    ...task.schematic.mounts.map((id) => {
      const m = task.layout.mounts.find((q) => q.id === id)!
      return { id, def: itemByType[m.expect], name: `${id}`, lamp: m.kind === 'lamp' }
    }),
  ]
  for (const d of devs) {
    const n = d.def.terms.length
    const w = Math.max(54, n * 22 + 10)
    if (d.lamp) {
      boxes.push({ x: x + w / 2, y: 128, w: 18, h: 18, name: d.name, round: true })
      d.def.terms.forEach((t, i) => pts.push({ id: `${d.id}.${t.id}`, x: x + 16 + i * 22, y: 168, label: t.label }))
    } else {
      boxes.push({ x, y: 150, w, h: 60, name: d.name })
      // a rajzon a rövid kapocsjel elég (pl. 1, 3, 4, 6 a mérőn)
      d.def.terms.forEach((t, i) => pts.push({ id: `${d.id}.${t.id}`, x: x + 16 + i * 22, y: 150, label: t.label.length > 4 ? t.id : t.label }))
    }
    x += w + 18
  }
  return { pts, boxes, width: Math.max(520, x + 10) }
}

export function Pathway({ task, links, setLinks, locked }: { task: Task; links: [string, string][]; setLinks: (l: [string, string][]) => void; locked?: boolean }) {
  const [pend, setPend] = useState<string | null>(null)
  const { pts, boxes, width } = schematicLayout(task)
  const pos = Object.fromEntries(pts.map((t) => [t.id, t]))
  const click = (id: string) => {
    if (locked) return
    if (!pend) return setPend(id)
    if (pend !== id) setLinks([...links, [pend, id]])
    setPend(null)
  }
  const col = (a: string, b: string) => ([a, b].some((x) => x.endsWith('PE')) ? '#2f9e44' : [a, b].some((x) => x.endsWith('.N') || x.endsWith('.A2')) ? '#1f5fd6' : '#8a4b22')
  return (
    <svg viewBox={`0 0 ${width} 240`} width="100%" className="pathway">
      <text x={50} y={34} className="svgt">{task.supply === 'tncs' ? 'L (méretlen fővezeték)' : 'L (kismegszakító után)'}</text>
      <text x={50} y={64} className="svgt">N</text>
      <text x={50} y={94} className="svgt">PE</text>
      {boxes.map((b, i) =>
        b.round ? (
          <g key={i}>
            <circle cx={b.x} cy={b.y} r={18} className="devbox" />
            <line x1={b.x - 13} y1={b.y - 13} x2={b.x + 13} y2={b.y + 13} stroke="currentColor" />
            <line x1={b.x + 13} y1={b.y - 13} x2={b.x - 13} y2={b.y + 13} stroke="currentColor" />
            <text x={b.x - 10} y={b.y - 24} className="svgt">{b.name}</text>
          </g>
        ) : (
          <g key={i}>
            <rect x={b.x} y={b.y} width={b.w} height={b.h} rx={6} className="devbox" />
            {/* a név a dobozban, két sorban, hogy a szomszédos dobozok felirata ne érjen össze */}
            <text x={b.x + b.w / 2} y={b.y + 30} className="svgt" textAnchor="middle">
              <tspan>{b.name.split(' ')[0]}</tspan>
              <tspan x={b.x + b.w / 2} dy={13} className="small">{b.name.split(' ').slice(1).join(' ')}</tspan>
            </text>
          </g>
        ),
      )}
      {links.map(([a, b], i) =>
        pos[a] && pos[b] ? (
          <line key={i} x1={pos[a].x} y1={pos[a].y} x2={pos[b].x} y2={pos[b].y} stroke={col(a, b)} strokeWidth={2.4}
            onClick={() => !locked && setLinks(links.filter((_, j) => j !== i))} style={{ cursor: locked ? 'default' : 'pointer' }} />
        ) : null,
      )}
      {pts.map((t) => (
        <g key={t.id} onClick={() => click(t.id)} style={{ cursor: 'pointer' }}>
          <circle cx={t.x} cy={t.y} r={6} className={'pt' + (pend === t.id ? ' pend' : '')} />
          <text x={t.x + 7} y={t.y - 7} className="svgt small">{t.label}</text>
        </g>
      ))}
    </svg>
  )
}

// ---------- Kapcsolási (áramúti) rajzjelek a Gyakorlóterem rajzjel-feladatához ----------
export type SchemKind = 'kismegszakito' | 'avk' | 'spd' | 'mero' | 'motor' | 'tekercs' | 'hore' | 'nyomoNo' | 'nyomoNc' | 'idorele' | 'trafo' | 'foldeles' | 'biztosito' | 'zaro' | 'bonto'
export const SCHEM_NAMES: Record<SchemKind, string> = {
  kismegszakito: 'Kismegszakító',
  avk: 'Áram-védőkapcsoló (ÁVK)',
  spd: 'Túlfeszültség-levezető',
  mero: 'Fogyasztásmérő (kWh)',
  motor: 'Háromfázisú motor',
  tekercs: 'Mágneskapcsoló / relé tekercse',
  hore: 'Hőrelé (túlterhelés-védelem) fűtőeleme',
  nyomoNo: 'Nyomógomb, záró (START)',
  nyomoNc: 'Nyomógomb, bontó (STOP)',
  idorele: 'Időrelé tekercse (késleltetett)',
  trafo: 'Transzformátor',
  foldeles: 'Földelés',
  biztosito: 'Olvadóbiztosító',
  zaro: 'Záró érintkező (segédzáró)',
  bonto: 'Bontó érintkező (segédbontó)',
}

export function SchemSym({ kind, size = 64 }: { kind: SchemKind; size?: number }) {
  const s = { stroke: 'currentColor', strokeWidth: 2.2, fill: 'none', strokeLinecap: 'round' as const }
  const contact = (closed: boolean) => (
    <g>
      <line x1={32} y1={6} x2={32} y2={22} {...s} />
      <line x1={32} y1={42} x2={32} y2={58} {...s} />
      {closed ? (
        <g><line x1={32} y1={42} x2={44} y2={20} {...s} /><line x1={32} y1={22} x2={46} y2={22} {...s} /></g>
      ) : (
        <line x1={32} y1={42} x2={20} y2={22} {...s} />
      )}
    </g>
  )
  const push = <g><line x1={4} y1={32} x2={24} y2={32} {...s} strokeDasharray="3 3" /><line x1={4} y1={26} x2={4} y2={38} {...s} /></g>
  return (
    <svg viewBox="0 0 64 64" width={size} height={size} className="sym">
      {kind === 'zaro' && contact(false)}
      {kind === 'bonto' && contact(true)}
      {kind === 'nyomoNo' && <g>{contact(false)}{push}</g>}
      {kind === 'nyomoNc' && <g>{contact(true)}{push}</g>}
      {(kind === 'kismegszakito' || kind === 'avk') && (
        <g>
          {contact(false)}
          <line x1={28} y1={18} x2={36} y2={26} {...s} /><line x1={36} y1={18} x2={28} y2={26} {...s} />
          {kind === 'avk' && <ellipse cx={32} cy={50} rx={10} ry={5} {...s} />}
        </g>
      )}
      {kind === 'spd' && (
        <g>
          <rect x={24} y={14} width={16} height={28} {...s} />
          <path d="M34 18 L29 28 L35 28 L30 38" {...s} />
          <line x1={32} y1={4} x2={32} y2={14} {...s} /><line x1={32} y1={42} x2={32} y2={52} {...s} />
          <line x1={22} y1={52} x2={42} y2={52} {...s} /><line x1={26} y1={56} x2={38} y2={56} {...s} /><line x1={30} y1={60} x2={34} y2={60} {...s} />
        </g>
      )}
      {kind === 'mero' && <g><rect x={10} y={16} width={44} height={32} {...s} /><text x={32} y={37} textAnchor="middle" fontSize={13} fill="currentColor">kWh</text></g>}
      {kind === 'motor' && <g><circle cx={32} cy={32} r={20} {...s} /><text x={32} y={31} textAnchor="middle" fontSize={14} fill="currentColor">M</text><text x={32} y={45} textAnchor="middle" fontSize={11} fill="currentColor">3~</text></g>}
      {kind === 'tekercs' && <g><rect x={18} y={20} width={28} height={24} {...s} /><line x1={32} y1={6} x2={32} y2={20} {...s} /><line x1={32} y1={44} x2={32} y2={58} {...s} /></g>}
      {kind === 'idorele' && <g><rect x={18} y={20} width={28} height={24} {...s} /><rect x={18} y={20} width={9} height={24} fill="currentColor" /><line x1={32} y1={6} x2={32} y2={20} {...s} /><line x1={32} y1={44} x2={32} y2={58} {...s} /></g>}
      {kind === 'hore' && <g><rect x={18} y={16} width={28} height={32} {...s} /><path d="M32 6 V22 H40 V42 H32 V58" {...s} /></g>}
      {kind === 'trafo' && <g><circle cx={32} cy={23} r={13} {...s} /><circle cx={32} cy={41} r={13} {...s} /></g>}
      {kind === 'foldeles' && <g><line x1={32} y1={8} x2={32} y2={34} {...s} /><line x1={16} y1={34} x2={48} y2={34} {...s} /><line x1={21} y1={42} x2={43} y2={42} {...s} /><line x1={27} y1={50} x2={37} y2={50} {...s} /></g>}
      {kind === 'biztosito' && <g><rect x={24} y={14} width={16} height={36} {...s} /><line x1={32} y1={4} x2={32} y2={60} {...s} /></g>}
    </svg>
  )
}
