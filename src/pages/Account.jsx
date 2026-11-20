import { useEffect, useState } from 'react'
import { Link, Navigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import usePageMeta from '../lib/usePageMeta'

const money = (value) => new Intl.NumberFormat('en-EG', {
  style: 'currency', currency: 'EGP', maximumFractionDigits: 0,
}).format(Number(value || 0))

const dateTime = (value) => new Intl.DateTimeFormat('en-EG', {
  dateStyle: 'medium', timeStyle: 'short',
}).format(new Date(value))

const readable = (value) => String(value || '—').replaceAll('_', ' ')

export default function Account() {
  const [user, setUser] = useState(null)
  const [checking, setChecking] = useState(true)
  const [orders, setOrders] = useState([])
  const [loadingOrders, setLoadingOrders] = useState(false)
  const [error, setError] = useState('')
  usePageMeta('My Account')

  useEffect(() => {
    if (!supabase) {
      setError('Account services are currently unavailable.')
      setChecking(false)
      return undefined
    }

    let active = true
    const loadOrders = async (userId) => {
      setLoadingOrders(true)
      const { data, error: queryError } = await supabase
        .from('orders')
        .select(`
          id, subtotal, discount_amount, coupon_code, shipping_fee, total, status,
          payment_status, payment_method, created_at,
          order_items (id, product_name, unit_price, quantity, selected_color, selected_size)
        `)
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
      if (!active) return
      if (queryError) setError(queryError.message)
      else setOrders(data || [])
      setLoadingOrders(false)
    }

    supabase.auth.getSession().then(({ data, error: sessionError }) => {
      if (!active) return
      if (sessionError) setError(sessionError.message)
      const sessionUser = data?.session?.user ?? null
      setUser(sessionUser)
      setChecking(false)
      if (sessionUser) loadOrders(sessionUser.id)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!active) return
      const sessionUser = session?.user ?? null
      setUser(sessionUser)
      if (sessionUser) loadOrders(sessionUser.id)
      else setOrders([])
    })

    return () => {
      active = false
      subscription.unsubscribe()
    }
  }, [])

  if (checking) {
    return <section className="section account-page"><p className="eyebrow">UNSEEN / MEMBERS</p><h1>Loading<span>.</span></h1></section>
  }
  if (!user) return <Navigate to="/login" replace />

  return (
    <section className="section account-page">
      <div className="account-heading">
        <div><p className="eyebrow">UNSEEN / MEMBERS AREA</p><h1>MY ACCOUNT<span>.</span></h1><p className="muted">{user.email}</p></div>
        <button className="btn btn-ghost" onClick={() => supabase.auth.signOut()}>Sign out ↗</button>
      </div>
      <div className="account-orders-heading"><div><p className="eyebrow">YOUR ACTIVITY</p><h2>ORDER HISTORY</h2></div><span>{orders.length} ORDERS</span></div>
      {error && <p className="account-message" role="alert">{error}</p>}
      {loadingOrders ? <div className="account-empty">Loading your orders…</div> : orders.length ? (
        <div className="account-order-list">
          {orders.map((order) => (
            <article className="account-order-card" key={order.id}>
              <div className="account-order-top">
                <div><span>ORDER REF</span><strong>#{order.id.slice(0, 8).toUpperCase()}</strong></div>
                <div><span>PLACED</span><strong>{dateTime(order.created_at)}</strong></div>
                <div><span>STATUS</span><strong className="account-order-status">{readable(order.status)}</strong></div>
                <div><span>TOTAL</span><strong>{money(order.total)}</strong></div>
              </div>
              <div className="account-order-items">
                {(order.order_items || []).map((item) => (
                  <div className="account-order-item" key={item.id}>
                    <span>{item.product_name} · {item.selected_color || '—'} / {item.selected_size || '—'} · Qty {item.quantity}</span>
                    <strong>{money(Number(item.unit_price) * Number(item.quantity))}</strong>
                  </div>
                ))}
              </div>
              <div className="account-order-bottom">
                {order.coupon_code && <span>Coupon {order.coupon_code} · −{money(order.discount_amount)}</span>}
                <span>Payment: {readable(order.payment_method)} / {readable(order.payment_status)}</span>
              </div>
            </article>
          ))}
        </div>
      ) : (
        <div className="account-empty"><p>No orders are linked to this account yet.</p><Link className="btn btn-primary" to="/shop">Explore the collection ↗</Link></div>
      )}
    </section>
  )
}
