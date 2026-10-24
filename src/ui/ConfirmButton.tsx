import { useEffect, useState, type ReactNode } from 'react'

/** Kétlépéses gomb: első kattintásra rákérdez, a másodikra hajtja végre (pár másodperc után visszaáll) */
export function ConfirmButton({ children, confirm = 'Biztos? Kattints újra', onConfirm, className = '' }: { children: ReactNode; confirm?: string; onConfirm: () => void; className?: string }) {
  const [armed, setArmed] = useState(false)
  useEffect(() => {
    if (!armed) return
    const t = setTimeout(() => setArmed(false), 3500)
    return () => clearTimeout(t)
  }, [armed])
  return (
    <button className={className + (armed ? ' armed' : '')} onClick={() => (armed ? (setArmed(false), onConfirm()) : setArmed(true))}>
      {armed ? confirm : children}
    </button>
  )
}
