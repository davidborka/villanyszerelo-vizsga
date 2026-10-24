import { useEffect, useMemo, useRef } from 'react'
import { useFrame, type ThreeEvent } from '@react-three/fiber'
import * as THREE from 'three'
import type { TrunkPiece } from '../../sim/layout'
import type { Cut } from '../../sim/store'
import { trunkFootprintGeometry, trunkProfileGeometry } from './geometry'
import { HoverOutline } from './interaction'
import { useHover } from './useHover'

export function TrunkingProfile({ piece, cut, mounted, lidsOn, selected, interactive, onClick }: {
  piece: TrunkPiece
  cut?: Cut
  mounted: boolean
  lidsOn: boolean
  selected: boolean
  interactive: boolean
  onClick: (e: ThreeEvent<MouseEvent>) => void
}) {
  const profile = useMemo(() => trunkProfileGeometry(piece, mounted ? cut : undefined), [piece, cut, mounted])
  const lid = useMemo(() => trunkProfileGeometry(piece, mounted ? cut : undefined, true), [piece, cut, mounted])
  const footprint = useMemo(() => trunkFootprintGeometry(piece, mounted ? cut : undefined), [piece, cut, mounted])
  const lidRef = useRef<THREE.Mesh>(null)
  const { hovered, hoverProps } = useHover()
  const color = selected && interactive ? '#ffe2c4' : '#f4f4f1'
  useEffect(() => {
    if (lidsOn && lidRef.current) lidRef.current.position.z = 0.065
  }, [lidsOn])
  useFrame((_, delta) => {
    if (lidRef.current) lidRef.current.position.z = THREE.MathUtils.damp(lidRef.current.position.z, 0, 22, delta)
  })
  if (!mounted) {
    return (
      <mesh geometry={footprint} onClick={onClick} {...(interactive ? hoverProps : {})} position={[0, 0, 0.0005]} scale={[1, 1, 0.02]}>
        <meshBasicMaterial color={selected ? '#ff7a00' : hovered && interactive ? '#ffbf47' : '#3a6ea5'} transparent opacity={interactive ? (selected || hovered ? 0.75 : 0.35) : 0.12} />
      </mesh>
    )
  }
  return (
    <group onClick={onClick} {...(interactive ? hoverProps : {})}>
      <mesh geometry={profile} castShadow receiveShadow>
        <meshStandardMaterial color={color} roughness={0.45} emissive={hovered && interactive ? '#5b3400' : '#000'} emissiveIntensity={0.35} />
        <HoverOutline active={hovered && interactive} />
      </mesh>
      {lidsOn && (
        <mesh ref={lidRef} geometry={lid} castShadow receiveShadow>
          <meshStandardMaterial color={color} roughness={0.38} />
          <HoverOutline active={hovered} />
        </mesh>
      )}
    </group>
  )
}
