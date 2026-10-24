import { useEffect, useState } from 'react'
import { HOTSEAT_URL, hotSeatLink, saveRecord } from '../sim/progress'

/** Beépített portfólióvédés: a hotseat/ submodule szervere beágyazva, az eredmény üzenetben jön vissza */
export function HotSeat({ onExit }: { onExit: () => void }) {
  const [up, setUp] = useState<boolean | null>(null)
  const [got, setGot] = useState<number | null>(null)
  useEffect(() => {
    // eltérő origin, CORS nélkül: csak az elérhetőséget nézzük (opaque válasz = fut)
    fetch(`${HOTSEAT_URL}/api/boards`, { mode: 'no-cors' }).then(() => setUp(true), () => setUp(false))
    const onMsg = (e: MessageEvent) => {
      if (e.origin !== new URL(HOTSEAT_URL).origin || e.data?.type !== 'hotseat-result') return
      const v = Math.max(0, Math.min(100, Math.round(Number(e.data.portfolio))))
      if (!Number.isFinite(v)) return
      saveRecord({ portfolio: v, portfolioSrc: 'hotseat' })
      setGot(v)
    }
    window.addEventListener('message', onMsg)
    return () => window.removeEventListener('message', onMsg)
  }, [])
  return (
    <div className="hs">
      <header>
        <button className="brand" onClick={onExit}>⚡ Portfólióvédés · Hot Seat</button>
        <span className="muted small">I. vizsgarész: 10 perces bemutatás és védés a vizsgabizottság előtt (a projekt 20%-a)</span>
        <span style={{ flex: 1 }} />
        {got !== null && <span className="pill on">Eredmény mentve: {got}%</span>}
        <a className="btnlink" href={hotSeatLink()} target="_blank" rel="noreferrer">Megnyitás új lapon ↗</a>
        <button onClick={onExit}>Vissza a főmenübe</button>
      </header>
      {up === false ? (
        <div className="hs-down">
          <h2>A Hot Seat nem fut</h2>
          <p className="muted">Indítsd a szimulátort a <code>bun run dev</code> paranccsal (a Hot Seat-et is elindítja), vagy külön: <code>bun run hotseat</code>.</p>
          <p className="muted small">Első alkalommal: <code>git submodule update --init</code>. A zsűri AI-modelleket hív (claude / codex / copilot CLI), ezek a Hot Seat beállításai szerint futnak.</p>
        </div>
      ) : (
        <iframe title="Hot Seat portfólióvédés" src={hotSeatLink()} allow="camera; microphone; display-capture; autoplay; clipboard-write" />
      )}
    </div>
  )
}
