import { useMemo, type ReactNode } from 'react'
import * as THREE from 'three'
import { MODULE_W } from '../../sim/layout'
import { boxGeometry, cylinderGeometry, dinBodyGeometry, planeGeometry } from './geometry'

export const materials = {
  white: new THREE.MeshStandardMaterial({ color: '#f4f4f0', roughness: 0.42 }),
  porcelain: new THREE.MeshStandardMaterial({ color: '#fbfbf7', roughness: 0.28 }),
  grey: new THREE.MeshStandardMaterial({ color: '#c9cdd1', roughness: 0.58 }),
  darkGrey: new THREE.MeshStandardMaterial({ color: '#60676d', roughness: 0.55 }),
  black: new THREE.MeshStandardMaterial({ color: '#202326', roughness: 0.38 }),
  recess: new THREE.MeshStandardMaterial({ color: '#111518', roughness: 0.8 }),
  metal: new THREE.MeshStandardMaterial({ color: '#bdc3c8', metalness: 0.82, roughness: 0.28 }),
  brass: new THREE.MeshStandardMaterial({ color: '#c9a95c', metalness: 0.75, roughness: 0.3 }),
  blue: new THREE.MeshStandardMaterial({ color: '#315f9f', roughness: 0.38 }),
  green: new THREE.MeshStandardMaterial({ color: '#31964b', roughness: 0.4 }),
  yellow: new THREE.MeshStandardMaterial({ color: '#edc51c', roughness: 0.38 }),
  red: new THREE.MeshStandardMaterial({ color: '#b84035', roughness: 0.4 }),
  ledOn: new THREE.MeshStandardMaterial({ color: '#7dff8a', emissive: '#2bff4a', emissiveIntensity: 2.5 }),
  ledOff: new THREE.MeshStandardMaterial({ color: '#2b3a2d', roughness: 0.4 }),
}

const textureCache = new Map<string, THREE.CanvasTexture>()
const labelMaterials = new Map<string, THREE.MeshBasicMaterial>()

export function labelTexture(text: string, bg: string, fg: string, w: number, h: number) {
  const key = `${text}|${bg}|${fg}|${w}|${h}`
  let texture = textureCache.get(key)
  if (!texture) {
    const canvas = document.createElement('canvas')
    canvas.width = w
    canvas.height = h
    const context = canvas.getContext('2d')!
    context.fillStyle = bg
    context.fillRect(0, 0, w, h)
    context.fillStyle = fg
    context.font = `600 ${Math.floor(h * (text.includes('\n') ? 0.32 : 0.46))}px system-ui, sans-serif`
    context.textAlign = 'center'
    context.textBaseline = 'middle'
    text.split('\n').forEach((line, i, lines) => context.fillText(line, w / 2, h / 2 + (i - (lines.length - 1) / 2) * h * 0.36, w * 0.94))
    texture = new THREE.CanvasTexture(canvas)
    texture.colorSpace = THREE.SRGBColorSpace
    texture.anisotropy = 4
    textureCache.set(key, texture)
  }
  return texture
}

function labelMaterial(text: string, bg: string, fg: string, w: number, h: number) {
  const key = `${text}|${bg}|${fg}|${w}|${h}`
  let material = labelMaterials.get(key)
  if (!material) {
    material = new THREE.MeshBasicMaterial({ map: labelTexture(text, bg, fg, w, h), toneMapped: false })
    labelMaterials.set(key, material)
  }
  return material
}

export function Label({ text, position, width, height, bg = '#f7f7f3', fg = '#27313a', resolution = [256, 96] }: {
  text: string
  position: [number, number, number]
  width: number
  height: number
  bg?: string
  fg?: string
  resolution?: [number, number]
}) {
  const material = useMemo(() => labelMaterial(text, bg, fg, ...resolution), [text, bg, fg, resolution])
  return <mesh geometry={planeGeometry(width, height)} material={material} position={position} />
}

export function Screw({ position, radius = 0.0035, material = materials.metal }: {
  position: [number, number, number]
  radius?: number
  material?: THREE.Material
}) {
  const [x, y, z] = position
  return (
    <group position={[x, y, z]}>
      <mesh geometry={cylinderGeometry(radius * 1.28, 0.0016, 20)} material={materials.recess} rotation={[Math.PI / 2, 0, 0]} position={[0, 0, -0.0012]} />
      <mesh geometry={cylinderGeometry(radius, 0.002, 20)} material={material} rotation={[Math.PI / 2, 0, 0]} />
      <mesh geometry={boxGeometry(radius * 1.45, radius * 0.22, 0.0003)} material={materials.recess} position={[0, 0, 0.0011]} />
      <mesh geometry={boxGeometry(radius * 0.22, radius * 1.45, 0.0003)} material={materials.recess} position={[0, 0, 0.0011]} />
    </group>
  )
}

export function TerminalScrews({ offsets, z, radius }: { offsets: readonly (readonly [number, number])[]; z: number; radius?: number }) {
  return <>{offsets.map(([x, y], i) => <Screw key={i} position={[x, y, z]} radius={radius} />)}</>
}

export function DinShell({ modules, terminals, children }: { modules: number; terminals: readonly (readonly [number, number])[]; children: ReactNode }) {
  const w = modules * MODULE_W
  return (
    <group dispose={null}>
      <mesh geometry={dinBodyGeometry(modules)} material={materials.white} position={[0, 0, 0.0415]} castShadow />
      <mesh geometry={boxGeometry(w * 0.78, 0.052, 0.003, 0.001)} material={materials.porcelain} position={[0, 0, 0.0735]} />
      <mesh geometry={boxGeometry(w * 0.94, 0.018, 0.001)} material={materials.porcelain} position={[0, 0.0335, 0.0745]} />
      <mesh geometry={boxGeometry(w * 0.94, 0.018, 0.001)} material={materials.porcelain} position={[0, -0.0335, 0.0745]} />
      <mesh geometry={boxGeometry(w * 0.56, 0.012, 0.006)} material={materials.darkGrey} position={[0, 0, 0.007]} />
      <TerminalScrews offsets={terminals} z={0.075} radius={modules === 1 ? 0.003 : 0.0034} />
      {children}
    </group>
  )
}
