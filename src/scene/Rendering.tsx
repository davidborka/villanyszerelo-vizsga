import { PerformanceMonitor, SoftShadows } from '@react-three/drei'
import { EffectComposer, N8AO, SelectiveBloom, SMAA, Vignette } from '@react-three/postprocessing'
import { useThree } from '@react-three/fiber'
import { useEffect, useState, type RefObject } from 'react'
import type { DirectionalLight } from 'three'
import { qualityStep } from './quality'

export function Rendering({ keyLight }: { keyLight: RefObject<DirectionalLight | null> }) {
  const setDpr = useThree((s) => s.setDpr)
  const [quality, setQuality] = useState(() => qualityStep(2, 'incline'))
  useEffect(() => setDpr(quality.dpr), [quality.dpr, setDpr])
  return (
    <>
      <SoftShadows size={20} samples={8} focus={0.35} />
      <PerformanceMonitor
        onDecline={() => setQuality((q) => qualityStep(q.level, 'decline'))}
        onIncline={() => setQuality((q) => qualityStep(q.level, 'incline'))}
      />
      <EffectComposer multisampling={0}>
        <N8AO enabled={quality.ao} aoRadius={0.22} intensity={1.15} distanceFalloff={0.6} halfRes />
        <SelectiveBloom lights={[keyLight]} mipmapBlur intensity={0.42} luminanceThreshold={0.8} luminanceSmoothing={0.15} ignoreBackground />
        <SMAA />
        <Vignette eskil={false} offset={0.22} darkness={0.32} />
      </EffectComposer>
    </>
  )
}
