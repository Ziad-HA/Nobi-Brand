import { useEffect, useState } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import { motion, useReducedMotion, useScroll } from 'motion/react'
import Navbar from './Navbar'
import Footer from './Footer'
import CartDrawer from './CartDrawer'
import { playSoundEffect } from '../lib/soundEffects'

export default function Layout() {
  const location = useLocation()
  const [pageKey, setPageKey] = useState(0)
  const reduceMotion = useReducedMotion()
  const { scrollYProgress } = useScroll()
  useEffect(() => setPageKey((key) => key + 1), [location.pathname])
  useEffect(() => {
    const handleInterfaceSound = (event) => {
      if (!(event.target instanceof Element)) return
      const control = event.target.closest('button, a, [role="button"]')
      if (!control || control.matches(':disabled, [aria-disabled="true"]') || control.dataset.sound === 'off') return
      playSoundEffect(control.dataset.sound || 'tap')
    }
    document.addEventListener('click', handleInterfaceSound, true)
    return () => document.removeEventListener('click', handleInterfaceSound, true)
  }, [])
  return (
    <>
      {!reduceMotion && <motion.div className="scroll-progress" style={{ scaleX: scrollYProgress, transformOrigin: '0% 50%' }} aria-hidden="true" />}
      <a className="skip-link" href="#main">Skip to content</a>
      <Navbar />
      <main id="main" tabIndex={-1} key={pageKey} className="luxury-page"><Outlet /></main>
      <Footer />
      <CartDrawer />
    </>
  )
}
