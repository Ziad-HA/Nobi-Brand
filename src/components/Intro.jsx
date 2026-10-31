import { useEffect, useLayoutEffect, useState } from 'react'
import { useLocation } from 'react-router-dom'

const KEY = 'nobi-intro'
const DURATION = 2200

const shouldPlay = (pathname) => {
  if (pathname !== '/') return false
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return false
  try {
    return !sessionStorage.getItem(KEY)
  } catch {
    return true
  }
}

export default function Intro() {
  const { pathname } = useLocation()
  const [phase, setPhase] = useState(() => (shouldPlay(pathname) ? 'play' : 'done'))
  const [progress, setProgress] = useState(0)

  useLayoutEffect(() => {
    if (phase !== 'play') return
    document.documentElement.classList.add('intro-playing')
    document.body.style.overflow = 'hidden'
    return () => {
      document.documentElement.classList.remove('intro-playing')
      document.body.style.overflow = ''
    }
  }, [phase])

  useEffect(() => {
    if (phase !== 'play') return
    const start = performance.now()
    let raf
    const tick = (now) => {
      const p = Math.min(Math.max((now - start) / DURATION, 0), 1)
      setProgress(Math.round((1 - Math.pow(1 - p, 3)) * 100))
      if (p < 1) raf = requestAnimationFrame(tick)
      else setPhase('leave')
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [phase])

  useEffect(() => {
    if (phase !== 'leave') return
    try {
      sessionStorage.setItem(KEY, '1')
    } catch {
      /* ignore */
    }
    const id = setTimeout(() => setPhase('done'), 1000)
    return () => clearTimeout(id)
  }, [phase])

  if (phase === 'done') return null

  const skip = () => {
    if (phase !== 'play') return
    setProgress(100)
    setPhase('leave')
  }

  return (
    <div
      className={`intro ${phase === 'leave' ? 'is-leaving' : ''}`}
      onClick={skip}
      role="presentation"
    >
      <p className="eyebrow">Season 04 · Night shift</p>
      <div className="intro-logo" aria-label="Nobi">
        {'NOBI'.split('').map((c, i) => (
          <span key={i} style={{ animationDelay: `${0.15 + i * 0.12}s` }}>
            {c}
          </span>
        ))}
      </div>
      <p className="intro-skip muted">Click to skip</p>
      <div className="intro-count">{String(progress).padStart(3, '0')}</div>
      <div className="intro-bar">
        <i style={{ transform: `scaleX(${progress / 100})` }} />
      </div>
    </div>
  )
}