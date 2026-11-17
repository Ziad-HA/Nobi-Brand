import { useEffect, useRef, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { playSoundEffect } from '../lib/soundEffects'

const KEY = 'nobi-intro'

const shouldPlay = (pathname) => {
  if (pathname !== '/') return false
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return false
  if (navigator.connection?.saveData) return false
  if (navigator.hardwareConcurrency && navigator.hardwareConcurrency <= 2) return false
  try { return !sessionStorage.getItem(KEY) } catch { return true }
}

function WorldMap() {
  return (
    <div className="intro-map-wrap">
      <div className="intro-map-orbit intro-map-orbit-one" />
      <div className="intro-map-orbit intro-map-orbit-two" />
      <div className="intro-globe">
        <div className="intro-globe-grid" />
        <svg className="intro-world-svg" viewBox="0 0 720 420" role="img" aria-label="World map with Egypt highlighted">
          <defs>
            <pattern id="intro-map-dots" width="8" height="8" patternUnits="userSpaceOnUse">
              <circle cx="1.5" cy="1.5" r="1" fill="currentColor" opacity=".22" />
            </pattern>
          </defs>
          <g className="intro-land" fill="url(#intro-map-dots)" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round">
            <path d="M72 104 96 77 132 69 151 47 194 55 216 78 250 81 267 105 250 128 223 133 207 159 178 166 160 194 131 184 119 159 92 151 81 128Z" />
            <path d="m218 190 29 10 20 34-9 39-20 43-15 51-19-13-7-47-18-34 9-42Z" />
            <path d="m316 82 31-21 46 5 28-18 50 11 31 25 43 2 24 26-13 27-36 3-18 24-36-7-23 21-29-7-23-32-31-4-20-24-28 4-19-20Z" />
            <path d="m368 174 34-12 35 17 22 40-9 44-26 39-18 49-26-8-16-41-21-30 7-47Z" />
            <path d="m504 238 37-17 45 12 26 28-14 28-44 4-36-18Z" />
            <path d="m567 99 32-12 28 16-5 27-34 11-24-17Z" />
            <path d="m626 297 20-8 15 12-8 22-23 2-13-13Z" />
          </g>
          <path className="intro-egypt-highlight" d="m430 158 24-5 13 9-4 20-19 7-17-12Z" />
          <path className="intro-egypt-highlight" d="m451 191 17-3 9 13-6 17-15-2-8-13Z" opacity=".45" />
        </svg>
        <div className="intro-egypt-pin"><span /><b>EGYPT</b></div>
      </div>
    </div>
  )
}

export default function Intro() {
  const { pathname } = useLocation()
  const [phase, setPhase] = useState(() => (shouldPlay(pathname) ? 'map' : 'done'))
  const timers = useRef([])
  const audioUnlocked = useRef(false)

  useEffect(() => {
    if (phase === 'done') return
    document.documentElement.classList.add('intro-playing')
    document.body.style.overflow = 'hidden'
    return () => {
      document.documentElement.classList.remove('intro-playing')
      document.body.style.overflow = ''
    }
  }, [phase])

  useEffect(() => {
    if (phase === 'done') return
    timers.current = [
      setTimeout(() => setPhase('orbit'), 250),
      setTimeout(() => {
        setPhase('focus')
        playSoundEffect('intro-zoom')
      }, 2050),
      setTimeout(() => {
        setPhase('location')
        playSoundEffect('intro-arrive')
      }, 3300),
      setTimeout(() => setPhase('title'), 4150),
      setTimeout(() => setPhase('leave'), 5450),
      setTimeout(() => {
        try { sessionStorage.setItem(KEY, '1') } catch { /* ignore */ }
        setPhase('done')
      }, 5950),
    ]
    return () => timers.current.forEach(clearTimeout)
  }, [])

  if (phase === 'done') return null

  return (
    <div
      className={`intro intro-streetwear intro-phase-${phase}`}
      aria-label="NOBI intro"
      onPointerDown={() => {
        if (!audioUnlocked.current) {
          audioUnlocked.current = true
          playSoundEffect('intro-start')
        }
      }}
    >
      <div className="intro-noise" />
      <div className="intro-mini-brand">NOBI®</div>
      <WorldMap />
      {phase === 'location' && <div className="intro-location-hit">EGYPT ?</div>}
      {phase === 'title' && <h1 className="intro-world-title">THE WORLD IS YOURS</h1>}
    </div>
  )
}