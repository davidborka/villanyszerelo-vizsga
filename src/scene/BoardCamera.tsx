import { CameraControls, type CameraControlsImpl } from '@react-three/drei'
import { useThree } from '@react-three/fiber'
import { useEffect, useRef } from 'react'
import * as THREE from 'three'
import { BOARD, type Vec2 } from '../sim/layout'
import { useGame } from '../sim/store'
import { TASKS } from '../sim/tasks'
import { fitDistance, focusTarget } from './cameraMath'

export function BoardCamera({ focusPoint }: { focusPoint: Vec2 | null }) {
  const controls = useRef<CameraControlsImpl>(null)
  const { camera, size } = useThree()
  const selectedPiece = useGame((s) => s.selectedPiece)
  const selectedMount = useGame((s) => s.selectedMount)
  const layout = useGame((s) => TASKS[s.taskId].layout)
  const distance = fitDistance(size.width / size.height, (camera as THREE.PerspectiveCamera).fov)

  useEffect(() => {
    const c = controls.current
    if (!c) return
    c.minDistance = 0.18
    c.maxDistance = Math.max(2.5, distance * 1.25)
    c.minPolarAngle = Math.PI * 0.27
    c.maxPolarAngle = Math.PI * 0.64
    c.minAzimuthAngle = -0.9
    c.maxAzimuthAngle = 0.9
    c.smoothTime = 0.32
    c.draggingSmoothTime = 0.1
    c.dollyToCursor = true
    c.setBoundary(new THREE.Box3(new THREE.Vector3(0.04, 0.04, 0), new THREE.Vector3(BOARD.w - 0.04, BOARD.h - 0.04, 0.12)))
  }, [distance])

  useEffect(() => {
    const c = controls.current
    if (!c) return
    const piece = layout.pieces.find((p) => p.id === selectedPiece)
    const mount = layout.mounts.find((m) => m.id === selectedMount)
    const point = piece ? [(piece.a[0] + piece.b[0]) / 2, (piece.a[1] + piece.b[1]) / 2] as Vec2 : mount?.pos
    if (!point) {
      void c.setLookAt(BOARD.w / 2, BOARD.h / 2, distance, BOARD.w / 2, BOARD.h / 2, 0, true)
      return
    }
    const pose = focusTarget(point, piece ? 0.44 : 0.32)
    void c.setLookAt(...pose.position, ...pose.target, true)
  }, [selectedPiece, selectedMount, layout, distance])

  useEffect(() => {
    if (!focusPoint || !controls.current) return
    const pose = focusTarget(focusPoint, 0.38)
    void controls.current.setLookAt(...pose.position, ...pose.target, true)
  }, [focusPoint])

  return <CameraControls ref={controls} makeDefault />
}
