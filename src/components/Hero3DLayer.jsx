import { lazy, Suspense, useState } from 'react'

const Hero3D = lazy(() => import('./Hero3D'))

// WebGL is optional: skip it when the browser can't do it or the user asked to save data,
// so the photo hero always works on its own.
function canUseWebGL() {
  if (typeof window === 'undefined') return false
  if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return false
  if (navigator.connection?.saveData) return false
  if (navigator.hardwareConcurrency && navigator.hardwareConcurrency <= 2) return false
  try {
    const c = document.createElement('canvas')
    return Boolean(c.getContext('webgl2') || c.getContext('webgl'))
  } catch {
    return false
  }
}

export default function Hero3DLayer() {
  const [ok] = useState(canUseWebGL)
  if (!ok) return null
  return (
    <Suspense fallback={null}>
      <Hero3D />
    </Suspense>
  )
}
