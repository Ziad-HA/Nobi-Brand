
import { useEffect } from 'react'
import {
  BrowserRouter,
  Navigate,
  Route,
  Routes,
  useLocation
} from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'

import { CartProvider } from './context/CartContext'
import Layout from './components/Layout'
import Intro from './components/Intro'

import Home from './pages/Home'
import Shop from './pages/Shop'
import Product from './pages/Product'
import Lookbook from './pages/Lookbook'
import SeasonPage from './pages/SeasonPage'
import About from './pages/About'
import Cart from './pages/Cart'
import Checkout from './pages/Checkout'
import Login from './pages/Login'

function ScrollToTop() {
  const { pathname } = useLocation()

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [pathname])

  return null
}

// NOBI - FLASH CUT PAGE TRANSITION
const pageVariants = {
  initial: {
    opacity: 0,
    scale: 0.94,
    y: 22,
    filter: 'blur(8px)'
  },

  animate: {
    opacity: 1,
    scale: 1,
    y: 0,
    filter: 'blur(0px)'
  },

  exit: {
    opacity: 0,
    scale: 1.04,
    y: -10,
    filter: 'blur(5px)'
  }
}

function AnimatedRoutes() {
  const location = useLocation()

  return (
    <>
      <ScrollToTop />

      <AnimatePresence mode="wait">
        <motion.div
          key={location.pathname}
          variants={pageVariants}
          initial="initial"
          animate="animate"
          exit="exit"
          transition={{
            duration: 0.3,
            ease: [0.16, 1, 0.3, 1]
          }}
        >
          <Routes location={location}>
            <Route element={<Layout />}>
              <Route path="/" element={<Home />} />
              <Route path="/shop" element={<Shop />} />
              <Route path="/product/:id" element={<Product />} />
              <Route path="/lookbook" element={<Lookbook />} />
              <Route path="/lookbook/:slug" element={<SeasonPage />} />
              <Route path="/about" element={<About />} />
              <Route path="/cart" element={<Cart />} />
              <Route path="/checkout" element={<Checkout />} />
              <Route path="/login" element={<Login />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Route>
          </Routes>
        </motion.div>
      </AnimatePresence>
    </>
  )
}

export default function App() {
  return (
    <CartProvider>
      <BrowserRouter>
        <Intro />
        <AnimatedRoutes />
      </BrowserRouter>
    </CartProvider>
  )
}
