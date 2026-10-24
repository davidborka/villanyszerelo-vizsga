import * as THREE from 'three'
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js'
import { BOX_SIZE, MODULE_W, type TrunkPiece } from '../../sim/layout'
import type { Cut } from '../../sim/store'

const geometries = new Map<string, THREE.BufferGeometry>()

function cached<T extends THREE.BufferGeometry>(key: string, create: () => T): T {
  let geometry = geometries.get(key) as T | undefined
  if (!geometry) {
    geometry = create()
    geometries.set(key, geometry)
  }
  return geometry
}

export function boxGeometry(w: number, h: number, d: number, radius = 0) {
  return cached(`box:${w}:${h}:${d}:${radius}`, () => radius > 0 ? new RoundedBoxGeometry(w, h, d, 2, radius) : new THREE.BoxGeometry(w, h, d))
}

export function planeGeometry(w: number, h: number) {
  return cached(`plane:${w}:${h}`, () => new THREE.PlaneGeometry(w, h))
}

export function cylinderGeometry(radius: number, depth: number, segments = 20, topRadius = radius) {
  return cached(`cylinder:${radius}:${topRadius}:${depth}:${segments}`, () => new THREE.CylinderGeometry(topRadius, radius, depth, segments))
}

export function dinBodyGeometry(modules: number) {
  return boxGeometry(MODULE_W * modules, 0.085, 0.065)
}

export function surfaceBoxGeometry() {
  return boxGeometry(BOX_SIZE, BOX_SIZE, 0.04, 0.005)
}

function trunkCrossSection(p: TrunkPiece, lid: boolean) {
  const hw = p.width / 2
  const wall = Math.min(0.0014, p.width / 8)
  const shape = new THREE.Shape()
  if (lid) {
    const thickness = 0.0012
    shape.moveTo(-hw, p.height - thickness)
    shape.lineTo(hw, p.height - thickness)
    shape.lineTo(hw, p.height)
    shape.lineTo(-hw, p.height)
  } else {
    shape.moveTo(-hw, 0)
    shape.lineTo(hw, 0)
    shape.lineTo(hw, p.height)
    shape.lineTo(hw - wall, p.height)
    shape.lineTo(hw - wall, wall)
    shape.lineTo(-hw + wall, wall)
    shape.lineTo(-hw + wall, p.height)
    shape.lineTo(-hw, p.height)
  }
  shape.closePath()
  return shape
}

export function trunkProfileGeometry(p: TrunkPiece, cut: Cut | undefined, lid = false) {
  const dx = p.b[0] - p.a[0]
  const dy = p.b[1] - p.a[1]
  const length = Math.hypot(dx, dy)
  const d: [number, number] = [dx / length, dy / length]
  const n: [number, number] = Math.abs(dx) < 1e-6 ? [1, 0] : [0, 1]
  const hw = p.width / 2
  const len = cut?.len ?? p.len
  const ends = cut?.ends ?? p.ends
  const outerStart = p.ends[0] === 45 ? -hw : 0
  const innerStart = outerStart + (ends[0] === 45 ? p.width : 0)
  const outerEnd = outerStart + len
  const innerEnd = outerEnd - (ends[1] === 45 ? p.width : 0)
  const startShift = innerStart - outerStart
  const endShift = innerEnd - outerEnd
  const geometry = new THREE.ExtrudeGeometry(trunkCrossSection(p, lid), { depth: len, bevelEnabled: false, curveSegments: 1 })
  const position = geometry.attributes.position as THREE.BufferAttribute
  for (let i = 0; i < position.count; i++) {
    const side = position.getX(i)
    const z = position.getY(i)
    const along = position.getZ(i)
    const u = outerStart + along + ((hw - side) / p.width) * (startShift + (along / len) * (endShift - startShift))
    position.setXYZ(i, p.a[0] + d[0] * u + n[0] * side, p.a[1] + d[1] * u + n[1] * side, z)
  }
  position.needsUpdate = true
  geometry.computeVertexNormals()
  geometry.computeBoundingBox()
  return geometry
}

export function trunkFootprintGeometry(p: TrunkPiece, cut: Cut | undefined) {
  const dx = p.b[0] - p.a[0]
  const dy = p.b[1] - p.a[1]
  const length = Math.hypot(dx, dy)
  const d = [dx / length, dy / length]
  const n = Math.abs(dx) < 1e-6 ? [1, 0] : [0, 1]
  const hw = p.width / 2
  const len = cut?.len ?? p.len
  const ends = cut?.ends ?? p.ends
  const outerStart = p.ends[0] === 45 ? -hw : 0
  const innerStart = outerStart + (ends[0] === 45 ? p.width : 0)
  const outerEnd = outerStart + len
  const innerEnd = outerEnd - (ends[1] === 45 ? p.width : 0)
  const pt = (u: number, s: number) => new THREE.Vector2(p.a[0] + d[0] * u + n[0] * s * hw, p.a[1] + d[1] * u + n[1] * s * hw)
  const shape = new THREE.Shape([pt(outerStart, 1), pt(outerEnd, 1), pt(innerEnd, -1), pt(innerStart, -1)])
  return new THREE.ExtrudeGeometry(shape, { depth: p.height, bevelEnabled: false })
}
