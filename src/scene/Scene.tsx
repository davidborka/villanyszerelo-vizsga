import { Html, Lightformer, Environment } from '@react-three/drei'
import { useMemo, useRef, useState } from 'react'
import * as THREE from 'three'
import { Selection } from '@react-three/postprocessing'
import { type ThreeEvent } from '@react-three/fiber'
import { itemByType, colorHex, WIRE_COLORS, type ItemType } from '../sim/catalog'
import { BAR_TERMS, fixedTerms, simulate, type Wire } from '../sim/circuit'
import {
  BOARD, BOX_SIZE, CAB, DIST, DIN_X0, DIN_Y, LAMP_R, MODULE_W, routePath, snapPoints,
  type Layout, type TrunkPiece, type Vec2,
} from '../sim/layout'
import { useGame } from '../sim/store'
import { TASKS } from '../sim/tasks'
import { Control } from './models/Control'
import { Meter } from './models/Meter'

const useLayout = () => useGame((s) => TASKS[s.taskId].layout)
import { Mcb } from './models/Mcb'
import { Rcd } from './models/Rcd'
import { Spd } from './models/Spd'
import { SurfaceBox } from './models/SurfaceBox'
import { SwitchRocker } from './models/SwitchRocker'
import { Socket2PF } from './models/Socket2PF'
import { LampFitting } from './models/LampFitting'
import { MotionSensor } from './models/MotionSensor'
import { DistBox } from './models/DistBox'
import { TrunkingProfile } from './models/TrunkingProfile'
import { Label } from './models/shared'
import { Rendering } from './Rendering'
import { Workshop } from './Workshop'
import { BoardCamera } from './BoardCamera'
import { useHover } from './models/useHover'

// ---------- segédek ----------
function plywood() {
  const c = document.createElement('canvas')
  c.width = 1024
  c.height = 768
  const g = c.getContext('2d')!
  g.fillStyle = '#d9b98a'
  g.fillRect(0, 0, 1024, 768)
  for (let i = 0; i < 260; i++) {
    const y = Math.random() * 768
    g.strokeStyle = `rgba(${120 + Math.random() * 40},${80 + Math.random() * 30},40,${0.05 + Math.random() * 0.12})`
    g.lineWidth = 1 + Math.random() * 3
    g.beginPath()
    g.moveTo(0, y)
    for (let x = 0; x <= 1024; x += 64) g.lineTo(x, y + Math.sin(x / 90 + i) * 6 + (Math.random() - 0.5) * 3)
    g.stroke()
  }
  // rácsvonalak ceruzával (10 cm)
  g.strokeStyle = 'rgba(60,60,60,0.12)'
  g.lineWidth = 1
  for (let x = 0; x <= 15; x++) (g.beginPath(), g.moveTo((x / 15) * 1024, 0), g.lineTo((x / 15) * 1024, 768), g.stroke())
  for (let y = 0; y <= 11; y++) (g.beginPath(), g.moveTo(0, (y / 11) * 768), g.lineTo(1024, (y / 11) * 768), g.stroke())
  const t = new THREE.CanvasTexture(c)
  t.colorSpace = THREE.SRGBColorSpace
  return t
}

const v3 = (p: Vec2, z = 0) => new THREE.Vector3(p[0], p[1], z)

// ---------- terminál pozíciók ----------
// mérőszekrény belső geometriája (csak TN-C-S mérőhely-feladatnál van a lapon)
const CAB_TOP = CAB.center[1] + CAB.h / 2
const CAB_BOT = CAB.center[1] - CAB.h / 2
const CAB_LEFT = CAB.center[0] - CAB.w / 2
const CAB_DIN_Y = CAB.center[1] + 0.035
const CAB_X0 = CAB_LEFT + 0.03
const BAR_Y = CAB_BOT + 0.04

