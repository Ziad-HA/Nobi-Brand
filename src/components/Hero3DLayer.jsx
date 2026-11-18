import { lazy, Suspense, useEffect, useState } from 'react'

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
  const [nearViewport, setNearViewport] = useState(false)
  const [introDone, setIntroDone] = useState(false)

  // Never run WebGL underneath the intro video — it competes for the GPU and makes the intro stutter.
  useEffect(() => {
    if (!document.documentElement.classList.contains('nobi-intro-active')) {
      setIntroDone(true)
      return undefined
    }
    const onEnd = () => setIntroDone(true)
    window.addEventListener('nobi-intro-end', onEnd, { once: true })
    return () => window.removeEventListener('nobi-intro-end', onEnd)
  }, [])

  useEffect(() => {
    if (!ok || !introDone) return undefined
    const hero = document.querySelector('.home-hero')
    if (!hero || typeof IntersectionObserver === 'undefined') {
      setNearViewport(true)
      return undefined
    }
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setNearViewport(true)
        observer.disconnect()
      }
    }, { rootMargin: '240px 0px' })
    observer.observe(hero)
    return () => observer.disconnect()
  }, [ok, introDone])

  if (!ok || !introDone || !nearViewport) return null
  return (
    <Suspense fallback={null}>
      <Hero3D />
    </Suspense>
  )
}
