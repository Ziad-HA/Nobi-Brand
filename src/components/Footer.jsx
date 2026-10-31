
import { Link, useLocation } from 'react-router-dom'
import { useState } from 'react'

export default function Footer() {
  const [email, setEmail] = useState('')
  const [done, setDone] = useState(false)

  const { pathname } = useLocation()
  const hideNewsletter =
    pathname === '/login' || pathname === '/reset-password'

  const onSubmit = (e) => {
    e.preventDefault()
    if (!email.trim()) return
    setDone(true)
  }

  return (
    <footer className="footer">
      <div className={`footer-top ${hideNewsletter ? 'footer-top-single' : ''}`}>

        {!hideNewsletter && (
          <div className="footer-newsletter">
            <p className="eyebrow">NOBI / DROP ALERTS</p>
            <h2>STAY ON THE LIST<span>.</span></h2>

            <p className="muted">
              Get early access to new drops and exclusive releases.
            </p>

            {done ? (
              <p className="muted">
                You're in. Next drop hits your inbox first.
              </p>
            ) : (
              <form className="newsletter" onSubmit={onSubmit}>
                <input
                  type="email"
                  placeholder="Enter your email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />

                <button type="submit">
                  JOIN ↗
                </button>
              </form>
            )}
          </div>
        )}

        <div className="footer-cols">

          <div className="footer-col">
            <p className="eyebrow">HOUSE</p>
            <Link to="/shop">Shop</Link>
            <Link to="/lookbook">Lookbook</Link>
            <Link to="/about">About</Link>
          </div>

          <div className="footer-col">
            <p className="eyebrow">SUPPORT</p>
            <a href="#shipping">Shipping</a>
            <a href="#returns">Returns</a>
            <a href="#size">Size guide</a>
          </div>

          <div className="footer-col footer-socials">
            <p className="eyebrow">FOLLOW NOBI</p>

            <div className="social-links">
              <a
                href="https://www.instagram.com/zi4dddd/"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram"
              >
                <svg viewBox="0 0 24 24" aria-hidden="true">
                  <rect
                    x="3"
                    y="3"
                    width="18"
                    height="18"
                    rx="5"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                  />
                  <circle
                    cx="12"
                    cy="12"
                    r="4"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                  />
                  <circle cx="17.5" cy="6.5" r="1.2" fill="currentColor" />
                </svg>
                <span>@zi4dddd</span>
              </a>

              <a
                href="https://www.linkedin.com/in/z-nobii/"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="LinkedIn"
              >
                <svg viewBox="0 0 24 24" aria-hidden="true">
                  <path
                    fill="currentColor"
                    d="M5.2 3.5a2.2 2.2 0 1 0 0 4.4 2.2 2.2 0 0 0 0-4.4ZM3.3 9.5h3.8v11H3.3v-11Zm6.1 0H13v1.5h.1a4 4 0 0 1 3.6-1.9c3.9 0 4.6 2.5 4.6 5.7v5.7h-3.8v-5c0-1.2 0-2.8-1.8-2.8s-2.1 1.3-2.1 2.7v5.1H9.4v-11Z"
                  />
                </svg>
                <span>z-nobii</span>
              </a>
            </div>
          </div>

        </div>
      </div>

      <div className="footer-bottom">
        <p>© {new Date().getFullYear()} NOBI STUDIO</p>

        <p className="muted">
          CUT FOR THE NIGHT. MADE IN SMALL RUNS.
        </p>

        <a href="#" className="back-to-top">
          BACK TO TOP ↑
        </a>
      </div>
    </footer>
  )
}
