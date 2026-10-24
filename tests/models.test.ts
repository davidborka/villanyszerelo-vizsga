import { expect, test } from 'bun:test'
import { BOX_SIZE, MODULE_W } from '../src/sim/layout'
import { TASKS } from '../src/sim/tasks'

const PIECES = TASKS.nyariKonyha.layout.pieces
import { dinBodyGeometry, surfaceBoxGeometry, trunkProfileGeometry } from '../src/scene/models/geometry'

function sizeOf(geometry: ReturnType<typeof dinBodyGeometry>) {
  geometry.computeBoundingBox()
  return geometry.boundingBox!.getSize(geometry.boundingBox!.min.clone())
}

test('DIN body is exactly one 18 mm module wide, 85 mm high and 65 mm deep', () => {
  const size = sizeOf(dinBodyGeometry(1))
  expect(size.x).toBeCloseTo(MODULE_W, 8)
  expect(size.y).toBeCloseTo(0.085, 8)
  expect(size.z).toBeCloseTo(0.065, 8)
})

test('surface box keeps the exact 70 by 70 by 40 mm envelope', () => {
  const size = sizeOf(surfaceBoxGeometry())
  expect(size.x).toBeCloseTo(BOX_SIZE, 8)
  expect(size.y).toBeCloseTo(BOX_SIZE, 8)
  expect(size.z).toBeCloseTo(0.04, 8)
})

test('trunking extrusion preserves the existing 45 degree mitre outline', () => {
  const geometry = trunkProfileGeometry(PIECES.find((p) => p.id === 'H1')!, undefined)
  const positions = geometry.attributes.position
  const actual = new Set<string>()
  for (let i = 0; i < positions.count; i++) {
    if (Math.abs(positions.getZ(i)) < 1e-8) actual.add(`${positions.getX(i).toFixed(5)},${positions.getY(i).toFixed(5)}`)
  }
  for (const point of [[0.06, 0.54], [1.38, 0.54], [1.34, 0.5], [0.06, 0.5]]) {
    expect(actual.has(`${point[0].toFixed(5)},${point[1].toFixed(5)}`)).toBe(true)
  }
})