type DinPos = { uid: string; type: ItemType; zone?: 'cab' }
/** egy DIN-készülék bal szélének x-e a saját sínjén (mérőszekrény vagy elosztó) */
function dinX(din: DinPos[], uid: string): { x: number; y: number } | null {
  const me = din.find((d) => d.uid === uid)
  if (!me) return null
  let x = me.zone === 'cab' ? CAB_X0 : DIN_X0
  for (const d of din) {
    if (d.zone !== me.zone) continue
    if (d.uid === uid) return { x, y: me.zone === 'cab' ? CAB_DIN_Y : DIN_Y }
    x += itemByType[d.type].din! * MODULE_W
  }
  return null
}

export function termWorld(layout: Layout, t: string, din: DinPos[], mounts: Record<string, ItemType | undefined>): THREE.Vector3 | null {
  const [dev, term] = t.split('.')
  const top = DIST.center[1] + DIST.h / 2
  const cab = !!layout.nodes.cab
  if (cab && dev === 'bet') return new THREE.Vector3(CAB_LEFT + 0.035 + (term === 'L' ? 0 : 0.02), CAB_TOP - 0.035, 0.03)
  if (dev === 'PEs') return new THREE.Vector3(CAB_LEFT + 0.03 + +term * 0.014, BAR_Y, 0.03)
  if (dev === 'Nk') return new THREE.Vector3(CAB_LEFT + 0.115 + +term * 0.014, BAR_Y, 0.03)
  if (dev === 'EPH') return new THREE.Vector3(CAB_LEFT + CAB.w - 0.035, BAR_Y, 0.03)
  if (dev === 'bet') {
    const i = ['L', 'N', 'PE'].indexOf(term)
    return new THREE.Vector3(DIST.center[0] - DIST.w / 2 + 0.03 + i * 0.016, top - 0.035, 0.03)
  }
  if (dev === 'N' || dev === 'PE') {
    const x0 = dev === 'N' ? DIST.center[0] - 0.06 : DIST.center[0] + 0.035
    return new THREE.Vector3(x0 + +term * 0.012, top - 0.035, 0.03)
  }
  const m = layout.mounts.find((x) => x.id === dev)
  if (m) {
    const ty = mounts[m.id]
    if (!ty) return null
    const td = itemByType[ty].terms.find((x) => x.id === term)
    if (!td) return null
    const zFace = m.kind === 'lamp' ? 0.03 : 0.042
    return new THREE.Vector3(m.pos[0] + td.off[0], m.pos[1] + td.off[1] - (m.kind === 'lamp' ? 0.03 : 0), zFace)
  }
  const pos = dinX(din, dev)
  if (!pos) return null
  const d = din.find((q) => q.uid === dev)!
  const def = itemByType[d.type]
  const td = def.terms.find((q) => q.id === term)
  return td ? new THREE.Vector3(pos.x + (def.din! * MODULE_W) / 2 + td.off[0], pos.y + td.off[1], d.type === 'meter1f' ? 0.036 : 0.075) : null
}

/** a vezeték melyik útvonal-csomópontból indul: szerelvény, mérőszekrény vagy elosztó */
function routeKey(layout: Layout, t: string, din: DinPos[] = []) {
  const dev = t.split('.')[0]
  if (layout.mounts.some((m) => m.id === dev)) return dev
  if (layout.nodes.cab && (['bet', 'PEs', 'Nk', 'EPH'].includes(dev) || din.find((d) => d.uid === dev)?.zone === 'cab')) return 'cab'
  return 'dist'
}

// ---------- csatorna geometria ----------
function Trunk({ p }: { p: TrunkPiece }) {
  const cut = useGame((s) => s.cuts[p.id])
  const selected = useGame((s) => s.selectedPiece === p.id)
  const lidsOn = useGame((s) => s.lidsOn)
  const stage = useGame((s) => s.stage)
  const set = useGame((s) => s.set)
  const mounted = !!cut?.mounted
  const tilt = mounted && p.id === 'H1' && !cut.leveled ? 0.012 : 0
  const onClick = (e: ThreeEvent<MouseEvent>) => {
    if (stage !== 'csatorna') return
    e.stopPropagation()
    set({ selectedPiece: p.id })
  }
  const model = <TrunkingProfile piece={p} cut={cut} mounted={mounted} lidsOn={lidsOn} selected={selected} interactive={stage === 'csatorna'} onClick={onClick} />
  if (!mounted) return model
  return (
    <group rotation={[0, 0, tilt]} position={[p.a[0] * (1 - Math.cos(tilt)), -p.a[0] * Math.sin(tilt), 0]}>
      {model}
    </group>
  )
}

