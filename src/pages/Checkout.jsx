import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useCart } from '../context/CartContext'

export default function Checkout() {
  const { items, subtotal, clearCart } = useCart()
  const navigate = useNavigate()
  const [placed, setPlaced] = useState(false)

  if (!items.length && !placed) {
    return (
      <section className="section">
        <h1>Nothing to check out.</h1>
        <Link to="/shop" className="text-link">
          Shop the drop
        </Link>
      </section>
    )
  }

  const onSubmit = (e) => {
    e.preventDefault()
    clearCart()
    setPlaced(true)
  }

  if (placed) {
    return (
      <section className="section cart-empty">
        <p className="eyebrow">Order confirmed</p>
        <h1>You’re on the list.</h1>
        <p className="muted">This is a demo checkout — no payment was taken.</p>
        <button className="btn btn-primary" onClick={() => navigate('/shop')}>
          Keep looking
        </button>
      </section>
    )
  }

  return (
    <section className="section checkout-page">
      <p className="eyebrow">Checkout</p>
      <h1>Ship it.</h1>
      <form className="checkout-form" onSubmit={onSubmit}>
        <label>
          Full name
          <input required placeholder="Name" />
        </label>
        <label>
          Email
          <input type="email" required placeholder="you@night.city" />
        </label>
        <label>
          Address
          <input required placeholder="Street" />
        </label>
        <div className="form-row">
          <label>
            City
            <input required />
          </label>
          <label>
            Postal
            <input required />
          </label>
        </div>
        <p className="muted">Demo only. Card details are not collected.</p>
        <button className="btn btn-primary" type="submit">
          Place order · ${subtotal}
        </button>
      </form>
    </section>
  )
}
