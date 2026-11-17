import { useState } from 'react'
import { Link, NavLink } from 'react-router-dom'
import { useCart } from '../context/CartContext'
import { sfx, useSoundEnabled } from '../lib/sfx'

const links = [
  { to: '/shop', label: 'Shop' },
  { to: '/lookbook', label: 'Lookbook' },
  { to: '/about', label: 'About' },
  { to: '/login', label: 'Login' }
]

export default function Navbar() {
  const { count } = useCart()
  const [open, setOpen] = useState(false)
  const soundOn = useSoundEnabled()

  const soundButton = (extra) => (
    <button
      type="button"
      className={`nav-sound ${extra}`}
      aria-pressed={soundOn}
      aria-label="Sound effects"
      onClick={() => sfx.toggle()}
    >
      <i className="nav-sound-dot" aria-hidden="true" />
      <span>Sound</span> <b>{soundOn ? 'On' : 'Off'}</b>
    </button>
  )

  return (
    <header className="nav">
      <div className="nav-inner">
        <button
          type="button"
          className="nav-toggle"
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
          {soundButton('nav-sound--menu')}
        </nav>
        <div className="nav-right">
          {soundButton('nav-sound--bar')}
          <Link to="/cart" className="nav-cart">
            Bag <span>{String(count).padStart(2, '0')}</span>
          </Link>
        </div>
      </div>
    </header>
  )
}
