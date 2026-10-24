import { boxGeometry, cylinderGeometry, planeGeometry } from './geometry'
import { HoverOutline } from './interaction'
import { materials, Screw } from './shared'

export function Socket2PF({ highlighted = false }: { highlighted?: boolean }) {
  return (
    <group dispose={null}>
      <mesh geometry={boxGeometry(0.07, 0.07, 0.006, 0.005)} material={materials.porcelain} position={[0, 0, 0.043]} castShadow>
        <HoverOutline active={highlighted} />
      </mesh>
      <mesh geometry={cylinderGeometry(0.026, 0.009, 40)} material={materials.white} rotation={[Math.PI / 2, 0, 0]} position={[0, 0, 0.049]} />
      <mesh geometry={cylinderGeometry(0.0215, 0.001, 40)} material={materials.grey} rotation={[Math.PI / 2, 0, 0]} position={[0, 0, 0.054]} />
      <mesh geometry={cylinderGeometry(0.0195, 0.0012, 40)} material={materials.porcelain} rotation={[Math.PI / 2, 0, 0]} position={[0, 0, 0.055]} />
      {[-0.0095, 0.0095].map((x) => (
        <group key={x} position={[x, 0, 0.056]}>
          <mesh geometry={cylinderGeometry(0.0032, 0.001, 20)} material={materials.recess} rotation={[Math.PI / 2, 0, 0]} />
          <mesh geometry={cylinderGeometry(0.0017, 0.0012, 16)} material={materials.brass} rotation={[Math.PI / 2, 0, 0]} position={[0, 0, 0.0003]} />
          <mesh geometry={cylinderGeometry(0.0011, 0.0013, 16)} material={materials.recess} rotation={[Math.PI / 2, 0, 0]} position={[0, 0, 0.0006]} />
        </group>
      ))}
      {[0.019, -0.019].map((y) => (
        <group key={y} position={[0, y, 0.056]}>
          <mesh geometry={boxGeometry(0.009, 0.005, 0.002, 0.001)} material={materials.brass} />
          <mesh geometry={planeGeometry(0.005, 0.001)} material={materials.recess} position={[0, 0, 0.0011]} />
        </group>
      ))}
      <Screw position={[0, 0.029, 0.0465]} radius={0.0015} />
      <Screw position={[0, -0.029, 0.0465]} radius={0.0015} />
    </group>
  )
}
