import { useEffect, useState } from 'react'
import { Link, NavLink, useLocation } from 'react-router-dom'
import { useCart } from '../context/CartContext'
import { useWishlist } from '../context/WishlistContext'

const links = [{ to: '/shop', label: 'Shop' }, { to: '/lookbook', label: 'Lookbook' }, { to: '/about', label: 'About' }, { to: '/login', label: 'Login' }]

export default function Navbar() {
  const { count, openCart } = useCart()
  const { count: savedCount } = useWishlist()
  const [open, setOpen] = useState(false)
  const { pathname } = useLocation()
  useEffect(() => setOpen(false), [pathname])
  useEffect(() => {
    if (!open) return undefined
    const closeOnEscape = (event) => { if (event.key === 'Escape') { setOpen(false); document.querySelector('.nav-toggle')?.focus() } }
    window.addEventListener('keydown', closeOnEscape)
    return () => window.removeEventListener('keydown', closeOnEscape)
  }, [open])
  return (
    <header className="nav">
      <div className="nav-inner">
        <button type="button" className={`nav-toggle ${open ? 'is-open' : ''}`} onClick={() => setOpen((value) => !value)} aria-label={open ? 'Close menu' : 'Open menu'} aria-expanded={open} aria-controls="site-nav"><span /><span /></button>
        <Link to="/" className="logo" onClick={() => setOpen(false)}>UNSEEN</Link>
        <nav id="site-nav" aria-label="Main" className={`nav-links ${open ? 'is-open' : ''}`}>
          {links.map((link) => <NavLink key={link.to} to={link.to} onClick={() => setOpen(false)}>{link.label}</NavLink>)}
        </nav>
        <div className="nav-right">
          <NavLink to="/wishlist" className="nav-wishlist" aria-label={`Open wishlist, ${savedCount} saved items`} title="Wishlist"><svg className="nav-wishlist-heart" viewBox="0 0 24 24" aria-hidden="true"><path d="M20.8 4.9a5.5 5.5 0 0 0-7.8 0L12 5.9l-1-1a5.5 5.5 0 0 0-7.8 7.8l1 1L12 21l7.8-7.3 1-1a5.5 5.5 0 0 0 0-7.8Z" /></svg><span>{String(savedCount).padStart(2, '0')}</span></NavLink>
          <button type="button" className="nav-cart" onClick={openCart} aria-label={`Open shopping bag, ${count} items`}>Bag <span aria-hidden="true">{String(count).padStart(2, '0')}</span></button>
        </div>
      </div>
    </header>
  )
}