// ---------- elosztó ----------
function DinDevice({ uid, type, x, y = DIN_Y }: { uid: string; type: ItemType; x: number; y?: number }) {
  const def = itemByType[type]
  const on = useGame((s) => !!s.dinOn[uid])
  const state = useGame((s) => s.dinState[uid] ?? 0)
  const powered = useGame((s) => s.powered)
  const toggleDin = useGame((s) => s.toggleDin)
  const rcdTest = useGame((s) => s.rcdTest)
  const w = def.din! * MODULE_W
  const onToggle = (e: ThreeEvent<MouseEvent>) => {
    e.stopPropagation()
    toggleDin(uid)
  }
  return (
    <group position={[x + w / 2, y, 0]}>
      {type === 'meter1f' ? <MeterLive /> : type === 'timer' || type === 'ir' ? <Control kind={type} on={powered && state === 1} /> : type === 'spd' ? <Spd powered={powered} /> : type.startsWith('rcd') ? (
        <Rcd
          rating={type === 'rcd40' ? '40A 30mA' : '25A 300mA'}
          on={on}
          onToggle={onToggle}
          onTest={(e) => {
            e.stopPropagation()
            rcdTest()
          }}
        />
      ) : <Mcb rating={type.replace('mcb', '') as 'B10' | 'B16' | 'B32' | 'C32'} on={on} onToggle={onToggle} />}
    </group>
  )
}

/** a mérő kijelzője a mért oldali fogyasztók tényleges teljesítményét mutatja */
function MeterLive() {
  const watts = useGame((s) => {
    if (!s.powered) return 0
    const lit = simulate(s).lit
    return TASKS[s.taskId].loads.reduce((a, l) => a + (lit[l.id] ? (l.watt ?? 0) : 0), 0)
  })
  return <Meter watts={watts} />
}

function Distribution() {
  const din = useGame((s) => s.din)
  const cab = !!useLayout().nodes.cab
  const [cx, cy] = DIST.center
  return (
    <group>
      <group position={[cx, cy, 0]}><DistBox feed={!cab} /></group>
      {din.filter((d) => d.zone !== 'cab').map((d) => <DinDevice key={d.uid} uid={d.uid} type={d.type} x={dinX(din, d.uid)!.x} />)}
      {cab && <MeterCabinet />}
    </group>
  )
}

