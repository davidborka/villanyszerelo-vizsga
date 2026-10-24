import { useRef } from 'react'
import { useFrame, type ThreeEvent } from '@react-three/fiber'
import * as THREE from 'three'
import { boxGeometry } from './geometry'
import { HoverOutline } from './interaction'
import { useHover } from './useHover'
import { DinShell, Label, materials } from './shared'

export function Mcb({ rating, on, onToggle }: { rating: 'B10' | 'B16' | 'B32' | 'C32'; on: boolean; onToggle?: (e: ThreeEvent<MouseEvent>) => void }) {
  const lever = useRef<THREE.Group>(null)
  const { hovered, hoverProps } = useHover()
  useFrame((_, delta) => {
    if (!lever.current) return
    lever.current.position.y = THREE.MathUtils.damp(lever.current.position.y, on ? 0.001 : -0.007, 30, delta)
    lever.current.rotation.x = THREE.MathUtils.damp(lever.current.rotation.x, on ? -0.18 : 0.18, 30, delta)
  })
  return (
    <DinShell modules={1} terminals={[[0, 0.032], [0, -0.032]]}>
      <Label text="VIZSGA" position={[0, 0.018, 0.0752]} width={0.013} height={0.005} resolution={[192, 64]} />
      <Label text={rating} position={[0, 0.009, 0.0752]} width={0.014} height={0.009} fg="#172c46" resolution={[256, 128]} />
      <Label text="230/400 V~" position={[0, -0.019, 0.0752]} width={0.013} height={0.004} resolution={[256, 64]} />
      <mesh geometry={boxGeometry(0.011, 0.018, 0.0015, 0.001)} material={materials.recess} position={[0, -0.003, 0.0752]} />
      <group ref={lever} position={[0, on ? 0.001 : -0.007, 0.078]} rotation={[on ? -0.18 : 0.18, 0, 0]}>
        <mesh geometry={boxGeometry(0.008, 0.011, 0.006, 0.001)} material={materials.black} onClick={onToggle} {...hoverProps}>
          <HoverOutline active={hovered} />
        </mesh>
        <Label text={on ? 'I' : 'O'} position={[0, 0, 0.0032]} width={0.004} height={0.004} fg="#eeeeee" resolution={[64, 64]} />
      </group>
    </DinShell>
  )
}
