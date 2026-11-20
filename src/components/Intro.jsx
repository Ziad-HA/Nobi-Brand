import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react'
import { useLocation } from 'react-router-dom'
import './IntroCinematic.css'

const STORAGE_KEY = 'nobi-intro-v4'
const HOLD_MS = 2400 // total time before the hand-off to the hero starts
const EXIT_MS = 700

function canShowIntro(pathname) {
  if (pathname !== '/') return false
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return false
  try {
    return !sessionStorage.getItem(STORAGE_KEY)
  } catch {
    return true
  }
}

export default function Intro() {
  const { pathname } = useLocation()
  const [phase, setPhase] = useState(() => (canShowIntro(pathname) ? 'play' : 'done'))
  const timers = useRef([])
  const rootRef = useRef(null)

  const finish = useCallback(() => {
    timers.current.forEach(window.clearTimeout)
    try {
      sessionStorage.setItem(STORAGE_KEY, '1')
    } catch {
      // Storage can be unavailable in private browsing.
    }
    window.dispatchEvent(new Event('nobi-intro-end'))
    setPhase('done')
  }, [])

  const startExit = useCallback(() => {
    setPhase((p) => {
      if (p !== 'play') return p
      timers.current.push(window.setTimeout(finish, EXIT_MS))
      return 'exit'
    })
  }, [finish])

  // Align the intro to the hero's real left edge so the type hands off in the same place.
  useLayoutEffect(() => {
    if (phase !== 'play') return undefined
    let tries = 0
    let raf = 0
    const measure = () => {
      const copy = document.querySelector('.home-hero-copy')
      if (copy && rootRef.current) {
        const left = copy.offsetLeft + (parseFloat(getComputedStyle(copy).paddingLeft) || 0)
        rootRef.current.style.setProperty('--hx', `${Math.max(left, 18)}px`)
        return
      }
      if (tries++ < 30) raf = window.requestAnimationFrame(measure)
    }
    measure()
    return () => window.cancelAnimationFrame(raf)
  }, [phase])

  useEffect(() => {
    if (phase !== 'play') return undefined
    document.documentElement.classList.add('nobi-intro-active')
    const t = window.setTimeout(startExit, HOLD_MS)
    timers.current.push(t)
    return () => window.clearTimeout(t)
  }, [phase, startExit])

  // The hero plays its own arrival animation while the intro fades out.
  useEffect(() => {
    if (phase !== 'exit') return undefined
    document.body.classList.add('nobi-site-reveal')
    const clear = window.setTimeout(() => document.body.classList.remove('nobi-site-reveal'), EXIT_MS + 1400)
    return () => window.clearTimeout(clear)
  }, [phase])

  useEffect(() => {
    if (phase !== 'done') return undefined
    document.documentElement.classList.remove('nobi-intro-active')
    return undefined
  }, [phase])

  useEffect(() => () => timers.current.forEach(window.clearTimeout), [])

  if (phase === 'done') return null

  return (
    <section
      ref={rootRef}
      className={`nobi-intro phase-${phase}`}
      aria-label="UNSEEN introduction"
      onClick={startExit}
    >
      <i className="nobi-intro-grain" aria-hidden="true" />

      <p className="nobi-intro-stamp" aria-hidden="true">UNSEEN / 09</p>

      <h1 className="nobi-intro-statement" aria-label="The world is yours">
        <span className="nobi-intro-eyebrow" aria-hidden="true">
          <i />
          <span>SEASON 04 · NIGHT SHIFT</span>
        </span>
        <span className="nobi-intro-mask" aria-hidden="true">
          <span className="nobi-intro-line">THE WORLD</span>
        </span>
        <span className="nobi-intro-mask" aria-hidden="true">
          <span className="nobi-intro-line volt" style={{ '--d': '.2s' }}>IS YOURS</span>
        </span>
        <b className="nobi-intro-count" aria-hidden="true" />
      </h1>

    </section>
  )
}