/** Falon kívüli mérőszekrény: méretlen betáp felül, PE-(főföldelő) sín és N-kapocs gyári híddal, EPH, saját DIN-sín */
function MeterCabinet() {
  const din = useGame((s) => s.din)
  const [cx, cy] = CAB.center
  const wall = (x: number, y: number, w: number, h: number, k: number) => (
    <mesh key={k} position={[x, y, CAB.d / 2]} castShadow>
      <boxGeometry args={[w, h, CAB.d]} />
      <meshStandardMaterial color="#e8eaec" roughness={0.5} />
    </mesh>
  )
  return (
    <group>
      <mesh position={[cx, cy, 0.004]} receiveShadow>
        <boxGeometry args={[CAB.w, CAB.h, 0.008]} />
        <meshStandardMaterial color="#c9ccd0" roughness={0.7} />
      </mesh>
      {wall(cx, CAB_TOP - 0.004, CAB.w, 0.008, 1)}
      {wall(cx, CAB_BOT + 0.004, CAB.w, 0.008, 2)}
      {wall(CAB_LEFT + 0.004, cy, 0.008, CAB.h, 3)}
      {wall(CAB_LEFT + CAB.w - 0.004, cy, 0.008, CAB.h, 4)}
      {/* DIN-sín a főkismegszakítónak és a mérőnek */}
      <mesh position={[cx, CAB_DIN_Y, 0.02]}>
        <boxGeometry args={[CAB.w - 0.04, 0.035, 0.008]} />
        <meshStandardMaterial color="#b8bcc2" metalness={0.8} roughness={0.3} />
      </mesh>
      {/* PE (főföldelő) sín, N-kapocs, gyári híd */}
      <mesh position={[CAB_LEFT + 0.03 + ((BAR_TERMS - 1) * 0.014) / 2, BAR_Y, 0.02]}>
        <boxGeometry args={[BAR_TERMS * 0.014 + 0.01, 0.016, 0.012]} />
        <meshStandardMaterial color="#2f9e44" />
      </mesh>
      <mesh position={[CAB_LEFT + 0.115 + ((BAR_TERMS - 1) * 0.014) / 2, BAR_Y, 0.02]}>
        <boxGeometry args={[BAR_TERMS * 0.014 + 0.01, 0.016, 0.012]} />
        <meshStandardMaterial color="#1f5fd6" />
      </mesh>
      <mesh position={[CAB_LEFT + 0.1, BAR_Y - 0.004, 0.028]}>
        <boxGeometry args={[0.03, 0.005, 0.003]} />
        <meshStandardMaterial color="#c9a95c" metalness={0.8} roughness={0.3} />
      </mesh>
      {/* betáp kábel felülről (L + PEN) és EPH kivezetés */}
      <mesh position={[CAB_LEFT + 0.045, CAB_TOP + 0.1, 0.03]}>
        <cylinderGeometry args={[0.008, 0.008, 0.2, 16]} />
        <meshStandardMaterial color="#1b1b1b" roughness={0.6} />
      </mesh>
      <mesh position={[CAB_LEFT + CAB.w - 0.035, CAB_BOT - 0.06, 0.03]}>
        <cylinderGeometry args={[0.004, 0.004, 0.12, 12]} />
        <meshStandardMaterial color="#2f9e44" roughness={0.5} />
      </mesh>
      <Label text="MÉRŐSZEKRÉNY · TN-C betáp (L + PEN)" position={[cx + 0.03, CAB_TOP + 0.03, 0.001]} width={0.24} height={0.024} bg="#fff7d6" fg="#7a5200" resolution={[512, 52]} />
      <Label text="EPH" position={[CAB_LEFT + CAB.w - 0.035, CAB_BOT - 0.13, 0.001]} width={0.04} height={0.018} resolution={[96, 44]} />
      {din.filter((d) => d.zone === 'cab').map((d) => {
        const p = dinX(din, d.uid)!
        return <DinDevice key={d.uid} uid={d.uid} type={d.type} x={p.x} y={p.y} />
      })}
    </group>
  )
}

