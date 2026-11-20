import { useEffect, useState } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
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
  const [notifications, setNotifications] = useState([])
  const [loadingOrders, setLoadingOrders] = useState(false)
  const [error, setError] = useState('')
  const [signingOut, setSigningOut] = useState(false)
  const navigate = useNavigate()
  usePageMeta('My Account')

  useEffect(() => {
    if (!supabase) {
      setError('Account services are currently unavailable.')
      setChecking(false)
      return undefined
    }

    let active = true
    let currentUserId = null

    const loadOrders = async (userId) => {
      setLoadingOrders(true)
      const { data, error: queryError } = await supabase
        .from('orders')
        .select(`
          id, subtotal, discount_amount, coupon_code, shipping_fee, total, status, updated_at,
          payment_status, payment_method, created_at,
          order_items (id, product_name, unit_price, quantity, selected_color, selected_size)
        `)
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
      if (!active || currentUserId !== userId) return
      if (queryError) setError(queryError.message)
      else {
        setError('')
        setOrders(data || [])
      }
      setLoadingOrders(false)
    }

    const loadNotifications = async (userId) => {
      const { data, error: notificationError } = await supabase
        .from('order_notifications')
        .select('id, order_id, old_status, new_status, message, is_read, created_at')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(20)
      if (!active || currentUserId !== userId) return
      if (notificationError) setError(notificationError.message)
      else setNotifications(data || [])
    }

    const syncSession = (session) => {
      if (!active) return
      const nextUser = session?.user ?? null
      currentUserId = nextUser?.id ?? null
      setUser(nextUser)
      setChecking(false)
      if (nextUser) {
        loadOrders(nextUser.id)
        loadNotifications(nextUser.id)
      } else {
        setOrders([])
        setNotifications([])
        setLoadingOrders(false)
      }
    }

    supabase.auth.getSession().then(({ data, error: sessionError }) => {
      if (!active) return
      if (sessionError) setError(sessionError.message)
      syncSession(data?.session ?? null)
    }).catch(() => {
      if (active) {
        setError('Could not load your account. Please refresh and try again.')
        setChecking(false)
      }
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      syncSession(session)
    })

    let notificationChannel = null
    supabase.auth.getSession().then(({ data }) => {
      const id = data?.session?.user?.id
      if (!id || !active) return
      notificationChannel = supabase.channel(`customer-order-notifications-${id}`)
        .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'order_notifications', filter: `user_id=eq.${id}` }, (payload) => {
          setNotifications((current) => [payload.new, ...current].slice(0, 20))
        }).subscribe()
    })

    return () => {
      active = false
      subscription.unsubscribe()
      if (notificationChannel) supabase.removeChannel(notificationChannel)
    }
  }, [])

  async function markNotificationRead(notification) {
    const { error: updateError } = await supabase.from('order_notifications')
      .update({ is_read: true }).eq('id', notification.id)
    if (!updateError) setNotifications((current) => current.map((item) => item.id === notification.id ? { ...item, is_read: true } : item))
  }

  async function handleSignOut() {
    if (!supabase) return
    setSigningOut(true)
    const { error: signOutError } = await supabase.auth.signOut()
    setSigningOut(false)
    if (signOutError) setError(signOutError.message)
    else navigate('/login', { replace: true })
  }

  if (checking) {
    return <section className="section account-page"><p className="eyebrow">UNSEEN / MEMBERS</p><h1>LOADING<span>.</span></h1></section>
  }
  if (!user) return <Navigate to="/login" replace state={{ from: { pathname: '/account' } }} />

  const displayName = user.user_metadata?.full_name || user.email

  return (
    <section className="section account-page">
      <div className="account-heading">
        <div><p className="eyebrow">UNSEEN / MEMBERS AREA</p><h1>MY ACCOUNT<span>.</span></h1><p className="muted">{displayName}</p><p className="muted">{user.email}</p></div>
        <button className="btn btn-ghost" type="button" onClick={handleSignOut} disabled={signingOut}>{signingOut ? 'Signing out…' : 'Sign out ↗'}</button>
      </div>
      {notifications.length > 0 && <section className="account-notifications"><div className="account-notifications-heading"><div><p className="eyebrow">LIVE UPDATES</p><h2>ORDER NOTIFICATIONS</h2></div><span>{notifications.filter((item) => !item.is_read).length} NEW</span></div>{notifications.map((item) => <article className={`account-notification ${item.is_read ? 'is-read' : ''}`} key={item.id}><div><strong>{item.message}</strong><small>Order #{String(item.order_id).slice(0, 8).toUpperCase()} · {dateTime(item.created_at)}</small></div>{!item.is_read && <button type="button" onClick={() => markNotificationRead(item)}>Mark read</button>}</article>)}</section>}
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
              <div className={`order-tracking ${order.status === 'cancelled' ? 'is-cancelled' : ''}`}>
                <div className="order-tracking-heading">
                  <span>ORDER TRACKING</span>
                  <strong>{order.status === 'cancelled' ? 'ORDER CANCELLED' : `${Math.min(['pending', 'processing', 'shipped', 'delivered'].indexOf(order.status) + 1, 4)} / 4`}</strong>
                </div>
                {order.status === 'cancelled' ? (
                  <p className="order-tracking-cancelled">This order has been cancelled.</p>
                ) : (
                  <div className="order-tracking-steps">
                    {[
                      ['pending', 'Placed'],
                      ['processing', 'Processing'],
                      ['shipped', 'Shipped'],
                      ['delivered', 'Delivered'],
                    ].map(([status, title], index) => {
                      const currentIndex = ['pending', 'processing', 'shipped', 'delivered'].indexOf(order.status);
                      const complete = currentIndex >= index;
                      return <div className={`order-tracking-step ${complete ? 'is-complete' : ''} ${currentIndex === index ? 'is-current' : ''}`} key={status}>
                        <span className="order-tracking-dot">{complete ? '✓' : index + 1}</span>
                        <span>{title}</span>
                      </div>;
                    })}
                  </div>
                )}
                <p className="order-tracking-updated">Last updated: {dateTime(order.updated_at || order.created_at)}</p>
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
