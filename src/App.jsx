import { useEffect } from 'react'
import { BrowserRouter, Navigate, Route, Routes, useLocation } from 'react-router-dom'
import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import { CartProvider, useCart } from './context/CartContext'
import { WishlistProvider } from './context/WishlistContext'
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
import Wishlist from './pages/Wishlist'
import NotFound from './pages/NotFound'
import AdminDashboard from './pages/AdminDashboard'
import Account from './pages/Account'

function CartToast() {
  const { cartToast, setCartToast } = useCart()
  useEffect(() => {
    if (!cartToast) return undefined
    const timer = window.setTimeout(() => setCartToast(null), 2800)
    return () => window.clearTimeout(timer)
  }, [cartToast, setCartToast])

  if (!cartToast) return null
  return (
    <div className="cart-toast" role="status" aria-live="polite">
      <span className="cart-toast-check" aria-hidden="true">✓</span>
      <span><strong>Added to bag</strong><small>{cartToast.name}</small></span>
      <button type="button" onClick={() => setCartToast(null)} aria-label="Dismiss notification">×</button>
    </div>
  )
}

function ScrollToTop() {
  const { pathname } = useLocation()
  useEffect(() => { window.scrollTo(0, 0) }, [pathname])
  return null
}

function AnimatedRoutes() {
  const location = useLocation()
  const reduceMotion = useReducedMotion()
  const variants = reduceMotion
    ? { initial: { opacity: 0 }, animate: { opacity: 1 }, exit: { opacity: 0 } }
    : { initial: { opacity: 0, y: 14 }, animate: { opacity: 1, y: 0 }, exit: { opacity: 0, y: -8 } }
  return (
    <>
      <ScrollToTop />
      <AnimatePresence mode="wait">
        <motion.div key={location.pathname} variants={variants} initial="initial" animate="animate" exit="exit"
          transition={{ duration: reduceMotion ? 0.01 : 0.42, ease: [0.16, 1, 0.3, 1] }}>
          <Routes location={location}>
            <Route path="/admin" element={<AdminDashboard />} />
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
              <Route path="/account" element={<Account />} />
              <Route path="/wishlist" element={<Wishlist />} />
              <Route path="*" element={<NotFound />} />
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
      <CartToast />
      <WishlistProvider>
        <BrowserRouter><Intro /><AnimatedRoutes /></BrowserRouter>
      </WishlistProvider>
    </CartProvider>
  )
}