// ---------- szerelvények ----------
function Mounted({ id }: { id: string }) {
  const m = useLayout().mounts.find((x) => x.id === id)!
  const type = useGame((s) => s.mounts[id])
  const swState = useGame((s) => s.sw[id] ?? 0)
  const stage = useGame((s) => s.stage)
  const selected = useGame((s) => s.selectedMount === id)
  const set = useGame((s) => s.set)
  const operate = useGame((s) => s.operate)
  const setMotion = useGame((s) => s.setMotion)
  const { hovered, hoverProps } = useHover()
  const lit = useGame((s) => {
    if (!s.powered) return false
    return !!simulate(s).lit[id]
  })
  const covered = stage === 'ellenorzes' || stage === 'ertekeles'
  const interactive = stage === 'szereles' || (covered && (m.kind === 'switch' || type === 'lampMotion'))
  const [px, py] = m.pos
  const onClick = (e: ThreeEvent<MouseEvent>) => {
    e.stopPropagation()
    if (stage === 'szereles') set({ selectedMount: id })
    else if (covered && m.kind === 'switch') operate(id)
    else if (covered && type === 'lampMotion') {
      setMotion(true)
      setTimeout(() => setMotion(false), 6000)
    }
  }
  if (!type)
    return (
      <mesh position={[px, py, 0.001]} onClick={onClick} {...(interactive ? hoverProps : {})}>
        {m.kind === 'lamp' ? <circleGeometry args={[LAMP_R, 32]} /> : <planeGeometry args={[BOX_SIZE, BOX_SIZE]} />}
        <meshBasicMaterial color={selected ? '#ff7a00' : hovered && interactive ? '#ffbf47' : '#3a6ea5'} transparent opacity={stage === 'szereles' ? (hovered ? 0.7 : 0.45) : 0.15} />
      </mesh>
    )
  if (m.kind === 'lamp')
    return (
      <group position={[px, py, 0]} onClick={onClick} {...(interactive ? hoverProps : {})}>
        <LampFitting lit={lit} covered={covered} highlighted={hovered && interactive} terminalOffsets={itemByType[type].terms.map((t) => [t.off[0], t.off[1] - 0.03])} />
        {type === 'lampMotion' && <group position={[0, -LAMP_R - 0.012, 0.015]}><MotionSensor /></group>}
        <Label text={m.label.length > 18 ? id : m.label} position={[0, LAMP_R + 0.018, 0.001]} width={0.07} height={0.022} resolution={[192, 60]} />
      </group>
    )
  const isSocket = m.kind === 'socket'
  return (
    <group position={[px, py, 0]} onClick={onClick} {...(interactive ? hoverProps : {})}>
      <SurfaceBox highlighted={hovered && interactive} terminalOffsets={itemByType[type].terms.map((t) => t.off)} />
      {covered && !isSocket && <SwitchRocker variant={type.replace('sw', '') as '101' | '105' | '106' | '107' | 'pb'} state={swState} highlighted={hovered && interactive} />}
      {covered && isSocket && <Socket2PF highlighted={hovered && interactive} />}
      <Label text={type === 'socket' ? `${id} 2P+F` : `${id} · ${type === 'pb' ? 'NY' : type.replace('sw', '')}`} position={[0, -BOX_SIZE / 2 - 0.012, 0.001]} width={0.07} height={0.02} resolution={[192, 56]} />
    </group>
  )
}

// ---------- terminálok, vezetékek ----------
function Terminals() {
  const stage = useGame((s) => s.stage)
  const din = useGame((s) => s.din)
  const mounts = useGame((s) => s.mounts)
  const pending = useGame((s) => s.pendingTerm)
  const hovered = useGame((s) => s.hoverTerm)
  const clickTerm = useGame((s) => s.clickTerm)
  const set = useGame((s) => s.set)
  const layout = useLayout()
  const taskId = useGame((s) => s.taskId)
  const visible = stage === 'vezetekezes' || stage === 'szereles'
  const all = useMemo(() => {
    const ids = [...fixedTerms({ taskId })]
    for (const d of din) for (const t of itemByType[d.type].terms) ids.push(`${d.uid}.${t.id}`)
    for (const m of layout.mounts) {
      const ty = mounts[m.id]
      if (ty) for (const t of itemByType[ty].terms) ids.push(`${m.id}.${t.id}`)
    }
    return ids
  }, [din, mounts, layout, taskId])
  if (!visible) return null
  return (
    <group>
      {all.map((id) => {
        const p = termWorld(layout, id, din, mounts)
        if (!p) return null
        const term = id.split('.')[1]
        const col = term === 'PE' || id.startsWith('PE') || id.startsWith('EPH') || term === 'PEN' ? '#2f9e44' : term.startsWith('N') || id.startsWith('N') ? '#1f5fd6' : '#c9a227'
        return (
          <mesh
            key={id}
            position={p}
            scale={hovered === id ? 1.35 : 1}
            rotation={[Math.PI / 2, 0, 0]}
            onClick={(e) => {
              e.stopPropagation()
              clickTerm(id)
            }}
            onPointerOver={(e) => (e.stopPropagation(), set({ hoverTerm: id }), (document.body.style.cursor = 'pointer'))}
            onPointerOut={() => (set({ hoverTerm: null }), (document.body.style.cursor = 'auto'))}
          >
            <cylinderGeometry args={[0.0042, 0.0042, 0.004, 16]} />
            <meshStandardMaterial color={pending === id ? '#ff3b00' : col} metalness={0.7} roughness={0.25} emissive={pending === id || hovered === id ? (pending === id ? '#ff3b00' : col) : '#000'} emissiveIntensity={pending === id || hovered === id ? 0.65 : 0} />
          </mesh>
        )
      })}
    </group>
  )
}

