import { BrowserRouter, Navigate, Route, Routes, useLocation } from 'react-router-dom'
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

function AnimatedRoutes() {
  const location = useLocation()

  return (
    // ربط location و key هنا يجبر المتصفح على إعادة بناء الصفحة عند التغيير
    <Routes location={location} key={location.pathname}>
      <Route element={<Layout />}>
        {/* إضافة timestamp أو random key مؤقت عند العودة للصفحة الرئيسية يضمن إعادة تشغيل الـ HeroScene بالكامل */}
        <Route path="/" element={<Home key={location.key} />} />
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