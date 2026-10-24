import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { boxGeometry, planeGeometry } from './geometry'
import { HoverOutline } from './interaction'
import { materials, Screw } from './shared'

const iconMaterials = new Map<string, THREE.MeshBasicMaterial>()

function rockerIcon(variant: string) {
  let material = iconMaterials.get(variant)
  if (material) return material
  const canvas = document.createElement('canvas')
  canvas.width = 256
  canvas.height = 256
  const g = canvas.getContext('2d')!
  g.fillStyle = '#fbfbf7'
  g.fillRect(0, 0, 256, 256)
  g.strokeStyle = '#5b646a'
  g.fillStyle = '#5b646a'
  g.lineWidth = 7
  g.lineCap = 'round'
  const dot = (x: number, y: number) => { g.beginPath(); g.arc(x, y, 8, 0, Math.PI * 2); g.fill() }
  const line = (points: number[][]) => { g.beginPath(); g.moveTo(points[0][0], points[0][1]); points.slice(1).forEach(([x, y]) => g.lineTo(x, y)); g.stroke() }
  if (variant === '101') {
    dot(55, 105); dot(201, 105); line([[55, 105], [174, 67]])
  } else if (variant === '105') {
    dot(48, 128); dot(205, 72); dot(205, 184); line([[48, 128], [105, 128], [181, 82]]); line([[105, 128], [181, 174]])
  } else if (variant === '106') {
    dot(48, 128); dot(205, 72); dot(205, 184); line([[48, 128], [105, 128], [181, 82]])
  } else if (variant === 'pb') {
    g.beginPath(); g.arc(128, 110, 52, 0, Math.PI * 2); g.stroke(); dot(128, 110)
  } else {
    dot(66, 72); dot(66, 184); dot(190, 72); dot(190, 184); line([[66, 72], [190, 184]]); line([[66, 184], [190, 72]])
  }
  g.font = '600 30px system-ui, sans-serif'
  g.textAlign = 'center'
  g.fillText(variant, 128, 238)
  const texture = new THREE.CanvasTexture(canvas)
  texture.colorSpace = THREE.SRGBColorSpace
  texture.anisotropy = 4
  material = new THREE.MeshBasicMaterial({ map: texture, toneMapped: false })
  iconMaterials.set(variant, material)
  return material
}

export function SwitchRocker({ variant, state, highlighted = false }: { variant: '101' | '105' | '106' | '107' | 'pb'; state: number; highlighted?: boolean }) {
  const material = useMemo(() => rockerIcon(variant), [variant])
  const rocker = useRef<THREE.Group>(null)
  const angle = variant === 'pb' ? 0 : variant === '105' ? 0.12 - state * 0.08 : state ? -0.12 : 0.12
  useFrame((_, delta) => {
    if (!rocker.current) return
    rocker.current.rotation.x = THREE.MathUtils.damp(rocker.current.rotation.x, angle, 18, delta)
    rocker.current.position.z = THREE.MathUtils.damp(rocker.current.position.z, variant === 'pb' && state ? 0.047 : 0.05, 24, delta)
  })
  return (
    <group dispose={null}>
      <mesh geometry={boxGeometry(0.07, 0.07, 0.006, 0.005)} material={materials.porcelain} position={[0, 0, 0.043]} castShadow>
        <HoverOutline active={highlighted} />
      </mesh>
      <mesh geometry={boxGeometry(0.052, 0.052, 0.002, 0.003)} material={materials.grey} position={[0, 0, 0.047]} />
      <group ref={rocker} position={[0, 0, 0.05]} rotation={[angle, 0, 0]}>
        <mesh geometry={boxGeometry(0.047, 0.047, 0.006, 0.003)} material={materials.porcelain} />
        <mesh geometry={planeGeometry(0.034, 0.034)} material={material} position={[0, 0, 0.0032]} />
      </group>
      <Screw position={[-0.027, 0.027, 0.0465]} radius={0.0016} />
      <Screw position={[0.027, -0.027, 0.0465]} radius={0.0016} />
    </group>
  )
}
