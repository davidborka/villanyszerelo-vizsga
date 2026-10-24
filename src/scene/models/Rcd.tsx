import { useRef, useState } from 'react'
import { useFrame, type ThreeEvent } from '@react-three/fiber'
import * as THREE from 'three'
import { boxGeometry, cylinderGeometry } from './geometry'
import { HoverOutline } from './interaction'
import { useHover } from './useHover'
import { DinShell, Label, materials } from './shared'

export function Rcd({ rating, on, onToggle, onTest }: {
  rating: '40A 30mA' | '25A 300mA'
  on: boolean
  onToggle?: (e: ThreeEvent<MouseEvent>) => void
  onTest?: (e: ThreeEvent<MouseEvent>) => void
}) {
  const lever = useRef<THREE.Group>(null)
  const button = useRef<THREE.Group>(null)
  const [pressed, setPressed] = useState(false)
  const leverHover = useHover()
  const testHover = useHover()
  useFrame((_, delta) => {
    if (lever.current) {
      lever.current.position.y = THREE.MathUtils.damp(lever.current.position.y, on ? 0.001 : -0.007, 30, delta)
      lever.current.rotation.x = THREE.MathUtils.damp(lever.current.rotation.x, on ? -0.18 : 0.18, 30, delta)
    }
    if (button.current) button.current.position.z = THREE.MathUtils.damp(button.current.position.z, pressed ? 0.074 : 0.077, 28, delta)
  })
  return (
    <DinShell modules={2} terminals={[[-0.009, 0.032], [0.009, 0.032], [-0.009, -0.032], [0.009, -0.032]]}>
      <Label text="FI / RCD" position={[-0.005, 0.018, 0.0752]} width={0.019} height={0.005} resolution={[256, 64]} />
      <Label text={rating} position={[0, 0.009, 0.0752]} width={0.029} height={0.007} fg="#172c46" resolution={[384, 96]} />
      <Label text="2P  230 V~" position={[0, -0.021, 0.0752]} width={0.025} height={0.004} resolution={[256, 64]} />
      <mesh geometry={boxGeometry(0.013, 0.018, 0.0015, 0.001)} material={materials.recess} position={[-0.006, -0.003, 0.0752]} />
      <group ref={lever} position={[-0.006, on ? 0.001 : -0.007, 0.078]} rotation={[on ? -0.18 : 0.18, 0, 0]}>
        <mesh geometry={boxGeometry(0.009, 0.012, 0.006, 0.001)} material={on ? materials.blue : materials.darkGrey} onClick={onToggle} {...leverHover.hoverProps}>
          <HoverOutline active={leverHover.hovered} />
        </mesh>
      </group>
      <group ref={button} position={[0.009, -0.004, 0.077]}>
        <mesh
          geometry={cylinderGeometry(0.0042, 0.004, 20)}
          material={materials.yellow}
          rotation={[Math.PI / 2, 0, 0]}
          onClick={onTest}
          onPointerDown={() => setPressed(true)}
          onPointerUp={() => setPressed(false)}
          {...testHover.hoverProps}
          onPointerOut={() => (setPressed(false), testHover.hoverProps.onPointerOut())}
        >
          <HoverOutline active={testHover.hovered} />
        </mesh>
        <Label text="T" position={[0, 0, 0.0022]} width={0.0045} height={0.0045} fg="#554400" resolution={[64, 64]} />
      </group>
    </DinShell>
  )
}
