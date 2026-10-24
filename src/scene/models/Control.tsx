import type { ThreeEvent } from '@react-three/fiber'
import { Select } from '@react-three/postprocessing'
import { boxGeometry, cylinderGeometry } from './geometry'
import { DinShell, Label, materials } from './shared'

/** Vezérlő DIN-készülék: lépcsőházi automata (LA) vagy impulzusrelé (IR), állapotjelző LED-del */
export function Control({ kind, on, onClick }: { kind: 'timer' | 'ir'; on: boolean; onClick?: (e: ThreeEvent<MouseEvent>) => void }) {
  return (
    <DinShell modules={1} terminals={[[-0.0045, 0.032], [0.0045, 0.032], [-0.0045, -0.032], [0.0045, -0.032]]}>
      <Label text={kind === 'timer' ? 'LA' : 'IR'} position={[0, 0.016, 0.0752]} width={0.012} height={0.007} fg="#172c46" resolution={[128, 96]} />
      <Label text={kind === 'timer' ? '0,5–20 min' : 'A1-A2 230V'} position={[0, -0.02, 0.0752]} width={0.014} height={0.004} resolution={[256, 64]} />
      <Select enabled={on}>
        <mesh geometry={cylinderGeometry(0.0016, 0.002, 12)} material={on ? materials.ledOn : materials.ledOff} position={[0, 0.006, 0.0762]} rotation={[Math.PI / 2, 0, 0]} />
      </Select>
      {kind === 'timer' ? (
        <mesh geometry={cylinderGeometry(0.0035, 0.003, 16)} material={materials.grey} position={[0, -0.006, 0.0765]} rotation={[Math.PI / 2, 0, 0]} onClick={onClick} />
      ) : (
        <mesh geometry={boxGeometry(0.007, 0.006, 0.004, 0.001)} material={materials.black} position={[0, -0.006, 0.077]} onClick={onClick} />
      )}
    </DinShell>
  )
}
