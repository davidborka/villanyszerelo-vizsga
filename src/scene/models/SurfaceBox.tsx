import { BOX_SIZE } from '../../sim/layout'
import { boxGeometry, cylinderGeometry, surfaceBoxGeometry } from './geometry'
import { HoverOutline } from './interaction'
import { materials, TerminalScrews } from './shared'

export function SurfaceBox({ terminalOffsets = [], highlighted = false }: { terminalOffsets?: readonly (readonly [number, number])[]; highlighted?: boolean }) {
  return (
    <group dispose={null}>
      <mesh geometry={surfaceBoxGeometry()} material={materials.white} position={[0, 0, 0.02]} castShadow>
        <HoverOutline active={highlighted} />
      </mesh>
      <mesh geometry={boxGeometry(BOX_SIZE - 0.012, BOX_SIZE - 0.012, 0.002, 0.004)} material={materials.grey} position={[0, 0, 0.039]} />
      {[-0.018, 0.018].map((x) => <mesh key={`t${x}`} geometry={cylinderGeometry(0.006, 0.0012, 20)} material={materials.grey} rotation={[Math.PI / 2, 0, 0]} position={[x, BOX_SIZE / 2, 0.02]} />)}
      {[-0.018, 0.018].map((x) => <mesh key={`b${x}`} geometry={cylinderGeometry(0.006, 0.0012, 20)} material={materials.grey} rotation={[Math.PI / 2, 0, 0]} position={[x, -BOX_SIZE / 2, 0.02]} />)}
      {[-0.018, 0.018].map((y) => <mesh key={`l${y}`} geometry={cylinderGeometry(0.006, 0.0012, 20)} material={materials.grey} rotation={[0, Math.PI / 2, 0]} position={[-BOX_SIZE / 2, y, 0.02]} />)}
      {[-0.018, 0.018].map((y) => <mesh key={`r${y}`} geometry={cylinderGeometry(0.006, 0.0012, 20)} material={materials.grey} rotation={[0, Math.PI / 2, 0]} position={[BOX_SIZE / 2, y, 0.02]} />)}
      <TerminalScrews offsets={terminalOffsets} z={0.042} />
    </group>
  )
}
