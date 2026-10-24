import { useGame } from '../sim/store'

export type Sound = 'click' | 'rocker' | 'din' | 'saw' | 'drill' | 'trip' | 'rcd' | 'tick'
type GameState = ReturnType<typeof useGame.getState>

export function soundEvents(prev: GameState, next: GameState): Sound[] {
  const newLogs = next.log.slice(prev.log.length)
  const dinChanged = Object.keys({ ...prev.dinOn, ...next.dinOn }).some((id) => prev.dinOn[id] !== next.dinOn[id])
  const tripped = dinChanged && newLogs.some((e) => /kioldott|kiolvadt/.test(e.msg))
  if (next.tested.rcdTest && !prev.tested.rcdTest) return ['rcd']
  if (tripped) {
    const rcdOff = next.din.some((d) => d.type.startsWith('rcd') && prev.dinOn[d.uid] && !next.dinOn[d.uid])
    return [rcdOff ? 'rcd' : 'trip']
  }
  if (dinChanged) return ['din']
  if (next.wires.length > prev.wires.length) return ['tick']
  const swId = Object.keys({ ...prev.sw, ...next.sw }).find((id) => prev.sw[id] !== next.sw[id])
  if (swId) return [next.mounts[swId] === 'pb' ? 'click' : 'rocker']
  for (const [id, cut] of Object.entries(next.cuts)) {
    const before = prev.cuts[id]
    if (before === cut) continue
    if (cut.mounted && !before?.mounted) return ['drill']
    if (!before || before.len !== cut.len || before.ends !== cut.ends) return ['saw']
  }
  if (Object.keys({ ...prev.mounts, ...next.mounts }).some((id) => !prev.mounts[id] && next.mounts[id])) return ['drill']
  if (next.selectedPiece !== prev.selectedPiece || next.selectedMount !== prev.selectedMount || next.lidsOn !== prev.lidsOn) return ['click']
  return []
}

let audio: AudioContext | null = null
let master: GainNode | null = null
let noiseBuffer: AudioBuffer | null
let muted = readMuted()

function readMuted() {
  try {
    return localStorage.getItem('villany-mute') === '1'
  } catch {
    return false
  }
}

export function isMuted() {
  return muted
}

export function toggleMuted() {
  muted = !muted
  try {
    localStorage.setItem('villany-mute', muted ? '1' : '0')
  } catch {
    // A hang továbbra is némítható tiltott tároló esetén is.
  }
  if (master && audio) master.gain.setTargetAtTime(muted ? 0 : 0.2, audio.currentTime, 0.015)
  return muted
}

function ensureAudio() {
  if (audio || typeof window === 'undefined' || !('AudioContext' in window)) return audio
  audio = new AudioContext()
  master = audio.createGain()
  master.gain.value = muted ? 0 : 0.2
  master.connect(audio.destination)
  return audio
}

function tone(ctx: AudioContext, from: number, to: number, duration: number, gain: number, type: OscillatorType = 'sine', delay = 0) {
  const start = ctx.currentTime + delay
  const osc = ctx.createOscillator()
  const amp = ctx.createGain()
  osc.type = type
  osc.frequency.setValueAtTime(from, start)
  osc.frequency.exponentialRampToValueAtTime(Math.max(20, to), start + duration)
  amp.gain.setValueAtTime(gain, start)
  amp.gain.exponentialRampToValueAtTime(0.0001, start + duration)
  osc.connect(amp).connect(master!)
  osc.start(start)
  osc.stop(start + duration + 0.01)
}

function noise(ctx: AudioContext, duration: number, gain: number, frequency: number, type: BiquadFilterType = 'bandpass') {
  if (!noiseBuffer) {
    noiseBuffer = ctx.createBuffer(1, ctx.sampleRate, ctx.sampleRate)
    const data = noiseBuffer.getChannelData(0)
    for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1
  }
  const source = ctx.createBufferSource()
  const filter = ctx.createBiquadFilter()
  const amp = ctx.createGain()
  source.buffer = noiseBuffer
  filter.type = type
  filter.frequency.value = frequency
  amp.gain.setValueAtTime(gain, ctx.currentTime)
  amp.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + duration)
  source.connect(filter).connect(amp).connect(master!)
  source.start()
  source.stop(ctx.currentTime + duration)
}

function play(sound: Sound) {
  if (muted) return
  const ctx = ensureAudio()
  if (!ctx) return
  if (ctx.state === 'suspended') void ctx.resume().catch(() => {})
  if (sound === 'click') tone(ctx, 720, 430, 0.035, 0.16)
  if (sound === 'tick') tone(ctx, 1450, 850, 0.045, 0.2)
  if (sound === 'rocker') {
    noise(ctx, 0.035, 0.14, 1800)
    tone(ctx, 520, 260, 0.05, 0.2)
  }
  if (sound === 'din') {
    noise(ctx, 0.055, 0.25, 1200)
    tone(ctx, 260, 95, 0.075, 0.3)
  }
  if (sound === 'saw') {
    noise(ctx, 0.34, 0.28, 1350)
    tone(ctx, 150, 85, 0.34, 0.12, 'sawtooth')
  }
  if (sound === 'drill') {
    noise(ctx, 0.28, 0.2, 2400, 'highpass')
    tone(ctx, 115, 82, 0.28, 0.16, 'sawtooth')
  }
  if (sound === 'trip') {
    noise(ctx, 0.09, 0.32, 480, 'lowpass')
    tone(ctx, 130, 42, 0.19, 0.5)
  }
  if (sound === 'rcd') {
    noise(ctx, 0.065, 0.28, 900)
    tone(ctx, 410, 90, 0.11, 0.38)
    tone(ctx, 850, 520, 0.055, 0.15, 'square', 0.045)
  }
}

export function startSfx() {
  const unsubscribe = useGame.subscribe((next, prev) => {
    for (const sound of soundEvents(prev, next)) play(sound)
  })
  const unlock = (event: PointerEvent) => {
    const ctx = ensureAudio()
    if (ctx?.state === 'suspended') void ctx.resume().catch(() => {})
    if ((event.target as Element | null)?.closest('button')) play('click')
  }
  document.addEventListener('pointerdown', unlock)
  return () => {
    unsubscribe()
    document.removeEventListener('pointerdown', unlock)
    if (audio) void audio.close()
    audio = null
    master = null
    noiseBuffer = null
  }
}
