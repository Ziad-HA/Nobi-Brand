import { useCallback, useEffect, useRef, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { playSoundEffect } from '../lib/soundEffects'
import './IntroCinematic.css'

const STORAGE_KEY = 'nobi-intro-v3'
const BASE = import.meta.env.BASE_URL
const VIDEO_SRC = `${BASE}earth-studio/nobi-egypt-cairo.mp4`
const POSTER_SRC = `${BASE}earth-studio/nobi-egypt-cairo-poster.jpg`

// Beats (seconds on the video timeline)
const T_ZOOM = 1.0 // search drift ends, fast zoom into Egypt
const T_CAIRO = 4.2 // Cairo approach
const T_TEXT = 4.5 // THE WORLD IS YOURS
const T_EXIT = 6.0 // start crossfade into the hero
const EXIT_MS = 1150
const SAFETY_MS = 11000

const LINE_ONE = 'THE WORLD'
const LINE_TWO = 'IS YOURS'

function canShowIntro(pathname) {
  if (pathname !== '/') return false
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return false
  if (navigator.connection?.saveData) return false
  try {
    return !sessionStorage.getItem(STORAGE_KEY)
  } catch {
    return true
  }
}

function Letters({ text, start, className = '' }) {
  return (
    <span className={`nobi-intro-line ${className}`} aria-hidden="true">
      {text.split('').map((char, i) => (
        <span
          key={i}
          className="nobi-intro-char"
          style={{ '--d': `${start + i * 0.045}s` }}
        >
          {char === ' ' ? ' ' : char}
        </span>
      ))}
    </span>
  )
}

export default function Intro() {
  const { pathname } = useLocation()
  const [phase, setPhase] = useState(() => (canShowIntro(pathname) ? 'play' : 'done'))
  const videoRef = useRef(null)
  const fired = useRef({ zoom: false, cairo: false, text: false, exit: false })
  const exitTimer = useRef(0)
  const rafRef = useRef(0)

  const finish = useCallback(() => {
    window.clearTimeout(exitTimer.current)
    window.cancelAnimationFrame(rafRef.current)
    try {
      sessionStorage.setItem(STORAGE_KEY, '1')
    } catch {
      // Storage can be unavailable in private browsing.
    }
    setPhase('done')
  }, [])

  const startExit = useCallback(() => {
    if (fired.current.exit) return
    fired.current.exit = true
    playSoundEffect('intro-reveal')
    setPhase('exit')
    exitTimer.current = window.setTimeout(finish, EXIT_MS)
  }, [finish])

  // Lock scroll while the intro is on screen.
  useEffect(() => {
    if (phase === 'done') return undefined
    document.documentElement.classList.add('nobi-intro-active')
    document.body.style.overflow = 'hidden'
    return () => {
      document.documentElement.classList.remove('nobi-intro-active')
      document.body.style.overflow = ''
    }
  }, [phase])

  // The hero underneath plays its own arrival animation while we crossfade out.
  useEffect(() => {
    if (phase !== 'exit') return undefined
    document.body.classList.add('nobi-site-reveal')
    const clear = window.setTimeout(() => document.body.classList.remove('nobi-site-reveal'), EXIT_MS + 1400)
    return () => window.clearTimeout(clear)
  }, [phase])

  // Drive every beat from the real video clock so text and footage never drift apart.
  useEffect(() => {
    if (phase === 'done') return undefined
    const video = videoRef.current
    if (!video) return undefined

    const tick = () => {
      const t = video.currentTime
      const f = fired.current
      if (!f.zoom && t >= T_ZOOM) {
        f.zoom = true
        playSoundEffect('intro-zoom')
      }
      if (!f.cairo && t >= T_CAIRO) {
        f.cairo = true
        playSoundEffect('intro-arrive')
      }
      if (!f.text && t >= T_TEXT) {
        f.text = true
        setPhase((p) => (p === 'play' ? 'text' : p))
      }
      if (t >= T_EXIT) {
        startExit()
        return
      }
      rafRef.current = window.requestAnimationFrame(tick)
    }

    const onPlaying = () => {
      window.cancelAnimationFrame(rafRef.current)
      rafRef.current = window.requestAnimationFrame(tick)
    }

    video.addEventListener('playing', onPlaying)
    video.addEventListener('ended', startExit)
    video.addEventListener('error', finish)

    const attempt = video.play()
    if (attempt?.catch) attempt.catch(finish)

    const safety = window.setTimeout(() => {
      if (!fired.current.exit) startExit()
    }, SAFETY_MS)

    return () => {
      video.removeEventListener('playing', onPlaying)
      video.removeEventListener('ended', startExit)
      video.removeEventListener('error', finish)
      window.clearTimeout(safety)
      window.cancelAnimationFrame(rafRef.current)
    }
  }, [finish, startExit]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => () => window.clearTimeout(exitTimer.current), [])

  if (phase === 'done') return null

  return (
    <section className={`nobi-intro phase-${phase}`} aria-label="NOBI brand introduction">
      <video
        ref={videoRef}
        className="nobi-intro-video"
        src={VIDEO_SRC}
        poster={POSTER_SRC}
        muted
        playsInline
        preload="auto"
        disablePictureInPicture
        aria-hidden="true"
      />
      <div className="nobi-intro-grade" aria-hidden="true" />
      <div className="nobi-intro-vignette" aria-hidden="true" />
      <i className="nobi-intro-bar top" aria-hidden="true" />
      <i className="nobi-intro-bar bottom" aria-hidden="true" />

      <header className="nobi-intro-header">
        <span className="nobi-intro-wordmark">NOBI<span>®</span></span>
        <span className="nobi-intro-live"><i /> EGYPT → CAIRO</span>
      </header>

      <div className="nobi-intro-statement" role="heading" aria-level={1} aria-label="The world is yours">
        <Letters text={LINE_ONE} start={0} />
        <Letters text={LINE_TWO} start={0.42} className="volt" />
        <span className="nobi-intro-rule" aria-hidden="true" />
      </div>

      <button type="button" className="nobi-intro-skip" onClick={startExit}>
        SKIP <span aria-hidden="true">↗</span>
      </button>
    </section>
  )
}
