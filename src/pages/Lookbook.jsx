import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { lookbook } from '../data/products'
import { motion, useReducedMotion } from 'motion/react'
import OrbitGallery from '../components/OrbitGallery'
import usePageMeta from '../lib/usePageMeta'

export default function Lookbook() {
  const shots = lookbook.slice(0, 6)
  const reduceMotion = useReducedMotion()
  const [activeShot, setActiveShot] = useState(null)
  useEffect(() => {
    if (!activeShot) return undefined
    const close = (event) => { if (event.key === 'Escape') setActiveShot(null) }
    window.addEventListener('keydown', close)
    return () => window.removeEventListener('keydown', close)
  }, [activeShot])
  usePageMeta('Lookbook', 'Captured after dark: the Nobi lookbook, season by season.', shots[0]?.image)
  return (
    <>
      <OrbitGallery className="section lookbook-page" gridClassName="look-masonry"
        head={<div className="section-head"><div><p className="eyebrow">NOBI / Visual archive</p><h1>Lookbook</h1></div><p className="muted">Campaign frames from the NOBI archive. Select a frame to explore it.</p></div>}
        items={shots.map((shot, index) => (
          <motion.figure key={shot.id} initial={reduceMotion ? false : { opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: .2 }} transition={{ duration: .55, delay: index * .06 }}>
            <button type="button" className="lookbook-open-frame" onClick={() => setActiveShot(shot)} aria-label={`View season ${shot.city} campaign image`}>
              <img src={shot.image} alt={`Season ${shot.city} look`} loading="lazy" decoding="async" /><span className="lookbook-frame-open">View frame ↗</span>
            </button>
            <figcaption>{String(index + 1).padStart(2, '0')} / {shot.city} <Link to={`/lookbook/${shot.city.toLowerCase()}`}>Explore season ↗</Link></figcaption>
          </motion.figure>
        ))} />
      {activeShot && <div className="lookbook-lightbox" role="dialog" aria-modal="true" aria-label={`Season ${activeShot.city} campaign`} onMouseDown={(event) => { if (event.target === event.currentTarget) setActiveShot(null) }}>
        <button type="button" className="lookbook-lightbox-close" onClick={() => setActiveShot(null)} aria-label="Close image">×</button>
        <img src={activeShot.image} alt={`Season ${activeShot.city} campaign`} />
        <Link to={`/lookbook/${activeShot.city.toLowerCase()}`} onClick={() => setActiveShot(null)}>Explore season {activeShot.city} ↗</Link>
      </div>}
    </>
  )
}