function WireMesh({ w, idx }: { w: Wire; idx: number }) {
  const din = useGame((s) => s.din)
  const mounts = useGame((s) => s.mounts)
  const removeWire = useGame((s) => s.removeWire)
  const stage = useGame((s) => s.stage)
  const layout = useLayout()
  const { hovered, hoverProps } = useHover()
  const curve = useMemo(() => {
    const a = termWorld(layout, w.a, din, mounts)
    const b = termWorld(layout, w.b, din, mounts)
    if (!a || !b) return null
    const ka = routeKey(layout, w.a, din), kb = routeKey(layout, w.b, din)
    const off = ((idx % 7) - 3) * 0.0035
    const z = 0.012 + (idx % 3) * 0.003
    let pts: THREE.Vector3[]
    if (ka === kb && (ka === 'dist' || ka === 'cab')) {
      const mid = a.clone().lerp(b, 0.5)
      mid.z = Math.max(a.z, b.z) + 0.02
      mid.y = Math.min(a.y, b.y) - 0.015
      pts = [a, mid, b]
    } else {
      const path = routePath(layout, ka, kb).map((p, i, arr) => {
        const horiz = i > 0 ? Math.abs(arr[i - 1][1] - p[1]) < 1e-6 : arr.length > 1 && Math.abs(arr[1][1] - p[1]) < 1e-6
        return new THREE.Vector3(p[0] + (horiz ? 0 : off), p[1] + (horiz ? off : 0), z)
      })
      const exit = (k: string, p: THREE.Vector3) => (k === 'dist' || k === 'cab' ? [new THREE.Vector3(p.x, layout.nodes[k][1] + 0.02, z + 0.02)] : [])
      pts = [a, ...exit(ka, a), ...path, ...exit(kb, b).reverse(), b]
    }
    return new THREE.CatmullRomCurve3(pts, false, 'centripetal', 0.2)
  }, [w, din, mounts, idx, layout])
  if (!curve) return null
  const r = w.cs >= 2.5 ? 0.0019 : 0.0015
  const c = WIRE_COLORS.find((x) => x.id === w.color)!
  return (
    <mesh
      onClick={(e) => {
        if (stage !== 'vezetekezes') return
        e.stopPropagation()
        removeWire(w.id)
      }}
      {...(stage === 'vezetekezes' ? hoverProps : {})}
      castShadow
    >
      <tubeGeometry args={[curve, 96, r, 8, false]} />
      <meshStandardMaterial color={colorHex[w.color]} roughness={0.35} emissive={hovered ? '#ff9f1c' : c.hex2 ? '#2a2a00' : '#000'} emissiveIntensity={hovered ? 0.45 : 1} />
    </mesh>
  )
}

function Wires() {
  const wires = useGame((s) => s.wires)
  const lidsOn = useGame((s) => s.lidsOn)
  const layout = useLayout()
  const din = useGame((s) => s.din)
  const routeKey2 = (t: string) => routeKey(layout, t, din)
  return (
    <group>
      {wires.map((w, i) =>
        // fedéllel a csatornában futó vezetékek nem látszanak, csak az elosztóban lévők
        lidsOn && (routeKey2(w.a) !== routeKey2(w.b) || !['dist', 'cab'].includes(routeKey2(w.a))) ? null : <WireMesh key={w.id} w={w} idx={i} />,
      )}
    </group>
  )
}

// ---------- mérőszalag ----------
function Tape() {
  const tape = useGame((s) => s.tape)
  if (!tape.length) return null
  const a = v3(tape[0], 0.035)
  const b = tape[1] ? v3(tape[1], 0.035) : null
  const mm = b ? Math.round(a.distanceTo(b) * 1000) : 0
  return (
    <group>
      <mesh position={a}>
        <sphereGeometry args={[0.004]} />
        <meshBasicMaterial color="#e11" />
      </mesh>
      {b && (
        <>
          <mesh position={b}>
            <sphereGeometry args={[0.004]} />
            <meshBasicMaterial color="#e11" />
          </mesh>
          <mesh position={a.clone().lerp(b, 0.5)} quaternion={new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), b.clone().sub(a).normalize())}>
            <boxGeometry args={[0.012, a.distanceTo(b), 0.001]} />
            <meshStandardMaterial color="#f2c200" />
          </mesh>
          <Html position={a.clone().lerp(b, 0.5).add(new THREE.Vector3(0, 0, 0.01))} center>
            <div className="tape-label">{mm} mm</div>
          </Html>
        </>
      )}
    </group>
  )
}

