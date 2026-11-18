import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import { useCart } from '../context/CartContext'

export default function CartDrawer() {
  const { items, count, subtotal, updateQty, removeItem, isCartOpen, closeCart } = useCart()
  const reduceMotion = useReducedMotion()

  useEffect(() => {
    if (!isCartOpen) return undefined
    const previous = document.activeElement
    const onKeyDown = (event) => { if (event.key === 'Escape') closeCart() }
    document.addEventListener('keydown', onKeyDown)
    document.body.style.overflow = 'hidden'
    requestAnimationFrame(() => document.querySelector('.cart-drawer-close')?.focus())
    return () => {
      document.removeEventListener('keydown', onKeyDown)
      document.body.style.overflow = ''
      previous?.focus?.()
    }
  }, [isCartOpen, closeCart])

  return (
    <AnimatePresence>
      {isCartOpen && (
        <div className="cart-drawer-layer">
          <motion.button className="cart-drawer-backdrop" type="button" aria-label="Close bag" onClick={closeCart}
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} />
          <motion.aside className="cart-drawer" role="dialog" aria-modal="true" aria-labelledby="cart-drawer-title"
            initial={reduceMotion ? false : { x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
            transition={{ duration: reduceMotion ? 0.01 : 0.32, ease: [0.22, 1, 0.36, 1] }}>
            <header className="cart-drawer-head">
              <div><p className="eyebrow">NOBI / Selection</p><h2 id="cart-drawer-title">Your bag <span>({count})</span></h2></div>
              <button type="button" className="cart-drawer-close" onClick={closeCart} aria-label="Close bag">×</button>
            </header>
            {items.length ? (
              <>
                <ul className="cart-drawer-items">
                  {items.map((item) => (
                    <li className="cart-drawer-item" key={item.key}>
                      <Link to={`/product/${item.id}`} onClick={closeCart} className="cart-drawer-image"><img src={item.image} alt={item.name} /></Link>
                      <div className="cart-drawer-info">
                        <p className="eyebrow">{item.color} · {item.size}</p>
                        <Link to={`/product/${item.id}`} onClick={closeCart}><strong>{item.name}</strong></Link>
                        <span>${item.price.toFixed(2)}</span>
                        <div className="cart-drawer-controls">
                          <button type="button" onClick={() => updateQty(item.key, item.qty - 1)} aria-label={`Decrease ${item.name} quantity`}>−</button>
                          <span>{item.qty}</span>
                          <button type="button" onClick={() => updateQty(item.key, item.qty + 1)} disabled={item.qty >= 99} aria-label={`Increase ${item.name} quantity`}>+</button>
                          <button type="button" className="cart-drawer-remove" onClick={() => removeItem(item.key)} data-sound="remove">Remove</button>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
                <footer className="cart-drawer-footer">
                  <div className="cart-drawer-subtotal"><span>Subtotal</span><strong>${subtotal.toFixed(2)}</strong></div>
                  <p>Shipping and taxes are calculated at checkout.</p>
                  <Link to="/checkout" className="btn btn-primary" onClick={closeCart}>Continue to checkout ↗</Link>
                  <Link to="/cart" className="cart-drawer-view" onClick={closeCart}>View full bag</Link>
                </footer>
              </>
            ) : (
              <div className="cart-drawer-empty"><p>Your bag is waiting for its first piece.</p><Link to="/shop" className="btn btn-primary" onClick={closeCart}>Explore the drop ↗</Link></div>
            )}
          </motion.aside>
        </div>
      )}
    </AnimatePresence>
  )
}
