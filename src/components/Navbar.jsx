import { useState } from 'react'
import { Link, NavLink } from 'react-router-dom'
import { useCart } from '../context/CartContext'

const links = [
  { to: '/shop', label: 'Shop' },
  { to: '/lookbook', label: 'Lookbook' },
  { to: '/about', label: 'About' },
]

export default function Navbar() {
  const { count } = useCart()
  const [open, setOpen] = useState(false)

  return (
    <header className="nav">
      <div className="nav-inner">
        <button className="nav-toggle" onClick={() => setOpen((v) => !v)} aria-label="Menu">
          <span />
          <span />
        </button>
        <Link to="/" className="logo" onClick={() => setOpen(false)}>
         NOBI
        </Link>
        <nav className={`nav-links ${open ? 'is-open' : ''}`}>
          {links.map((link) => (
            <NavLink key={link.to} to={link.to} onClick={() => setOpen(false)}>
              {link.label}
            </NavLink>
          ))}
        </nav>
        <Link to="/cart" className="nav-cart">
          Bag <span>{String(count).padStart(2, '0')}</span>
        </Link>
      </div>
    </header>
  )
}
