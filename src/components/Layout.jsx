
import { useEffect, useState } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import { motion, useReducedMotion, useScroll } from 'framer-motion'
import Navbar from './Navbar'
import Footer from './Footer'

export default function Layout() {
  const location = useLocation()
  const [pageKey, setPageKey] = useState(0)
  const reduceMotion = useReducedMotion()
  const { scrollYProgress } = useScroll()

  useEffect(() => {
    setPageKey(key => key + 1)
  }, [location.pathname])

  return (
    <>
      {!reduceMotion && (
        <motion.div
          className="scroll-progress"
          style={{ scaleX: scrollYProgress, transformOrigin: '0% 50%' }}
          aria-hidden="true"
        />
      )}
      <a className="skip-link" href="#main">Skip to content</a>
      <Navbar />

      <main id="main" tabIndex={-1} key={pageKey} className="luxury-page">
        <Outlet />
      </main>

      <Footer />
    </>
  )
}
