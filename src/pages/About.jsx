
import { useRef } from 'react'
import { motion, useReducedMotion, useScroll, useTransform } from 'motion/react'
import usePageMeta from '../lib/usePageMeta'

export default function About() {
  const wrap = useRef(null)
  const reduce = useReducedMotion()
  const { scrollYProgress } = useScroll({ target: wrap, offset: ['start end', 'end start'] })
  const y = useTransform(scrollYProgress, [0, 1], ['-7%', '7%'])
  usePageMeta('About', 'Unseen is a night brand: small drops, heavy fabrics, prints that crack on purpose.')
  return (
    <section className="section about-page">
      <div className="about-heading">
        <p className="eyebrow">Who's Unseen?</p>
        <h1>Unseen is a night brand.</h1>
        <span className="about-index">UNSEEN / ABOUT — 001</span>
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

      <div className="stats about-principles">
        <div>
          <strong>SMALL RUNS</strong>
          <span>Limited releases, kept intentional</span>
        </div>
        <div>
          <strong>HEAVY FABRICS</strong>
          <span>Built around substantial materials</span>
        </div>
        <div>
          <strong>NIGHT-LED</strong>
          <span>Visual direction shaped after dark</span>
        </div>
      </div>

      <div className="about-image-wrap" ref={wrap}>
        <motion.img
          className="about-image"
          style={reduce ? undefined : { y, scale: 1.16 }}
          alt="Unseen TRAP"
          src={`${import.meta.env.BASE_URL}images/TRAP.jpg`}
        />
        <span className="about-image-label">UNSEEN — VISUAL ARCHIVE</span>
      </div>
    </section>
  )
}
