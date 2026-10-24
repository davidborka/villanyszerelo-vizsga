import { useEffect, useState } from 'react'
import { boxGeometry, cylinderGeometry } from './geometry'
import { Label, materials, Screw } from './shared'

/** Egyfázisú direkt fogyasztásmérő, alul 1–3–4–6 kapcsokkal, plombálható kapocsfedél nélkül (szerelés közben) */
export function Meter({ watts }: { watts: number }) {
  // impulzus-LED: 1000 imp/kWh → két villanás között 3600/P másodperc
  const [blink, setBlink] = useState(false)
  useEffect(() => {
    if (watts <= 0) return
    const period = Math.max(300, (3600 / watts) * 1000)
    const t = setInterval(() => (setBlink(true), setTimeout(() => setBlink(false), 120)), period)
    return () => clearInterval(t)
  }, [watts])
  return (
    <group dispose={null}>
      <mesh geometry={boxGeometry(0.09, 0.13, 0.05, 0.004)} material={materials.grey} position={[0, 0.005, 0.03]} castShadow />
      <mesh geometry={boxGeometry(0.06, 0.022, 0.002, 0.002)} material={materials.recess} position={[0, 0.035, 0.0555]} />
      <Label text={`${(watts / 1000).toFixed(3).replace('.', ',')} kW`} position={[0, 0.035, 0.0567]} width={0.05} height={0.014} bg="#9fc79a" fg="#0d240d" resolution={[256, 72]} />
      <Label text={'1F DIREKT\n230 V 5(60) A · 1000 imp/kWh'} position={[0, 0.008, 0.0556]} width={0.07} height={0.018} resolution={[384, 96]} />
      <mesh geometry={cylinderGeometry(0.0022, 0.002, 12)} material={blink ? materials.ledOn : materials.ledOff} position={[0.032, 0.012, 0.0565]} rotation={[Math.PI / 2, 0, 0]} />
      {/* kapocsléc */}
      <mesh geometry={boxGeometry(0.084, 0.024, 0.03, 0.002)} material={materials.darkGrey} position={[0, -0.05, 0.02]} />
      {[-0.03, -0.01, 0.01, 0.03].map((x, i) => (
        <group key={x}>
          <Screw position={[x, -0.05, 0.036]} radius={0.0035} material={materials.brass} />
          <Label text={['1', '3', '4', '6'][i]} position={[x, -0.034, 0.0362]} width={0.008} height={0.006} resolution={[64, 48]} />
        </group>
      ))}
    </group>
  )
}
