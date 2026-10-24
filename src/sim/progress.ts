import type { ExamRecord } from './score'

// A vizsgarészek legutóbbi eredményei – csak ebben a böngészőben, kényelmi célra
const KEY = 'villanyvizsga.record.v1'

export function loadRecord(): ExamRecord {
  try {
    return JSON.parse(localStorage.getItem(KEY) ?? '{}') as ExamRecord
  } catch {
    return {}
  }
}

export function saveRecord(patch: Partial<ExamRecord>): ExamRecord {
  const rec = { ...loadRecord(), ...patch }
  try {
    localStorage.setItem(KEY, JSON.stringify(rec))
  } catch {
    // privát mód / tiltott tárhely: az előrejelzés ilyenkor csak a munkamenetben él
  }
  return rec
}

/** Hot Seat portfólióvédés: a zsűri által megnyitott címre visszaküldött eredmény (?portfolio=NN) */
export const HOTSEAT_URL = (import.meta.env?.VITE_HOTSEAT_URL as string | undefined) ?? 'http://localhost:4740'
export const HOTSEAT_BOARD = 'villanyszerelo-portfolio-vedes'

export function hotSeatLink(): string {
  return `${HOTSEAT_URL}/?board=${HOTSEAT_BOARD}&only=1&return=${encodeURIComponent(location.origin + location.pathname)}`
}

export function importFromUrl() {
  const q = new URLSearchParams(location.search)
  const v = Number(q.get('portfolio'))
  if (!q.has('portfolio') || !Number.isFinite(v)) return
  saveRecord({ portfolio: Math.max(0, Math.min(100, Math.round(v))), portfolioSrc: 'hotseat' })
  history.replaceState(null, '', location.pathname)
}

// Az interaktív vizsgán már látott bankkérdések: a következő feladatsor előbb a még nem látottakból húz
const SEEN = 'villanyvizsga.seen.v1'

export function loadSeen(): Set<string> {
  try {
    return new Set(JSON.parse(localStorage.getItem(SEEN) ?? '[]') as string[])
  } catch {
    return new Set()
  }
}

export function addSeen(ids: string[]) {
  const all = loadSeen()
  for (const id of ids) if (!id.startsWith('g-')) all.add(id)
  try {
    localStorage.setItem(SEEN, JSON.stringify([...all]))
  } catch {
    // nem tárolható: a következő húzás csak véletlenszerű lesz
  }
}

/** Visszaállítás: az előrejelzés és/vagy a látott kérdések törlése */
export function resetProgress(what: { record?: boolean; seen?: boolean }) {
  try {
    if (what.record) localStorage.removeItem(KEY)
    if (what.seen) localStorage.removeItem(SEEN)
  } catch {
    // nincs mit törölni
  }
}
