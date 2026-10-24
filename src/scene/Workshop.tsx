import { useMemo } from 'react'
import * as THREE from 'three'
import { Select } from '@react-three/postprocessing'
import { boxGeometry, cylinderGeometry } from './models/geometry'
import { Label } from './models/shared'

function surfaceTexture(kind: 'concrete' | 'paint' | 'bench') {
  const canvas = document.createElement('canvas')
  canvas.width = 512
  canvas.height = 512
  const g = canvas.getContext('2d')!
  let seed = kind === 'concrete' ? 71 : kind === 'paint' ? 137 : 251
  const random = () => {
    seed = (seed * 16807) % 2147483647
    return (seed - 1) / 2147483646
  }
  g.fillStyle = kind === 'concrete' ? '#777b7c' : kind === 'paint' ? '#7d8987' : '#383b3b'
  g.fillRect(0, 0, 512, 512)
  for (let i = 0; i < 14000; i++) {
    const shade = Math.floor(70 + random() * 100)
    const alpha = kind === 'bench' ? 0.055 : 0.035 + random() * 0.06
    g.fillStyle = `rgba(${shade},${shade + (kind === 'paint' ? 5 : 0)},${shade},${alpha})`
    const size = kind === 'concrete' ? 0.5 + random() * 2.5 : 0.5 + random() * 1.5
    g.fillRect(random() * 512, random() * 512, size, size)
  }
  if (kind === 'paint') {
    g.strokeStyle = 'rgba(34,42,42,.16)'
    g.lineWidth = 2
    for (const y of [0, 256, 511]) {
      g.beginPath()
      g.moveTo(0, y)
      g.lineTo(512, y)
      g.stroke()
    }
  }
  if (kind === 'bench') {
    for (let i = 0; i < 90; i++) {
      const y = random() * 512
      g.strokeStyle = `rgba(210,220,215,${random() * 0.05})`
      g.beginPath()
      g.moveTo(0, y)
      g.lineTo(512, y + random() * 3)
      g.stroke()
    }
  }
  const texture = new THREE.CanvasTexture(canvas)
  texture.colorSpace = THREE.SRGBColorSpace
  texture.wrapS = texture.wrapT = THREE.RepeatWrapping
  texture.repeat.set(kind === 'paint' ? 3 : 4, kind === 'paint' ? 2 : 4)
  texture.anisotropy = 4
  return texture
}

export function Workshop() {
  const concrete = useMemo(() => surfaceTexture('concrete'), [])
  const paint = useMemo(() => surfaceTexture('paint'), [])
  const bench = useMemo(() => surfaceTexture('bench'), [])
  return (
    <group>
      <mesh position={[0.75, 1.25, -0.13]} receiveShadow>
        <boxGeometry args={[6, 3.2, 0.12]} />
        <meshStandardMaterial map={paint} color="#a8b0aa" roughness={0.96} />
      </mesh>
      <mesh position={[0.75, -0.37, 0.6]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[8, 7]} />
        <meshStandardMaterial map={concrete} color="#929694" roughness={0.98} />
      </mesh>
      <mesh position={[0.75, -0.115, 0.37]} receiveShadow castShadow>
        <boxGeometry args={[3.15, 0.11, 1.2]} />
        <meshStandardMaterial map={bench} color="#656967" roughness={0.72} metalness={0.12} />
      </mesh>
      <mesh geometry={boxGeometry(3.15, 0.17, 0.055, 0.008)} position={[0.75, -0.19, 0.96]}>
        <meshStandardMaterial color="#272c2d" roughness={0.48} metalness={0.45} />
      </mesh>
      <mesh geometry={boxGeometry(0.025, 1.55, 0.025, 0.004)} position={[1.62, 0.72, -0.045]}>
        <meshStandardMaterial color="#b9bcb5" roughness={0.58} />
      </mesh>
      <mesh geometry={boxGeometry(0.12, 0.17, 0.055, 0.008)} position={[1.62, 0.34, -0.025]}>
        <meshStandardMaterial color="#dddcd2" roughness={0.6} />
      </mesh>
      <Label text="VIZSGA MŰHELY" position={[1.63, 0.93, -0.061]} width={0.23} height={0.065} bg="#d7d6c8" fg="#343d3c" resolution={[384, 108]} />
      <group position={[0.75, 1.23, 0.15]}>
        <mesh geometry={boxGeometry(1.12, 0.045, 0.19, 0.008)} castShadow>
          <meshStandardMaterial color="#c8cbc6" metalness={0.55} roughness={0.35} />
        </mesh>
        <Select enabled>
          <group>
            {[-0.052, 0.052].map((z) => (
              <mesh key={z} geometry={cylinderGeometry(0.013, 0.94, 16)} rotation={[0, 0, Math.PI / 2]} position={[0, -0.029, z]}>
                <meshStandardMaterial color="#f4f7e9" emissive="#e5f2dc" emissiveIntensity={1.8} roughness={0.25} />
              </mesh>
            ))}
          </group>
        </Select>
        <pointLight position={[0, -0.08, 0.16]} color="#e6f1df" intensity={1.1} distance={3.2} decay={2} />
      </group>
    </group>
  )
}
