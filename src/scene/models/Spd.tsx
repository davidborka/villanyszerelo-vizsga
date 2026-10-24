import * as THREE from 'three'
import { useMemo } from 'react'
import { boxGeometry } from './geometry'
import { DinShell, Label, materials } from './shared'

export function Spd({ powered }: { powered: boolean }) {
  const status = useMemo(() => new THREE.MeshStandardMaterial({ color: powered ? '#35b558' : '#737a77', emissive: powered ? '#0b3918' : '#000000', roughness: 0.25 }), [powered])
  return (
    <DinShell modules={2} terminals={[[-0.009, 0.032], [0.009, 0.032], [0, -0.032]]}>
      <Label text="SPD  T2" position={[0, 0.018, 0.0752]} width={0.028} height={0.006} fg="#a3342d" resolution={[384, 96]} />
      <Label text={'1+N  275 V~\nU₀  230 V'} position={[0, 0.005, 0.0752]} width={0.027} height={0.012} resolution={[384, 160]} />
      <mesh geometry={boxGeometry(0.012, 0.009, 0.002, 0.001)} material={materials.recess} position={[0, -0.011, 0.0755]} />
      <mesh geometry={boxGeometry(0.009, 0.006, 0.001)} material={status} position={[0, -0.011, 0.077]} />
      <Label text="L  N  PE" position={[0, -0.023, 0.0752]} width={0.025} height={0.004} resolution={[256, 64]} />
    </DinShell>
  )
}
