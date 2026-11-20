import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link, Navigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import './AdminDashboard.css'

const money = (value) =>
  new Intl.NumberFormat('en-EG', {
    style: 'currency',
    currency: 'EGP',
    maximumFractionDigits: 0,
  }).format(Number(value || 0))

const dateTime = (value) =>
  new Intl.DateTimeFormat('en-EG', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value))

const statusLabel = (value) => String(value || 'unknown').replaceAll('_', ' ')

export default function AdminDashboard() {
  const [authState, setAuthState] = useState('checking')
  const [user, setUser] = useState(null)
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState('all')
  const [selectedOrder, setSelectedOrder] = useState(null)

  const checkAccess = useCallback(async (sessionUser) => {
    if (!sessionUser) {
      setUser(null)
      setAuthState('signed-out')
      return
    }

    setUser(sessionUser)
    const { data, error: accessError } = await supabase
      .from('admin_users')
      .select('user_id')
      .eq('user_id', sessionUser.id)
      .maybeSingle()

    if (accessError) {
      setError(accessError.message)
      setAuthState('setup-required')
      return
    }

    setAuthState(data ? 'admin' : 'denied')
  }, [])

  useEffect(() => {
    if (!supabase) {
      setAuthState('unconfigured')
      return undefined
    }

    let active = true
    supabase.auth.getSession().then(({ data, error: sessionError }) => {
      if (!active) return
      if (sessionError) {
        setError(sessionError.message)
        setAuthState('error')
        return
      }
      checkAccess(data.session?.user ?? null)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (active) checkAccess(session?.user ?? null)
    })

    return () => {
      active = false
      subscription.unsubscribe()
    }
  }, [checkAccess])

  const loadOrders = useCallback(async () => {
    if (!supabase) return
    setLoading(true)
    setError('')

    const { data, error: queryError } = await supabase
      .from('orders')
      .select(`
        id, customer_name, customer_email, customer_phone,
        address, city, postal_code, delivery_note,
        subtotal, shipping_fee, total, currency, status,
        payment_method, payment_status, created_at,
        order_items (
          id, product_name, unit_price, quantity,
          selected_color, selected_size
        )
      `)
      .order('created_at', { ascending: false })
      .limit(100)

    if (queryError) {
      setError(queryError.message)
    } else {
      setOrders(data || [])
    }
    setLoading(false)
  }, [])

  useEffect(() => {
    if (authState === 'admin') loadOrders()
  }, [authState, loadOrders])

  const filteredOrders = useMemo(() => {
    const query = search.trim().toLowerCase()
    return orders.filter((order) => {
      const matchesFilter = filter === 'all' || order.status === filter
      const matchesSearch = !query || [
        order.customer_name,
        order.customer_email,
        order.customer_phone,
        order.id,
      ].some((value) => String(value || '').toLowerCase().includes(query))
      return matchesFilter && matchesSearch
    })
  }, [orders, search, filter])

  const stats = useMemo(() => ({
    total: orders.length,
    pending: orders.filter((order) => order.status === 'pending').length,
    paid: orders.filter((order) => order.payment_status === 'paid').length,
    revenue: orders
      .filter((order) => order.payment_status === 'paid')
      .reduce((sum, order) => sum + Number(order.total || 0), 0),
  }), [orders])

  async function handleSignOut() {
    await supabase.auth.signOut()
  }

  if (authState === 'checking') {
    return <div className="admin-state">Checking admin access…</div>
  }

  if (authState === 'signed-out') return <Navigate to="/login" replace />
  if (authState === 'unconfigured') {
    return <div className="admin-state"><h1>UNSEEN ADMIN</h1><p>Supabase is not configured.</p></div>
  }
  if (authState === 'denied') {
    return (
      <div className="admin-state">
        <p className="admin-kicker">UNSEEN / PRIVATE ACCESS</p>
        <h1>ACCESS DENIED</h1>
        <p>Your account is not registered as an administrator.</p>
        <button className="admin-button admin-button--quiet" onClick={handleSignOut}>Log out</button>
        <Link to="/" className="admin-back">Back to storefront</Link>
      </div>
    )
  }
  if (authState === 'setup-required' || authState === 'error') {
    return (
      <div className="admin-state">
        <p className="admin-kicker">UNSEEN / SETUP</p>
        <h1>ADMIN SETUP REQUIRED</h1>
        <p>{error || 'Could not verify administrator access.'}</p>
        <p>Check the admin_users table and its Row Level Security policy in Supabase.</p>
      </div>
    )
  }

  return (
    <div className="admin-shell">
      <aside className="admin-sidebar">
        <Link to="/" className="admin-brand">UNSEEN<span>.</span></Link>
        <p className="admin-sidebar-label">WORKSPACE</p>
        <a className="admin-nav-item admin-nav-item--active" href="#overview">Overview</a>
        <a className="admin-nav-item" href="#orders">Orders <span>{stats.total}</span></a>
        <div className="admin-sidebar-bottom">
          <span className="admin-live-dot" />
          <span>Store connected</span>
          <button onClick={handleSignOut}>Log out</button>
        </div>
      </aside>

      <main className="admin-main">
        <header className="admin-topbar">
          <div>
            <p className="admin-kicker">CONTROL ROOM / 001</p>
            <span className="admin-user">{user?.email}</span>
          </div>
          <a href="/" className="admin-store-link">View storefront ↗</a>
        </header>

        <section id="overview" className="admin-heading">
          <div>
            <p className="admin-kicker">OVERVIEW</p>
            <h1>THE BACK OFFICE<span>.</span></h1>
            <p className="admin-subtitle">A clear view of what’s happening at UNSEEN.</p>
          </div>
          <button className="admin-button" onClick={loadOrders} disabled={loading}>
            {loading ? 'Refreshing…' : '↻ Refresh data'}
          </button>
        </section>

        <section className="admin-stats" aria-label="Store statistics">
          <article className="admin-stat">
            <span>ORDERS LOADED</span>
            <strong>{stats.total}</strong>
            <small>Latest 100 orders</small>
          </article>
          <article className="admin-stat">
            <span>NEEDS ATTENTION</span>
            <strong>{stats.pending}</strong>
            <small>Orders awaiting processing</small>
          </article>
          <article className="admin-stat">
            <span>PAID ORDERS</span>
            <strong>{stats.paid}</strong>
            <small>Payment confirmed</small>
          </article>
          <article className="admin-stat admin-stat--accent">
            <span>PAID REVENUE</span>
            <strong>{money(stats.revenue)}</strong>
            <small>Confirmed payments only</small>
          </article>
        </section>

        <section id="orders" className="admin-orders">
          <div className="admin-section-head">
            <div>
              <p className="admin-kicker">COMMERCE / ACTIVITY</p>
              <h2>RECENT ORDERS</h2>
            </div>
            <span className="admin-count">{filteredOrders.length} RESULTS</span>
          </div>

          <div className="admin-toolbar">
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search name, email, phone or order ID…"
              aria-label="Search orders"
            />
            <select value={filter} onChange={(event) => setFilter(event.target.value)} aria-label="Filter orders">
              <option value="all">All statuses</option>
              <option value="pending">Pending</option>
              <option value="processing">Processing</option>
              <option value="shipped">Shipped</option>
              <option value="delivered">Delivered</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>

          {error && <p className="admin-error" role="alert">{error}</p>}
          {loading && orders.length === 0 ? (
            <div className="admin-empty">Loading orders…</div>
          ) : filteredOrders.length === 0 ? (
            <div className="admin-empty">No orders match this view.</div>
          ) : (
            <div className="admin-table-wrap">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>ORDER</th>
                    <th>CUSTOMER</th>
                    <th>DATE</th>
                    <th>STATUS</th>
                    <th>PAYMENT</th>
                    <th>TOTAL</th>
                    <th />
                  </tr>
                </thead>
                <tbody>
                  {filteredOrders.map((order) => (
                    <tr key={order.id}>
                      <td className="admin-order-id">#{order.id.slice(0, 8).toUpperCase()}</td>
                      <td><strong>{order.customer_name}</strong><small>{order.customer_email}</small></td>
                      <td>{dateTime(order.created_at)}</td>
                      <td><span className={`admin-pill admin-pill--${order.status}`}>{statusLabel(order.status)}</span></td>
                      <td><span className="admin-payment">{statusLabel(order.payment_status)}</span></td>
                      <td className="admin-total">{money(order.total)}</td>
                      <td><button className="admin-view" onClick={() => setSelectedOrder(order)}>View ↗</button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </main>

      {selectedOrder && (
        <div className="admin-modal-backdrop" role="presentation" onClick={() => setSelectedOrder(null)}>
          <section className="admin-order-modal" role="dialog" aria-modal="true" aria-labelledby="admin-order-title" onClick={(event) => event.stopPropagation()}>
            <button className="admin-modal-close" onClick={() => setSelectedOrder(null)} aria-label="Close order details">×</button>
            <p className="admin-kicker">ORDER DETAILS / {selectedOrder.id.slice(0, 8).toUpperCase()}</p>
            <h2 id="admin-order-title">{selectedOrder.customer_name}</h2>
            <div className="admin-detail-grid">
              <div><span>EMAIL</span><strong>{selectedOrder.customer_email}</strong></div>
              <div><span>PHONE</span><strong>{selectedOrder.customer_phone}</strong></div>
              <div><span>ADDRESS</span><strong>{[selectedOrder.address, selectedOrder.city, selectedOrder.postal_code].filter(Boolean).join(', ')}</strong></div>
              <div><span>ORDER DATE</span><strong>{dateTime(selectedOrder.created_at)}</strong></div>
              <div><span>ORDER STATUS</span><strong>{statusLabel(selectedOrder.status)}</strong></div>
              <div><span>PAYMENT</span><strong>{statusLabel(selectedOrder.payment_method)} / {statusLabel(selectedOrder.payment_status)}</strong></div>
            </div>
            {selectedOrder.delivery_note && <p className="admin-note">NOTE: {selectedOrder.delivery_note}</p>}
            <div className="admin-line-items">
              <p className="admin-kicker">ITEMS</p>
              {(selectedOrder.order_items || []).map((item) => (
                <div className="admin-line-item" key={item.id}>
                  <div><strong>{item.product_name}</strong><small>{[item.selected_color, item.selected_size].filter(Boolean).join(' / ') || 'Standard option'} · Qty {item.quantity}</small></div>
                  <strong>{money(Number(item.unit_price) * Number(item.quantity))}</strong>
                </div>
              ))}
            </div>
            <div className="admin-total-row"><span>Subtotal</span><strong>{money(selectedOrder.subtotal)}</strong></div>
            <div className="admin-total-row"><span>Shipping</span><strong>{money(selectedOrder.shipping_fee)}</strong></div>
            <div className="admin-total-row admin-total-row--final"><span>Total</span><strong>{money(selectedOrder.total)}</strong></div>
          </section>
        </div>
      )}
    </div>
  )
}
