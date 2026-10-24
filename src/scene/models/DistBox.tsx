import { RAIL_TERMS } from '../../sim/circuit'
import { DIST, DIN_Y } from '../../sim/layout'
import { boxGeometry, cylinderGeometry } from './geometry'
import { Label, materials, Screw } from './shared'

export function DistBox({ feed = true }: { feed?: boolean }) {
  const [, cy] = DIST.center
  const top = DIST.h / 2
  const railY = top - 0.035
  return (
    <group dispose={null}>
      <mesh geometry={boxGeometry(DIST.w, DIST.h, 0.008, 0.006)} material={materials.grey} position={[0, 0, 0.004]} receiveShadow />
      <mesh geometry={boxGeometry(DIST.w, 0.009, DIST.d, 0.003)} material={materials.white} position={[0, top - 0.0045, DIST.d / 2]} castShadow />
      <mesh geometry={boxGeometry(DIST.w, 0.009, DIST.d, 0.003)} material={materials.white} position={[0, -top + 0.0045, DIST.d / 2]} castShadow />
      <mesh geometry={boxGeometry(0.009, DIST.h - 0.012, DIST.d, 0.003)} material={materials.white} position={[-DIST.w / 2 + 0.0045, 0, DIST.d / 2]} castShadow />
      <mesh geometry={boxGeometry(0.009, DIST.h - 0.012, DIST.d, 0.003)} material={materials.white} position={[DIST.w / 2 - 0.0045, 0, DIST.d / 2]} castShadow />
      <mesh geometry={boxGeometry(DIST.w - 0.024, 0.012, 0.012, 0.002)} material={materials.porcelain} position={[0, top - 0.006, DIST.d - 0.006]} />
      <mesh geometry={boxGeometry(DIST.w - 0.04, 0.035, 0.008)} material={materials.metal} position={[0, DIN_Y - cy, 0.02]} />
      <mesh geometry={boxGeometry(DIST.w - 0.04, 0.004, 0.004)} material={materials.darkGrey} position={[0, DIN_Y - cy, 0.025]} />
      {Array.from({ length: 12 }, (_, i) => (
        <mesh key={i} geometry={boxGeometry(0.009, 0.004, 0.001)} material={materials.recess} position={[-0.126 + i * 0.023, DIN_Y - cy, 0.0248]} />
      ))}
      <mesh geometry={boxGeometry(RAIL_TERMS * 0.012 + 0.008, 0.016, 0.012, 0.002)} material={materials.blue} position={[-0.06 + ((RAIL_TERMS - 1) * 0.012) / 2, railY, 0.022]} />
      <mesh geometry={boxGeometry(RAIL_TERMS * 0.012 + 0.008, 0.016, 0.012, 0.002)} material={materials.green} position={[0.035 + ((RAIL_TERMS - 1) * 0.012) / 2, railY, 0.022]} />
      {Array.from({ length: RAIL_TERMS }, (_, i) => <Screw key={`N${i}`} position={[-0.06 + i * 0.012, railY, 0.03]} radius={0.0034} material={materials.brass} />)}
      {Array.from({ length: RAIL_TERMS }, (_, i) => <Screw key={`PE${i}`} position={[0.035 + i * 0.012, railY, 0.03]} radius={0.0034} material={materials.brass} />)}
      <Label text="N" position={[-0.03, railY + 0.015, 0.029]} width={0.009} height={0.006} fg="#1f5fd6" resolution={[64, 64]} />
      <Label text="PE" position={[0.065, railY + 0.015, 0.029]} width={0.014} height={0.006} fg="#25823b" resolution={[96, 64]} />
      {/* saját betáp csak akkor, ha nem mérőszekrényből kapja */}
      {feed && (
        <>
          <mesh geometry={boxGeometry(0.05, 0.02, 0.016, 0.002)} material={materials.darkGrey} position={[-DIST.w / 2 + 0.046, railY, 0.018]} />
          {[0, 1, 2].map((i) => <Screw key={i} position={[-DIST.w / 2 + 0.03 + i * 0.016, railY, 0.03]} radius={0.0036} material={materials.brass} />)}
          <mesh geometry={cylinderGeometry(0.007, 0.15, 20)} material={materials.black} position={[-DIST.w / 2 + 0.046, top + 0.075, 0.03]} />
          <Label text="BETÁP 230 V" position={[-DIST.w / 2 + 0.122, top + 0.11, 0.001]} width={0.12} height={0.03} bg="#fff7d6" fg="#7a5200" resolution={[256, 64]} />
        </>
      )}
    </group>
  )
}
