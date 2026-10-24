import { Outlines } from '@react-three/drei'

export function HoverOutline({ active }: { active: boolean }) {
  return active ? <Outlines thickness={0.0018} color="#ffb020" toneMapped={false} /> : null
}
