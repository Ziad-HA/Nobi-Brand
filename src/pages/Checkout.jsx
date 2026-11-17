import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useCart } from '../context/CartContext'
import usePageMeta from '../lib/usePageMeta'

export default function Checkout() {
  const { items, subtotal, clearCart } = useCart()
  const navigate = useNavigate()
  const [placed, setPlaced] = useState(false)
  usePageMeta('Checkout')

  if (!items.length && !placed) {
    return (
      <section className="section cart-empty">
        <p className="eyebrow">NOBI / Checkout</p>
        <h1>Your bag is empty<span>.</span></h1>
        <Link to="/shop" className="btn btn-primary">Shop the drop</Link>
      </section>
    )
  }

  const onSubmit = (event) => {
    event.preventDefault()
    clearCart()
    setPlaced(true)
  }

  if (placed) {
    return (
      <section className="section cart-empty checkout-success">
        <p className="eyebrow">NOBI / Demo order</p>
        <h1>You’re on the list<span>.</span></h1>
        <p className="muted">This is a demo checkout. No payment was taken and no real order was sent.</p>
        <button className="btn btn-primary" onClick={() => navigate('/shop')}>Keep exploring ↗</button>
      </section>
    )
  }

  return (
    <section className="section checkout-page checkout-page-upgraded">
      <div className="checkout-heading">
        <p className="eyebrow">NOBI / Final step</p>
        <h1>Make it yours<span>.</span></h1>
        <p className="muted">Add your delivery details and review your selection.</p>
      </div>

      <div className="checkout-layout">
        <form className="checkout-form" onSubmit={onSubmit}>
          <div className="checkout-form-section">
            <p className="checkout-section-title"><span>01</span> Contact details</p>
            <label>Full name<input required name="name" autoComplete="name" placeholder="Your full name" /></label>
            <div className="form-row">
              <label>Email<input type="email" required name="email" autoComplete="email" inputMode="email" placeholder="you@example.com" /></label>
              <label>Phone<input type="tel" required name="phone" autoComplete="tel" inputMode="tel" placeholder="+20" /></label>
            </div>
          </div>

          <div className="checkout-form-section">
            <p className="checkout-section-title"><span>02</span> Delivery address</p>
            <label>Street address<input required name="address" autoComplete="street-address" placeholder="Building, street, area" /></label>
            <div className="form-row">
              <label>City<input required name="city" autoComplete="address-level2" placeholder="City" /></label>
              <label>Postal code<input name="postal" autoComplete="postal-code" inputMode="numeric" placeholder="Optional" /></label>
            </div>
            <label>Delivery note <textarea name="note" rows="3" placeholder="Anything the delivery team should know? (optional)" /></label>
          </div>

          <p className="checkout-demo-note">Demo only — this form does not process payments or send orders.</p>
          <button className="btn btn-primary checkout-submit" type="submit" data-sound="confirm">Confirm demo order · ${subtotal.toFixed(2)}</button>
        </form>

        <aside className="checkout-order-summary">
          <p className="eyebrow">Your selection</p>
          <div className="checkout-order-items">
            {items.map((item) => (
              <div className="checkout-order-item" key={item.key}>
                <img src={item.image} alt="" />
                <div><strong>{item.name}</strong><span>{item.color} / {item.size} · Qty {item.qty}</span></div>
                <b>${(item.price * item.qty).toFixed(2)}</b>
              </div>
            ))}
          </div>
          <div className="cart-summary-line"><span>Subtotal</span><strong>${subtotal.toFixed(2)}</strong></div>
          <div className="cart-summary-line muted"><span>Shipping</span><span>Not included</span></div>
          <div className="cart-summary-total"><span>Subtotal</span><strong>${subtotal.toFixed(2)}</strong></div>
          <p className="checkout-summary-note">Shipping and taxes are not included. This is a demo checkout only.</p>
          <Link to="/cart" className="cart-continue-link">← Edit your bag</Link>
        </aside>
      </div>
    </section>
  )
}
