
import { useEffect, useRef } from 'react'
import { animate, motion, useInView, useReducedMotion, useScroll, useTransform } from 'framer-motion'
import usePageMeta from '../lib/usePageMeta'

// Counts up to its value the first time it scrolls into view; shows the final number straight away
// under reduced motion.
function Count({ to, pad = 2 }) {
  const ref = useRef(null)
  const reduce = useReducedMotion()
  const inView = useInView(ref, { once: true, amount: 0.6 })
  const fmt = (v) => String(Math.round(v)).padStart(pad, '0')

  useEffect(() => {
    if (!inView || reduce || !ref.current) return undefined
    const controls = animate(0, to, {
      duration: 1.4,
      ease: [0.22, 1, 0.36, 1],
      onUpdate: (v) => {
        if (ref.current) ref.current.textContent = fmt(v)
      },
    })
    return () => controls.stop()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inView, reduce, to])

  return <strong ref={ref}>{fmt(reduce ? to : 0)}</strong>
}

export default function About() {
  const wrap = useRef(null)
  const reduce = useReducedMotion()
  const { scrollYProgress } = useScroll({ target: wrap, offset: ['start end', 'end start'] })
  const y = useTransform(scrollYProgress, [0, 1], ['-7%', '7%'])
  usePageMeta('About', 'Nobi is a night brand: small drops, heavy fabrics, prints that crack on purpose.')
  return (
    <section className="section about-page">
      <div className="about-heading">
        <p className="eyebrow">Who's Nobi?</p>
        <h1>Nobi is a night brand.</h1>
        <span className="about-index">NOBI / ABOUT — 001</span>
      </div>

      <div className="about-grid">
        <p className="lede">
          We started in a shared studio above a closed bar: one rail, two
          patterns, and a rule that nothing ships unless it survives a week of
          actual wear.
        </p>

        <div className="about-copy">
          <p>
            Streetwear here is not a costume. It’s a uniform for people who
            move after dark — DJs, riders, designers, anyone who needs a
            silhouette that still holds at 3am.
          </p>
          <p>
            Drops are small. Fabrics are heavy. Prints crack on purpose. When a
            run sells through, we archive it instead of reprinting the same
            graphic into the ground.
          </p>
        </div>
      </div>

      <div className="stats">
        <div>
          <Count to={9} />
          <span>Drops shipped</span>
        </div>
        <div>
          <Count to={6} pad={1} />
          <span>Cities shot</span>
        </div>
        <div>
          <Count to={460} pad={1} />
          <span>GSM core fleece</span>
        </div>
      </div>

      <div className="about-image-wrap" ref={wrap}>
        <motion.img
          className="about-image"
          style={reduce ? undefined : { y, scale: 1.16 }}
          alt="Nobi TRAP"
          src={`${import.meta.env.BASE_URL}images/TRAP.jpg`}
        />
        <span className="about-image-label">NOBI — VISUAL ARCHIVE</span>
      </div>
    </section>
  )
}
