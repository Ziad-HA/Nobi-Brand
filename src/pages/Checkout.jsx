import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useCart } from '../context/CartContext'
import { isSupabaseConfigured, supabase } from '../lib/supabase'
import usePageMeta from '../lib/usePageMeta'

export default function Checkout() {
  const { items, subtotal, clearCart } = useCart()
  const navigate = useNavigate()
  const [status, setStatus] = useState('idle')
  const [message, setMessage] = useState('')
  const [orderId, setOrderId] = useState('')
  usePageMeta('Checkout')

  if (!items.length && !orderId) {
    return (
      <section className="section cart-empty">
        <p className="eyebrow">UNSEEN / Checkout</p>
        <h1>Your bag is empty<span>.</span></h1>
        <Link to="/shop" className="btn btn-primary">Shop the drop</Link>
      </section>
    )
  }

  async function onSubmit(event) {
    event.preventDefault()
    if (!supabase || !isSupabaseConfigured) {
      setStatus('error')
      setMessage('Checkout is temporarily unavailable. Please try again later.')
      return
    }

    const form = event.currentTarget
    const formData = new FormData(form)
    const orderItems = items.map((item) => ({
      product_id: item.id,
      quantity: item.qty,
      selected_color: item.color,
      selected_size: item.size,
    }))

    setStatus('loading')
    setMessage('')

    try {
      const { data, error } = await supabase.rpc('place_order', {
        p_customer_name: String(formData.get('name') || '').trim(),
        p_customer_email: String(formData.get('email') || '').trim(),
        p_customer_phone: String(formData.get('phone') || '').trim(),
        p_address: String(formData.get('address') || '').trim(),
        p_city: String(formData.get('city') || '').trim(),
        p_postal_code: String(formData.get('postal') || '').trim() || null,
        p_delivery_note: String(formData.get('note') || '').trim() || null,
        p_items: orderItems,
      })

      if (error) throw error
      if (!data) throw new Error('The order could not be confirmed. Please try again.')

      setOrderId(data)
      clearCart()
      setStatus('success')
    } catch (error) {
      setStatus('error')
      const readableError =
        error?.message ||
        error?.details ||
        error?.hint ||
        (typeof error === 'string' ? error : '') ||
        'Unknown checkout error. Please try again.'
      console.error('UNSEEN checkout error:', error)
      setMessage(readableError)
    }
  }

  if (orderId) {
    return (
      <section className="section cart-empty checkout-success">
        <p className="eyebrow">UNSEEN / Order confirmed</p>
        <h1>You’re on the list<span>.</span></h1>
        <p className="muted">Your order has been saved. Payment is due on delivery.</p>
        <p className="muted" style={{ overflowWrap: 'anywhere' }}>Order reference: {orderId}</p>
        <button className="btn btn-primary" onClick={() => navigate('/shop')}>Keep exploring ↗</button>
      </section>
    )
  }

  return (
    <section className="section checkout-page checkout-page-upgraded">
      <div className="checkout-heading">
        <p className="eyebrow">UNSEEN / Final step</p>
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

          <p className="checkout-demo-note">Cash on delivery. No online payment is collected.</p>
          {message && <p className="muted" role="alert">{message}</p>}
          <button className="btn btn-primary checkout-submit" type="submit" disabled={status === 'loading'}>
            {status === 'loading' ? 'Placing order...' : `Place order · $${subtotal.toFixed(2)}`}
          </button>
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
          <p className="checkout-summary-note">Shipping is not included. Payment is due on delivery.</p>
          <Link to="/cart" className="cart-continue-link">← Edit your bag</Link>
        </aside>
      </div>
    </section>
  )
}
