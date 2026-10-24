import type { ThreeEvent } from '@react-three/fiber'
import { useEffect, useState } from 'react'

export function useHover() {
  const [hovered, setHovered] = useState(false)
  useEffect(() => () => {
    if (hovered) document.body.style.cursor = 'auto'
  }, [hovered])
  const hoverProps = {
    onPointerOver: (e: ThreeEvent<PointerEvent>) => {
      e.stopPropagation()
      setHovered(true)
      document.body.style.cursor = 'pointer'
    },
    onPointerOut: () => {
      setHovered(false)
      document.body.style.cursor = 'auto'
    },
  }
  return { hovered, hoverProps }
}
