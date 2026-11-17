import { useCallback, useLayoutEffect, useRef } from 'react'
import { useMotionValueEvent, useReducedMotion, useScroll } from 'framer-motion'
import { sfx } from '../lib/sfx'

const clamp01 = (v) => Math.min(1, Math.max(0, v))
const smooth = (a, b, v) => {
  const t = clamp01((v - a) / (b - a))
  return t * t * (3 - 2 * t)
}
const easeOut = (t) => 1 - Math.pow(1 - t, 3)
const easeIn = (t) => t * t * t

// Scroll story for a set of photos, pinned in place while you scroll through it:
//   1. they circle each other on a 3D ring,
//   2. slow down and each one lands in its own grid cell,
//   3. hold still so you can look,
//   4. then lift off and spin away again as you carry on down the page.
// Their final positions are just the normal grid, so layout, hover and links all behave
// like a plain grid once settled. With reduced motion you get that plain grid and no pin.
export default function OrbitGallery({ items, head, className = '', gridClassName = '', pin = 3 }) {
  const reduce = useReducedMotion()
  const sectionRef = useRef(null)
  const gridRef = useRef(null)
  const tiles = useRef([])
  const metrics = useRef(null)
  const flags = useRef({ started: false, spin: false, settle: false, out: false })

  // Starts a little before the pin so the ring is already turning as the section arrives.
  const { scrollYProgress } = useScroll({ target: sectionRef, offset: ['start 0.85', 'end end'] })

  // Where each grid cell sits relative to the grid's centre, and how big the ring should be.
  // offsetLeft/Top ignore transforms, so this is safe to run while tiles are mid-flight.
  const measure = useCallback(() => {
    const grid = gridRef.current
    const els = tiles.current.filter(Boolean)
    if (!grid || !els.length) {
      metrics.current = null
      return
    }
    const w = grid.clientWidth
    const h = grid.clientHeight
    const dx = []
    const dy = []
    let tw = 0
    els.forEach((el) => {
      dx.push(w / 2 - (el.offsetLeft + el.offsetWidth / 2))
      dy.push(h / 2 - (el.offsetTop + el.offsetHeight / 2))
      tw = el.offsetWidth
    })
    const n = els.length
    const R = Math.min(w * 0.62, Math.max(w * 0.3, (n * tw * 1.12) / (2 * Math.PI)))
    metrics.current = { dx, dy, R, n, els }
  }, [])

  const apply = useCallback((p) => {
    const m = metrics.current
    if (!m) return

    const inT = clamp01(p / 0.45) // spin-in, then landing
    const outU = clamp01((p - 0.64) / 0.36) // lift-off and spin-out
    const phi = (1 - easeOut(inT)) * Math.PI * 3 - easeIn(outU) * Math.PI * 2
    const s = smooth(0.1, 0.45, p) * (1 - smooth(0, 1, outU)) // 0 = on the ring, 1 = in the grid
    const k = 1 - s

    m.els.forEach((el, i) => {
      const ang = (i / m.n) * Math.PI * 2 + phi
      const sin = Math.sin(ang)
      const cos = Math.cos(ang)
      const x = k * (m.dx[i] + m.R * sin)
      const y = k * (m.dy[i] + m.R * 0.16 * cos) // far side rides higher, so the ring reads as seen from above
      const z = k * m.R * (cos - 1)
      const rot = -k * 0.85 * sin // side photos angle in toward the centre; every photo stays visible
      el.style.transform = `translate3d(${x.toFixed(1)}px, ${y.toFixed(1)}px, ${z.toFixed(1)}px) rotateY(${rot.toFixed(3)}rad)`
      el.style.opacity = (s + k * (0.4 + 0.6 * ((cos + 1) / 2))).toFixed(2)
      el.style.zIndex = Math.round(cos * 10 + 10) // nearer photos paint over farther ones
      el.style.pointerEvents = k > 0.3 ? 'none' : ''
    })

    // Sound cues. The very first call only records the starting state so nothing plays on load.
    const f = flags.current
    const spinning = p > 0.04
    const settled = s >= 0.98
    const leaving = outU > 0.04
    if (f.started) {
      if (spinning && !f.spin) sfx.play('orbitSpin')
      if (settled && !f.settle) sfx.play('orbitSettle')
      if (leaving && !f.out) sfx.play('orbitSpin')
    }
    f.started = true
    f.spin = p > 0.01 ? spinning || f.spin : false
    f.settle = s < 0.6 ? false : settled || f.settle
    f.out = outU > 0.01 ? leaving || f.out : false
  }, [])

  useMotionValueEvent(scrollYProgress, 'change', (p) => {
    if (!reduce) apply(p)
  })

  // Measure and place tiles before the first paint, and again whenever the grid is resized.
  useLayoutEffect(() => {
    tiles.current.length = items.length
    const grid = gridRef.current
    if (reduce) {
      tiles.current.filter(Boolean).forEach((el) => {
        el.style.transform = ''
        el.style.opacity = ''
        el.style.zIndex = ''
        el.style.pointerEvents = ''
      })
      return undefined
    }
    const run = () => {
      measure()
      apply(scrollYProgress.get())
    }
    run()
    if (!grid || typeof ResizeObserver === 'undefined') return undefined
    const ro = new ResizeObserver(run)
    ro.observe(grid)
    return () => ro.disconnect()
  }, [items.length, reduce, measure, apply, scrollYProgress])

  return (
    <section
      ref={sectionRef}
      className={`orbit ${reduce ? 'orbit--flat' : ''} ${className}`.replace(/\s+/g, ' ').trim()}
      style={reduce ? undefined : { height: `calc(${pin} * 100svh)` }}
    >
      <div className="orbit-stage">
        {head}
        <div ref={gridRef} className={`orbit-grid ${gridClassName}`.trim()}>
          {items.map((node, i) => (
            <div
              key={i}
              className="orbit-tile"
              ref={(el) => {
                tiles.current[i] = el
              }}
            >
              {node}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
