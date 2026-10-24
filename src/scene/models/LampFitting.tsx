import { useMemo } from 'react'
import * as THREE from 'three'
import { Select } from '@react-three/postprocessing'
import { LAMP_R } from '../../sim/layout'
import { boxGeometry, cylinderGeometry } from './geometry'
import { HoverOutline } from './interaction'
import { materials, TerminalScrews } from './shared'

const diffuserGeometry = new THREE.SphereGeometry(LAMP_R * 0.94, 32, 12, 0, Math.PI * 2, 0, Math.PI / 2)
const rimGeometry = new THREE.TorusGeometry(LAMP_R * 0.94, 0.0022, 8, 40)

export function LampFitting({ lit, covered, terminalOffsets = [], highlighted = false }: {
  lit: boolean
  covered: boolean
  terminalOffsets?: readonly (readonly [number, number])[]
  highlighted?: boolean
}) {
  const diffuser = useMemo(() => new THREE.MeshStandardMaterial({
    color: lit ? '#fff4cf' : '#eeeeE8',
    emissive: lit ? '#ffd080' : '#000000',
    emissiveIntensity: lit ? 2.2 : 0,
    roughness: 0.3,
    transparent: true,
    opacity: 0.94,
  }), [lit])
  return (
    <group dispose={null}>
      <mesh geometry={cylinderGeometry(LAMP_R, 0.024, 40)} material={materials.white} rotation={[Math.PI / 2, 0, 0]} position={[0, 0, 0.012]} castShadow>
        <HoverOutline active={highlighted} />
      </mesh>
      <mesh geometry={cylinderGeometry(LAMP_R * 0.91, 0.006, 40)} material={materials.grey} rotation={[Math.PI / 2, 0, 0]} position={[0, 0, 0.025]} />
      {!covered && (
        <>
          <mesh geometry={boxGeometry(0.058, 0.018, 0.006, 0.002)} material={materials.porcelain} position={[0, -0.03, 0.026]} />
          <TerminalScrews offsets={terminalOffsets} z={0.03} />
        </>
      )}
      {covered && (
        <>
          <Select enabled={lit}>
            <mesh geometry={diffuserGeometry} material={diffuser} rotation={[Math.PI / 2, 0, 0]} position={[0, 0, 0.027]} />
          </Select>
          <mesh geometry={rimGeometry} material={materials.porcelain} position={[0, 0, 0.027]} />
          {[0.022, 0.039].map((z) => <mesh key={z} geometry={rimGeometry} material={materials.porcelain} position={[0, 0, z]} scale={[1 - z * 2.2, 1 - z * 2.2, 1]} />)}
          <pointLight position={[0, 0, 0.12]} intensity={lit ? 0.14 : 0} distance={0.75} color="#ffd9a0" />
        </>
      )}
    </group>
  )
}