function Board() {
  const tex = useMemo(plywood, [])
  const stage = useGame((s) => s.stage)
  const activeTool = useGame((s) => s.activeTool)
  const tape = useGame((s) => s.tape)
  const set = useGame((s) => s.set)
  const tryTool = useGame((s) => s.tryTool)
  const layout = useLayout()
  const snaps = useMemo(() => snapPoints(layout), [layout])
  const [hover, setHover] = useState<Vec2 | null>(null)
  const snap = (x: number, y: number): Vec2 => {
    let best: Vec2 = [Math.round(x * 1000) / 1000, Math.round(y * 1000) / 1000]
    let bd = 0.012
    for (const p of snaps) {
      const d = Math.hypot(p[0] - x, p[1] - y)
      if (d < bd) ((bd = d), (best = p))
    }
    return best
  }
  return (
    <group>
      <mesh
        position={[BOARD.w / 2, BOARD.h / 2, -BOARD.t / 2]}
        receiveShadow
        onPointerMove={(e) => stage === 'csatorna' && activeTool === 'mero' && setHover(snap(e.point.x, e.point.y))}
        onClick={(e) => {
          if (stage !== 'csatorna') return
          if (activeTool !== 'mero') return set({ selectedPiece: null })
          e.stopPropagation()
          if (tryTool('measure') !== 'ok') return
          const p = snap(e.point.x, e.point.y)
          set({ tape: tape.length === 1 ? [tape[0], p] : [p] })
        }}
      >
        <boxGeometry args={[BOARD.w, BOARD.h, BOARD.t]} />
        <meshStandardMaterial map={tex} roughness={0.85} />
      </mesh>
      {hover && stage === 'csatorna' && activeTool === 'mero' && (
        <mesh position={v3(hover, 0.002)}>
          <ringGeometry args={[0.003, 0.005, 20]} />
          <meshBasicMaterial color="#e11" />
        </mesh>
      )}
      {/* talp */}
      <mesh position={[BOARD.w / 2, -0.03, 0.1]} receiveShadow>
        <boxGeometry args={[BOARD.w + 0.1, 0.06, 0.4]} />
        <meshStandardMaterial color="#5b6168" roughness={0.8} />
      </mesh>
    </group>
  )
}

export function Scene() {
  const layout = useLayout()
  const [focusPoint, setFocusPoint] = useState<Vec2 | null>(null)
  const keyLight = useRef<THREE.DirectionalLight>(null)
  return (
    <Selection>
      <Rendering keyLight={keyLight} />
      <color attach="background" args={['#20242a']} />
      <ambientLight intensity={0.35} />
      <directionalLight ref={keyLight} position={[1.2, 2, 2]} intensity={1.6} castShadow shadow-mapSize={[2048, 2048]} shadow-bias={-0.0004}>
        <orthographicCamera attach="shadow-camera" args={[-1.2, 1.2, 1.2, -1.2, 0.1, 6]} />
      </directionalLight>
      <Environment resolution={128}>
        <Lightformer intensity={1.2} position={[0, 2, 3]} scale={[4, 2, 1]} />
        <Lightformer intensity={0.6} position={[-3, 1, 1]} scale={[2, 2, 1]} />
      </Environment>
      <BoardCamera focusPoint={focusPoint} />
      <Workshop />
      <group onDoubleClick={(e) => (e.stopPropagation(), setFocusPoint([e.point.x, e.point.y]))}>
        <Board />
        <Distribution />
        {layout.pieces.map((p) => (
          <Trunk key={p.id} p={p} />
        ))}
        {layout.mounts.map((m) => (
          <Mounted key={m.id} id={m.id} />
        ))}
        <Terminals />
        <Wires />
        <Tape />
      </group>
    </Selection>
  )
}
