
import { useEffect, useState } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import Navbar from './Navbar'
import Footer from './Footer'

export default function Layout() {
  const location = useLocation()
  const [pageKey, setPageKey] = useState(0)

  useEffect(() => {
    setPageKey(key => key + 1)
  }, [location.pathname])

  return (
    <>
      <Navbar />

      <main key={pageKey} className="luxury-page">
        <Outlet />
      </main>

      <Footer />
    </>
  )
}
