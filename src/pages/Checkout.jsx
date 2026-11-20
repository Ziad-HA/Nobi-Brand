import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useCart } from '../context/CartContext'
import { isSupabaseConfigured, supabase } from '../lib/supabase'
import usePageMeta from '../lib/usePageMeta'

const money = (value) => new Intl.NumberFormat('en-EG', { style: 'currency', currency: 'EGP', maximumFractionDigits: 0 }).format(Number(value || 0))

export default function Checkout() {
  const { items, subtotal, clearCart } = useCart()
  const navigate = useNavigate()
  const [status, setStatus] = useState('idle')
  const [message, setMessage] = useState('')
  const [orderId, setOrderId] = useState('')
  const [couponCode, setCouponCode] = useState('')
  const [appliedCoupon, setAppliedCoupon] = useState(null)
  const [couponStatus, setCouponStatus] = useState('idle')
  const [couponMessage, setCouponMessage] = useState('')
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

  const orderItems = items.map((item) => ({
    product_id: item.id,
    quantity: item.qty,
    selected_color: item.color,
    selected_size: item.size,
  }))

  async function applyCoupon() {
    if (!supabase || !couponCode.trim()) {
      setCouponMessage('Enter a coupon code first.')
      return
    }
    setCouponStatus('loading')
    setCouponMessage('')
    const { data, error } = await supabase.rpc('preview_coupon', {
      p_code: couponCode.trim().toUpperCase(),
      p_items: orderItems,
    })
    if (error) {
      setAppliedCoupon(null)
      setCouponStatus('error')
      setCouponMessage(error.message)
      return
    }
    setAppliedCoupon(data)
    setCouponCode(data.code)
    setCouponStatus('success')
    setCouponMessage('Coupon applied successfully.')
  }

  function removeCoupon() {
    setAppliedCoupon(null)
    setCouponCode('')
    setCouponStatus('idle')
    setCouponMessage('')
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
        p_coupon_code: appliedCoupon?.code || null,
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

          <div className="checkout-coupon">
            <p className="checkout-section-title"><span>03</span> Discount code</p>
            {appliedCoupon ? (
              <div className="checkout-coupon-applied">
                <div><strong>{appliedCoupon.code}</strong><span>Discount applied · {money(appliedCoupon.discount_amount)}</span></div>
                <button type="button" className="text-link" onClick={removeCoupon}>Remove</button>
              </div>
            ) : (
              <div className="checkout-coupon-entry">
                <input
                  value={couponCode}
                  onChange={(event) => setCouponCode(event.target.value.toUpperCase())}
                  placeholder="Enter coupon code"
                  aria-label="Coupon code"
                  autoComplete="off"
                />
                <button type="button" className="btn btn-ghost" onClick={applyCoupon} disabled={couponStatus === 'loading' || !couponCode.trim()}>
                  {couponStatus === 'loading' ? 'Checking…' : 'Apply'}
                </button>
              </div>
            )}
            {couponMessage && <p className={couponStatus === 'error' ? 'checkout-coupon-message is-error' : 'checkout-coupon-message'} role="status">{couponMessage}</p>}
          </div>

          <p className="checkout-demo-note">Cash on delivery. No online payment is collected.</p>
          {message && <p className="muted" role="alert">{message}</p>}
          <button className="btn btn-primary checkout-submit" type="submit" disabled={status === 'loading'}>
            {status === 'loading' ? 'Placing order...' : `Place order · ${money(subtotal)}`}
          </button>
        </form>

        <aside className="checkout-order-summary">
          <p className="eyebrow">Your selection</p>
          <div className="checkout-order-items">
            {items.map((item) => (
              <div className="checkout-order-item" key={item.key}>
                <img src={item.image} alt="" />
                <div><strong>{item.name}</strong><span>{item.color} / {item.size} · Qty {item.qty}</span></div>
                <b>{money(item.price * item.qty)}</b>
              </div>
            ))}
          </div>
          <div className="cart-summary-line"><span>Subtotal</span><strong>{money(appliedCoupon?.subtotal ?? subtotal)}</strong></div>
          {appliedCoupon && <div className="cart-summary-line checkout-discount-line"><span>Discount · {appliedCoupon.code}</span><strong>−{money(appliedCoupon.discount_amount)}</strong></div>}
          <div className="cart-summary-line muted"><span>Shipping</span><span>Not included</span></div>
          <div className="cart-summary-total"><span>Total</span><strong>{money(appliedCoupon?.total ?? subtotal)}</strong></div>
          <p className="checkout-summary-note">Shipping is not included. Payment is due on delivery.</p>
          <Link to="/cart" className="cart-continue-link">← Edit your bag</Link>
        </aside>
      </div>
    </section>
  )
}
