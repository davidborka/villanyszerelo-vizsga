import * as THREE from 'three'
import { cylinderGeometry } from './geometry'
import { materials } from './shared'

const domeGeometry = new THREE.SphereGeometry(0.012, 20, 10, 0, Math.PI * 2, 0, Math.PI / 2)
const ribGeometry = new THREE.TorusGeometry(0.0105, 0.00035, 5, 24)

export function MotionSensor() {
  return (
    <group dispose={null}>
      <mesh geometry={cylinderGeometry(0.013, 0.009, 24)} material={materials.white} rotation={[Math.PI / 2, 0, 0]} />
      <mesh geometry={domeGeometry} material={materials.porcelain} rotation={[Math.PI / 2, 0, 0]} position={[0, 0, 0.004]} />
      {[0.006, 0.01, 0.013].map((z, i) => <mesh key={z} geometry={ribGeometry} material={materials.grey} position={[0, 0, z]} scale={[1 - i * 0.16, 1 - i * 0.16, 1]} />)}
    </group>
  )
}
