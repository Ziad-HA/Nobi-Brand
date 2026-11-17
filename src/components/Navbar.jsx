import { useEffect, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { Link, NavLink } from 'react-router-dom'
import { useCart } from '../context/CartContext'

const links = [
  { to: '/shop', label: 'Shop' },
  { to: '/lookbook', label: 'Lookbook' },
  { to: '/about', label: 'About' },
  { to: '/login', label: 'Login' }
]

export default function Navbar() {
  const { count } = useCart()
  const [open, setOpen] = useState(false)
  const { pathname } = useLocation()

  useEffect(() => {
    setOpen(false)
  }, [pathname])

  useEffect(() => {
    if (!open) return undefined
    const closeOnEscape = (event) => {
      if (event.key === 'Escape') {
        setOpen(false)
        document.querySelector('.nav-toggle')?.focus()
      }
    }
    window.addEventListener('keydown', closeOnEscape)
    return () => window.removeEventListener('keydown', closeOnEscape)
  }, [open])

  return (
    <header className="nav">
      <div className="nav-inner">
        <button
          type="button"
          className={`nav-toggle ${open ? 'is-open' : ''}`}
          onClick={() => setOpen((v) => !v)}
          aria-label={open ? 'Close menu' : 'Open menu'}
          aria-expanded={open}
          aria-controls="site-nav"
        >
          <span />
          <span />
        </button>
        <Link to="/" className="logo" onClick={() => setOpen(false)}>
          NOBI
        </Link>
        <nav id="site-nav" aria-label="Main" className={`nav-links ${open ? 'is-open' : ''}`}>
          {links.map((link) => (
            <NavLink key={link.to} to={link.to} onClick={() => setOpen(false)}>
              {link.label}
            </NavLink>
          ))}
        </nav>
        <div className="nav-right">
          <Link to="/cart" className="nav-cart" aria-label={`Shopping bag, ${count} ${count === 1 ? 'item' : 'items'}`}>
            Bag <span aria-hidden="true">{String(count).padStart(2, '0')}</span>
          </Link>
        </div>
      </div>
    </header>
  )
}
