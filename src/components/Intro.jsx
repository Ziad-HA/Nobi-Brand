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
    if (phase !== 'exit') return undefined

    document.body.classList.add('nobi-site-reveal')
    return () => document.body.classList.remove('nobi-site-reveal')
  }, [phase])

  useEffect(() => {
    if (phase === 'done') return undefined

    timers.current = [
      window.setTimeout(() => {
        setPhase('lift')
        playSoundEffect('intro-zoom')
      }, 650),
      window.setTimeout(() => setPhase('clouds'), 1500),
      window.setTimeout(() => setPhase('wide'), 2550),
      window.setTimeout(() => {
        setPhase('cairo')
        playSoundEffect('intro-arrive')
      }, 3600),
      window.setTimeout(() => setPhase('statement'), 4550),
      window.setTimeout(() => {
        setPhase('exit')
        playSoundEffect('intro-reveal')
      }, 5550),
      window.setTimeout(() => {
        try {
          sessionStorage.setItem(STORAGE_KEY, '1')
        } catch {
          // Storage can be unavailable in private browsing.
        }
        setPhase('done')
      }, 6400),
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

        <div className="nobi-intro-map-frame nobi-intro-camera-frame">
          <div className="nobi-intro-drone-scene">
            <div className="nobi-intro-city-grid" />
            <svg className="nobi-intro-city-roads" viewBox="0 0 1200 760" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
              <g fill="none" stroke="currentColor" strokeWidth="3">
                <path d="M-80 600 260 260 520 40M40 820 430 400 760 40M360 820 710 450 1110 30M720 820 1020 510 1280 260M-50 300 330 500 680 720M350 -40 620 230 900 420 1240 560" />
                <path d="M-20 180 260 350 510 520 850 760M180 -40 400 180 650 390 930 620 1200 760M-80 720 250 520 540 330 850 130 1220 -40" strokeWidth="8" />
              </g>
            </svg>
            <div className="nobi-intro-city-blocks" />
            <div className="nobi-intro-city-lights" />
            <div className="nobi-intro-cloud-layer cloud-one" />
            <div className="nobi-intro-cloud-layer cloud-two" />
            <div className="nobi-intro-atmosphere" />
            <div className="nobi-intro-country-reveal">
              <span className="nobi-intro-country-kicker">NORTH AFRICA · 001</span>
              <svg viewBox="0 0 620 700" role="img" aria-label="Stylized map of Egypt with Cairo highlighted">
                <defs>
                  <linearGradient id="egypt-fill" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0" stopColor="#d9f77a" stopOpacity=".22" />
                    <stop offset="1" stopColor="#d9f77a" stopOpacity=".04" />
                  </linearGradient>
                </defs>
                <path className="nobi-intro-egypt-country" d="M112 82 L425 82 L425 154 L500 175 L465 224 L434 241 L420 292 L397 336 L379 397 L353 464 L325 535 L300 600 L267 577 L244 526 L215 470 L188 413 L162 354 L145 294 L126 230 L112 168 Z" />
                <path className="nobi-intro-egypt-border" d="M112 82 L425 82 L425 154 L500 175 L465 224 L434 241 L420 292 L397 336 L379 397 L353 464 L325 535 L300 600 L267 577 L244 526 L215 470 L188 413 L162 354 L145 294 L126 230 L112 168 Z" />
                <path className="nobi-intro-egypt-nile" d="M277 575 C286 510 278 455 292 399 C300 360 287 318 304 276 C313 247 324 220 330 190" />
                <path className="nobi-intro-egypt-delta" d="M330 190 L286 150 M330 190 L350 145 M330 190 L385 162" />
                <g className="nobi-intro-cairo-marker">
                  <circle className="nobi-intro-cairo-pulse" cx="330" cy="218" r="18" />
                  <circle className="nobi-intro-cairo-dot" cx="330" cy="218" r="4.5" />
                  <path className="nobi-intro-cairo-leader" d="M338 212 L365 190 L435 190" />
                  <text className="nobi-intro-cairo-label" x="444" y="187">CAIRO</text>
                  <text className="nobi-intro-cairo-coordinates" x="444" y="204">30.0444° N / 31.2357° E</text>
                </g>
              </svg>
              <span className="nobi-intro-country-name">EGYPT</span>
              <span className="nobi-intro-country-coordinates">26° 49′ N&nbsp; / &nbsp;30° 48′ E</span>
            </div>
          </div>
          <div className="nobi-intro-camera-vignette" />
          <span className="nobi-intro-camera-caption">EGYPT → CAIRO</span>
          <span className="nobi-intro-camera-altitude">LOCATION <b>LOCKED</b></span>
        </div>
        
        <div className="nobi-intro-stage-bottom">
          <span>FROM EVERYWHERE</span>
          <span>TO SOMEWHERE</span>
        </div>
      </div>

      <div className="nobi-intro-statement">
        <span className="nobi-intro-statement-index">NOBI® — ORIGIN / 001</span>
        <h1>THE WORLD<br /><em>IS YOURS</em></h1>
        <span className="nobi-intro-statement-rule" />
      </div>

      <footer className="nobi-intro-footer">
        <span>DESIGNED TO MOVE</span>
        <span>SCROLL LESS. LIVE MORE.</span>
      </footer>
    </section>
  )
}
