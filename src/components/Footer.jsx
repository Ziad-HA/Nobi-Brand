import { Link, useLocation } from 'react-router-dom'
import { useState } from 'react'

export default function Footer() {
  const [email, setEmail] = useState('')
  const [done, setDone] = useState(false)
  const { pathname } = useLocation()
  const hideNewsletter = pathname === '/login' || pathname === '/reset-password'

  const onSubmit = (e) => {
    e.preventDefault()
    if (!email.trim()) return
    setDone(true)
  }

  return (
    <footer className="footer">
      <div className={`footer-top ${hideNewsletter ? 'footer-top-single' : ''}`}>
        {!hideNewsletter && (
          <div>
            <p className="eyebrow">Drop alerts</p>
            <h2>Stay on the list.</h2>
            {done ? (
              <p className="muted">You’re in. Next drop hits your inbox first.</p>
            ) : (
              <form className="newsletter" onSubmit={onSubmit}>
                <input
                  type="email"
                  placeholder="Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
                <button type="submit">Join</button>
              </form>
            )}
          </div>
        )}
        <div className="footer-cols">
          <div>
            <p className="eyebrow">House</p>
            <Link to="/shop">Shop</Link>
            <Link to="/lookbook">Lookbook</Link>
            <Link to="/about">About</Link>
          </div>
          <div>
            <p className="eyebrow">Support</p>
            <a href="#shipping">Shipping</a>
            <a href="#returns">Returns</a>
            <a href="#size">Size guide</a>
          </div>
        </div>
      </div>
      <div className="footer-bottom">
        <p>© {new Date().getFullYear()} Nobi Studio</p>
        <p className="muted">Cut for the night. Made in small runs.</p>
      </div>
    </footer>
  )
}