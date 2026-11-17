import { useEffect, useRef, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { playSoundEffect } from '../lib/soundEffects'

const STORAGE_KEY = 'nobi-intro-v2'

function canShowIntro(pathname) {
  if (pathname !== '/') return false
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return false
  if (navigator.connection?.saveData) return false
  if (navigator.hardwareConcurrency && navigator.hardwareConcurrency <= 2) return false

  try {
    return !sessionStorage.getItem(STORAGE_KEY)
  } catch {
    return true
  }
}

function WorldMap() {
  return (
    <svg
      className="nobi-intro-map"
      viewBox="0 0 720 420"
      role="img"
      aria-label="World map highlighting Egypt"
    >
      <defs>
        <pattern id="nobi-map-texture" width="5" height="5" patternUnits="userSpaceOnUse">
          <circle cx="1" cy="1" r=".65" fill="currentColor" opacity=".3" />
        </pattern>
      </defs>
      <g className="nobi-intro-continents" fill="url(#nobi-map-texture)" stroke="currentColor" strokeWidth="1.25" strokeLinejoin="round">
        <path d="M72 104 96 77 132 69 151 47 194 55 216 78 250 81 267 105 250 128 223 133 207 159 178 166 160 194 131 184 119 159 92 151 81 128Z" />
        <path d="m218 190 29 10 20 34-9 39-20 43-15 51-19-13-7-47-18-34 9-42Z" />
        <path d="m316 82 31-21 46 5 28-18 50 11 31 25 43 2 24 26-13 27-36 3-18 24-36-7-23 21-29-7-23-32-31-4-20-24-28 4-19-20Z" />
        <path d="m368 174 34-12 35 17 22 40-9 44-26 39-18 49-26-8-16-41-21-30 7-47Z" />
        <path d="m504 238 37-17 45 12 26 28-14 28-44 4-36-18Z" />
        <path d="m567 99 32-12 28 16-5 27-34 11-24-17Z" />
        <path d="m626 297 20-8 15 12-8 22-23 2-13-13Z" />
      </g>
      <path className="nobi-intro-egypt-shape" d="m430 158 24-5 13 9-4 20-19 7-17-12Z" />
      <path className="nobi-intro-egypt-shape" d="m451 191 17-3 9 13-6 17-15-2-8-13Z" opacity=".42" />
    </svg>
  )
}

export default function Intro() {
  const { pathname } = useLocation()
  const [phase, setPhase] = useState(() => (canShowIntro(pathname) ? 'intro' : 'done'))
  const timers = useRef([])
  const audioStarted = useRef(false)

  useEffect(() => {
    if (phase === 'done') return undefined

    document.documentElement.classList.add('nobi-intro-active')
    document.body.style.overflow = 'hidden'

    return () => {
      document.documentElement.classList.remove('nobi-intro-active')
      document.body.style.overflow = ''
    }
  }, [phase])

  useEffect(() => {
    if (phase === 'done') return undefined

    timers.current = [
      window.setTimeout(() => setPhase('search-left'), 350),
      window.setTimeout(() => setPhase('search-right'), 950),
      window.setTimeout(() => {
        setPhase('zoom')
        playSoundEffect('intro-zoom')
      }, 1550),
      window.setTimeout(() => {
        setPhase('egypt')
        playSoundEffect('intro-arrive')
      }, 2600),
      window.setTimeout(() => setPhase('statement'), 3500),
      window.setTimeout(() => setPhase('exit'), 4650),
      window.setTimeout(() => {
        try {
          sessionStorage.setItem(STORAGE_KEY, '1')
        } catch {
          // Storage can be unavailable in private browsing.
        }
        setPhase('done')
      }, 5100),
    ]

    return () => timers.current.forEach(window.clearTimeout)
  }, [])

  if (phase === 'done') return null

  return (
    <section
      className={`nobi-intro-v2 phase-${phase}`}
      aria-label="NOBI brand introduction"
      onPointerDown={() => {
        if (audioStarted.current) return
        audioStarted.current = true
        playSoundEffect('intro-start')
      }}
    >
      <header className="nobi-intro-header">
        <span className="nobi-intro-wordmark">NOBI<span>®</span></span>
        <span className="nobi-intro-edition">INDEPENDENT STREET CULTURE</span>
        <span className="nobi-intro-index">001 — 026</span>
      </header>

      <div className="nobi-intro-stage">
        <div className="nobi-intro-stage-top">
          <span>GLOBAL POSITIONING SYSTEM</span>
          <span className="nobi-intro-live"><i /> SCANNING THE WORLD</span>
        </div>

        <div className="nobi-intro-map-frame">
          <div className="nobi-intro-map-grid" />
          <div className="nobi-intro-map-crosshair crosshair-one" />
          <div className="nobi-intro-map-crosshair crosshair-two" />
          <div className="nobi-intro-map-viewport">
            <div className="nobi-intro-map-scene">
              <WorldMap />
              <div className="nobi-intro-target">
                <span className="nobi-intro-target-ring" />
                <span className="nobi-intro-target-dot" />
              </div>
              <div className="nobi-intro-egypt-label">EGYPT <span>31° 14′ N</span></div>
            </div>
          </div>
          <span className="nobi-intro-map-coordinate coordinate-left">30° 02′ E</span>
          <span className="nobi-intro-map-coordinate coordinate-right">N / 001</span>
        </div>

        <div className="nobi-intro-stage-bottom">
          <span>FROM EVERYWHERE</span>
          <span>TO SOMEWHERE</span>
        </div>
      </div>

      <div className="nobi-intro-statement">
        <span className="nobi-intro-statement-index">NOBI® — ORIGIN / 001</span>
        <h1>THE WORLD<br /><em>IS YOURS.</em></h1>
        <span className="nobi-intro-statement-rule" />
      </div>

      <footer className="nobi-intro-footer">
        <span>DESIGNED TO MOVE</span>
        <span>SCROLL LESS. LIVE MORE.</span>
      </footer>
    </section>
  )
}
