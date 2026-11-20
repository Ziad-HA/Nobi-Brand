import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link, Navigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import './AdminDashboard.css'

const money = (value) => new Intl.NumberFormat('en-EG', {
  style: 'currency', currency: 'EGP', maximumFractionDigits: 0,
}).format(Number(value || 0))

const dateTime = (value) => new Intl.DateTimeFormat('en-EG', {
  dateStyle: 'medium', timeStyle: 'short',
}).format(new Date(value))

const label = (value) => String(value || '—').replaceAll('_', ' ')
const slugify = (value) => value.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')

const emptyProduct = {
  id: '', name: '', price: '', category: '', tag: '', season: '',
  colors: '', sizes: '', images: '', description: '', stock_quantity: '0', low_stock_threshold: '5',
  sold_out: false, is_active: true,
}

export default function AdminDashboard() {
  const [authState, setAuthState] = useState('checking')
  const [user, setUser] = useState(null)
  const [section, setSection] = useState('overview')
  const [orders, setOrders] = useState([])
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(false)
  const [productsLoading, setProductsLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [orderSearch, setOrderSearch] = useState('')
  const [orderFilter, setOrderFilter] = useState('all')
  const [productSearch, setProductSearch] = useState('')
  const [productFilter, setProductFilter] = useState('all')
  const [selectedOrder, setSelectedOrder] = useState(null)
  const [productEditor, setProductEditor] = useState(null)
  const [productForm, setProductForm] = useState(emptyProduct)
  const [coupons, setCoupons] = useState([])
  const [couponsLoading, setCouponsLoading] = useState(false)
  const [couponEditor, setCouponEditor] = useState(null)
  const [couponForm, setCouponForm] = useState({
    code: '', discount_type: 'percent', discount_value: '10', min_order_amount: '0',
    max_discount_amount: '', usage_limit: '', starts_at: '', expires_at: '', is_active: true,
  })

  const checkAccess = useCallback(async (sessionUser) => {
    if (!sessionUser) {
      setUser(null)
      setAuthState('signed-out')
      return
    }
    setUser(sessionUser)
    const { data, error: accessError } = await supabase
      .from('admin_users').select('user_id').eq('user_id', sessionUser.id).maybeSingle()
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
      } else {
        checkAccess(data.session?.user ?? null)
      }
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
    const { data, error: queryError } = await supabase
      .from('orders')
      .select(`
        id, customer_name, customer_email, customer_phone, address, city,
        postal_code, delivery_note, subtotal, shipping_fee, total, currency,
        status, payment_method, payment_status, created_at,
        order_items (id, product_name, unit_price, quantity, selected_color, selected_size)
      `)
      .order('created_at', { ascending: false }).limit(100)
    if (queryError) setError(queryError.message)
    else setOrders(data || [])
    setLoading(false)
  }, [])

  const loadProducts = useCallback(async () => {
    if (!supabase) return
    setProductsLoading(true)
    const { data, error: queryError } = await supabase
      .from('products')
      .select('id, name, price, category, tag, season, colors, sizes, sold_out, images, description, is_active, stock_quantity, low_stock_threshold, created_at')
      .order('created_at', { ascending: false })
    if (queryError) setError(queryError.message)
    else setProducts(data || [])
    setProductsLoading(false)
  }, [])

  const loadCoupons = useCallback(async () => {
    if (!supabase) return
    setCouponsLoading(true)
    const { data, error: queryError } = await supabase
      .from('coupons')
      .select('id, code, discount_type, discount_value, min_order_amount, max_discount_amount, usage_limit, usage_count, starts_at, expires_at, is_active, created_at')
      .order('created_at', { ascending: false })
    if (queryError) setError(queryError.message)
    else setCoupons(data || [])
    setCouponsLoading(false)
  }, [])

  useEffect(() => {
    if (authState === 'admin') {
      loadOrders()
      loadProducts()
      loadCoupons()
    }
  }, [authState, loadOrders, loadProducts, loadCoupons])

  useEffect(() => {
    if (authState !== 'admin' || !supabase) return undefined
    const channel = supabase
      .channel('unseen-admin-order-alerts')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'orders',
      }, (payload) => {
        const order = payload.new || {}
        setNotice(`New order received: #${String(order.id || '').slice(0, 8).toUpperCase()} · ${order.customer_name || 'Customer'}.`)
        loadOrders()
      })
      .subscribe()
    return () => { supabase.removeChannel(channel) }
  }, [authState, loadOrders])

  const filteredOrders = useMemo(() => {
    const query = orderSearch.trim().toLowerCase()
    return orders.filter((order) => {
      const matchesStatus = orderFilter === 'all' || order.status === orderFilter
      const matchesQuery = !query || [order.customer_name, order.customer_email, order.customer_phone, order.id]
        .some((value) => String(value || '').toLowerCase().includes(query))
      return matchesStatus && matchesQuery
    })
  }, [orders, orderSearch, orderFilter])

  const filteredProducts = useMemo(() => {
    const query = productSearch.trim().toLowerCase()
    return products.filter((product) => {
      const matchesQuery = !query || [product.name, product.id, product.category, product.tag]
        .some((value) => String(value || '').toLowerCase().includes(query))
      const matchesFilter = productFilter === 'all'
        || (productFilter === 'active' && product.is_active && !product.sold_out)
        || (productFilter === 'sold' && product.sold_out)
        || (productFilter === 'hidden' && !product.is_active)
        || (productFilter === 'low' && product.stock_quantity != null && Number(product.stock_quantity) > 0 && Number(product.stock_quantity) <= Number(product.low_stock_threshold ?? 5))
        || (productFilter === 'out' && product.stock_quantity != null && Number(product.stock_quantity) === 0)
      return matchesQuery && matchesFilter
    })
  }, [products, productSearch, productFilter])

  const stats = useMemo(() => ({
    orders: orders.length,
    pending: orders.filter((order) => order.status === 'pending').length,
    paid: orders.filter((order) => order.payment_status === 'paid').length,
    revenue: orders.filter((order) => order.payment_status === 'paid')
      .reduce((sum, order) => sum + Number(order.total || 0), 0),
    products: products.length,
    activeProducts: products.filter((product) => product.is_active && !product.sold_out).length,
    lowStock: products.filter((product) => product.stock_quantity != null && Number(product.stock_quantity) > 0 && Number(product.stock_quantity) <= Number(product.low_stock_threshold ?? 5)).length,
    outOfStock: products.filter((product) => product.stock_quantity != null && Number(product.stock_quantity) === 0).length,
  }), [orders, products])

  async function refreshAll() {
    setError('')
    await Promise.all([loadOrders(), loadProducts(), loadCoupons()])
  }

  async function updateOrderStatus(order, nextStatus) {
    if (!order || !nextStatus || order.status === nextStatus) return
    setError('')
    setNotice('')
    const { error: updateError } = await supabase
      .from('orders')
      .update({ status: nextStatus, updated_at: new Date().toISOString() })
      .eq('id', order.id)
    if (updateError) {
      setError(updateError.message)
      return
    }
    const updatedOrder = { ...order, status: nextStatus }
    setSelectedOrder(updatedOrder)
    setOrders((current) => current.map((item) => item.id === order.id ? updatedOrder : item))
    setNotice(`Order #${order.id.slice(0, 8).toUpperCase()} updated to ${label(nextStatus)}.`)
  }

  function openNewCoupon() {
    setCouponForm({
      code: '', discount_type: 'percent', discount_value: '10', min_order_amount: '0',
      max_discount_amount: '', usage_limit: '', starts_at: '', expires_at: '', is_active: true,
    })
    setCouponEditor('new')
  }

  function openEditCoupon(coupon) {
    const toLocal = (value) => value ? new Date(value).toISOString().slice(0, 16) : ''
    setCouponForm({
      code: coupon.code,
      discount_type: coupon.discount_type,
      discount_value: String(coupon.discount_value),
      min_order_amount: String(coupon.min_order_amount ?? 0),
      max_discount_amount: coupon.max_discount_amount == null ? '' : String(coupon.max_discount_amount),
      usage_limit: coupon.usage_limit == null ? '' : String(coupon.usage_limit),
      starts_at: toLocal(coupon.starts_at),
      expires_at: toLocal(coupon.expires_at),
      is_active: Boolean(coupon.is_active),
    })
    setCouponEditor(coupon.id)
  }

  async function saveCoupon(event) {
    event.preventDefault()
    const code = couponForm.code.trim().toUpperCase()
    const value = Number(couponForm.discount_value)
    const minimum = Number(couponForm.min_order_amount || 0)
    const maxDiscount = couponForm.max_discount_amount === '' ? null : Number(couponForm.max_discount_amount)
    const usageLimit = couponForm.usage_limit === '' ? null : Number(couponForm.usage_limit)
    if (!/^[A-Z0-9_-]{3,30}$/.test(code)) {
      setError('Coupon code must be 3–30 characters using letters, numbers, _ or -.')
      return
    }
    if (!Number.isFinite(value) || value <= 0 || (couponForm.discount_type === 'percent' && value > 100)) {
      setError('Enter a valid discount value. Percentage must be 1–100.')
      return
    }
    if (!Number.isFinite(minimum) || minimum < 0 || (maxDiscount !== null && (!Number.isFinite(maxDiscount) || maxDiscount <= 0)) || (usageLimit !== null && (!Number.isInteger(usageLimit) || usageLimit <= 0))) {
      setError('Check the minimum amount, maximum discount and usage limit.')
      return
    }
    const payload = {
      code,
      discount_type: couponForm.discount_type,
      discount_value: value,
      min_order_amount: minimum,
      max_discount_amount: maxDiscount,
      usage_limit: usageLimit,
      starts_at: couponForm.starts_at ? new Date(couponForm.starts_at).toISOString() : null,
      expires_at: couponForm.expires_at ? new Date(couponForm.expires_at).toISOString() : null,
      is_active: couponForm.is_active,
      updated_at: new Date().toISOString(),
    }
    setSaving(true)
    setError('')
    const query = couponEditor === 'new'
      ? supabase.from('coupons').insert(payload)
      : supabase.from('coupons').update(payload).eq('id', couponEditor)
    const { error: saveError } = await query
    setSaving(false)
    if (saveError) {
      setError(saveError.message)
      return
    }
    setCouponEditor(null)
    setNotice(couponEditor === 'new' ? 'Coupon created.' : 'Coupon updated.')
    await loadCoupons()
  }

  async function toggleCoupon(coupon) {
    const { error: updateError } = await supabase.from('coupons')
      .update({ is_active: !coupon.is_active, updated_at: new Date().toISOString() })
      .eq('id', coupon.id)
    if (updateError) setError(updateError.message)
    else {
      setNotice(coupon.is_active ? 'Coupon disabled.' : 'Coupon activated.')
      await loadCoupons()
    }
  }

  async function deleteCoupon(coupon) {
    if (!window.confirm(`Delete coupon ${coupon.code}?`)) return
    const { error: deleteError } = await supabase.from('coupons').delete().eq('id', coupon.id)
    if (deleteError) setError(deleteError.message)
    else {
      setNotice('Coupon deleted.')
      await loadCoupons()
    }
  }

  async function handleSignOut() {
    await supabase.auth.signOut()
  }

  function openNewProduct() {
    setProductForm(emptyProduct)
    setProductEditor('new')
  }

  function openEditProduct(product) {
    setProductForm({
      id: product.id || '',
      name: product.name || '',
      price: String(product.price ?? ''),
      category: product.category || '',
      tag: product.tag || '',
      season: product.season || '',
      colors: (product.colors || []).join(', '),
      sizes: (product.sizes || []).join(', '),
      images: (product.images || []).join('\n'),
      description: product.description || '',
      sold_out: Boolean(product.sold_out),
      is_active: product.is_active !== false,
      stock_quantity: String(product.stock_quantity ?? ''),
      low_stock_threshold: String(product.low_stock_threshold ?? 5),
    })
    setProductEditor('edit')
  }

  function updateProductField(field, value) {
    setProductForm((current) => {
      const next = { ...current, [field]: value }
      if (field === 'name' && productEditor === 'new' && !current.id) {
        next.id = slugify(value)
      }
      return next
    })
  }

  async function saveProduct(event) {
    event.preventDefault()
    if (!productForm.name.trim() || !productForm.id.trim() || productForm.price === '') {
      setError('Product name, product ID and price are required.')
      return
    }
    const price = Number(productForm.price)
    if (!Number.isFinite(price) || price < 0) {
      setError('Enter a valid price in EGP.')
      return
    }
    const payload = {
      id: productForm.id.trim(),
      name: productForm.name.trim(),
      price,
      category: productForm.category.trim() || null,
      tag: productForm.tag.trim() || null,
      season: productForm.season.trim() || null,
      colors: productForm.colors.split(',').map((item) => item.trim()).filter(Boolean),
      sizes: productForm.sizes.split(',').map((item) => item.trim()).filter(Boolean),
      images: productForm.images.split('\n').map((item) => item.trim()).filter(Boolean),
      description: productForm.description.trim() || null,
      sold_out: Number(productForm.stock_quantity) === 0 || productForm.sold_out,
      is_active: productForm.is_active,
      stock_quantity: Math.max(0, Math.floor(Number(productForm.stock_quantity || 0))),
      low_stock_threshold: Math.max(0, Math.floor(Number(productForm.low_stock_threshold || 0))),
      updated_at: new Date().toISOString(),
    }
    setSaving(true)
    setError('')
    setNotice('')
    const query = productEditor === 'edit'
      ? supabase.from('products').update(payload).eq('id', productForm.id)
      : supabase.from('products').insert(payload)
    const { error: saveError } = await query
    setSaving(false)
    if (saveError) {
      setError(saveError.message)
      return
    }
    setProductEditor(null)
    setNotice(productEditor === 'edit' ? 'Product updated successfully.' : 'Product created successfully.')
    await loadProducts()
  }

  async function deleteProduct(product) {
    const confirmed = window.confirm(`Delete “${product.name}”? This cannot be undone.`)
    if (!confirmed) return
    setError('')
    setNotice('')
    const { error: deleteError } = await supabase.from('products').delete().eq('id', product.id)
    if (deleteError) {
      setError(deleteError.message)
      return
    }
    setNotice('Product deleted.')
    await loadProducts()
  }

  async function toggleProduct(product, field) {
    const { error: updateError } = await supabase.from('products')
      .update({ [field]: !product[field], updated_at: new Date().toISOString() })
      .eq('id', product.id)
    if (updateError) setError(updateError.message)
    else {
      setNotice(field === 'sold_out'
        ? (!product.sold_out ? 'Product marked as sold out.' : 'Product marked as available.')
        : (!product.is_active ? 'Product published.' : 'Product hidden from the storefront.'))
      await loadProducts()
    }
  }

  if (authState === 'checking') return <div className="admin-state"><span className="admin-loader" />Verifying secure access…</div>
  if (authState === 'signed-out') return <Navigate to="/login" replace />
  if (authState === 'unconfigured') return <div className="admin-state"><h1>UNSEEN ADMIN</h1><p>Supabase is not configured.</p></div>
  if (authState === 'denied') return (
    <div className="admin-state">
      <p className="admin-eyebrow">UNSEEN / PRIVATE ACCESS</p><h1>ACCESS DENIED</h1>
      <p>This account does not have administrator permissions.</p>
      <button className="admin-btn admin-btn--secondary" onClick={handleSignOut}>Sign out</button>
      <Link to="/" className="admin-text-link">Back to storefront</Link>
    </div>
  )
  if (authState === 'setup-required' || authState === 'error') return (
    <div className="admin-state">
      <p className="admin-eyebrow">UNSEEN / SETUP</p><h1>ADMIN SETUP REQUIRED</h1>
      <p>{error || 'Could not verify administrator access.'}</p>
      <p>Check the admin_users table and its SELECT policy in Supabase.</p>
    </div>
  )

  return (
    <div className="admin-app">
      <aside className="admin-rail">
        <Link to="/" className="admin-wordmark">UNSEEN<span>®</span></Link>
        <div className="admin-rail-label">MANAGEMENT</div>
        <nav className="admin-nav">
          <button className={section === 'overview' ? 'is-active' : ''} onClick={() => setSection('overview')}><span>◫</span> Overview</button>
          <button className={section === 'orders' ? 'is-active' : ''} onClick={() => setSection('orders')}><span>▤</span> Orders <i>{stats.orders}</i></button>
          <button className={section === 'products' ? 'is-active' : ''} onClick={() => setSection('products')}><span>▦</span> Products <i>{stats.products}</i></button>
          <button className={section === 'coupons' ? 'is-active' : ''} onClick={() => setSection('coupons')}><span>%</span> Coupons <i>{coupons.length}</i></button>
        </nav>
        <div className="admin-rail-bottom">
          <div className="admin-connection"><span /> STORE CONNECTED</div>
          <div className="admin-account"><div className="admin-avatar">{(user?.email || 'A').slice(0, 1).toUpperCase()}</div><div><strong>Administrator</strong><small>{user?.email}</small></div></div>
          <button className="admin-logout" onClick={handleSignOut}>↗ Sign out</button>
        </div>
      </aside>

      <main className="admin-workspace">
        <header className="admin-header">
          <div className="admin-breadcrumb">UNSEEN <span>/</span> ADMIN <span>/</span> {section.toUpperCase()}</div>
          <div className="admin-header-actions"><span className="admin-header-date">{new Intl.DateTimeFormat('en-EG', { dateStyle: 'full' }).format(new Date())}</span><Link to="/" className="admin-storefront">Storefront ↗</Link></div>
        </header>

        <div className="admin-content">
          {error && <div className="admin-alert admin-alert--error"><span>!</span>{error}<button onClick={() => setError('')}>×</button></div>}
          {notice && <div className="admin-alert admin-alert--success"><span>✓</span>{notice}<button onClick={() => setNotice('')}>×</button></div>}

          {section === 'overview' && (
            <>
              <section className="admin-page-intro">
                <div><p className="admin-eyebrow">YOUR STORE AT A GLANCE</p><h1>COMMAND<br /><em>CENTER.</em></h1><p>Everything happening inside UNSEEN, in one place.</p></div>
                <button className="admin-btn admin-btn--secondary" onClick={refreshAll} disabled={loading || productsLoading}>↻ {loading || productsLoading ? 'Refreshing' : 'Refresh data'}</button>
              </section>
              <section className="admin-metric-grid">
                <article className="admin-metric"><div className="admin-metric-top"><span>ORDERS</span><span className="admin-metric-icon">↗</span></div><strong>{stats.orders}</strong><small>Latest 100 orders</small></article>
                <article className="admin-metric"><div className="admin-metric-top"><span>TO PROCESS</span><span className="admin-metric-icon">◷</span></div><strong>{stats.pending}</strong><small>Pending orders</small></article>
                <article className="admin-metric"><div className="admin-metric-top"><span>LIVE PRODUCTS</span><span className="admin-metric-icon">▦</span></div><strong>{stats.activeProducts}<small className="admin-metric-total"> / {stats.products}</small></strong><small>Published and available</small></article>
                <article className="admin-metric admin-metric--lime"><div className="admin-metric-top"><span>PAID REVENUE</span><span className="admin-metric-icon">↗</span></div><strong className="admin-revenue">{money(stats.revenue)}</strong><small>{stats.paid} confirmed payments</small></article>
              </section>
              <section className="admin-overview-grid">
                <div className="admin-panel">
                  <div className="admin-panel-heading"><div><p className="admin-eyebrow">LATEST ACTIVITY</p><h2>RECENT ORDERS</h2></div><button className="admin-inline-link" onClick={() => setSection('orders')}>All orders ↗</button></div>
                  {orders.slice(0, 5).length ? orders.slice(0, 5).map((order) => (
                    <button className="admin-recent-order" key={order.id} onClick={() => setSelectedOrder(order)}>
                      <span className="admin-order-ref">#{order.id.slice(0, 8).toUpperCase()}</span><span className="admin-recent-customer"><strong>{order.customer_name}</strong><small>{dateTime(order.created_at)}</small></span><span className="admin-recent-total">{money(order.total)}</span><span className="admin-arrow">↗</span>
                    </button>
                  )) : <div className="admin-blank">No orders have arrived yet.</div>}
                </div>
                <div className="admin-panel admin-inventory-panel">
                  <p className="admin-eyebrow">CATALOG SNAPSHOT</p><h2>YOUR PRODUCTS</h2>
                  <div className="admin-inventory-number">{stats.products.toString().padStart(2, '0')}<span> PRODUCTS</span></div>
                  <div className="admin-inventory-line"><span>Published & available</span><strong>{stats.activeProducts}</strong></div>
                  <div className="admin-inventory-line"><span>Low stock</span><strong>{stats.lowStock}</strong></div><div className="admin-inventory-line"><span>Out of stock</span><strong>{stats.outOfStock}</strong></div>
                  <button className="admin-btn admin-btn--lime admin-full-btn" onClick={() => setSection('products')}>Manage catalog ↗</button>
                </div>
              </section>
            </>
          )}

          {section === 'orders' && (
            <section className="admin-page-section">
              <div className="admin-section-title"><div><p className="admin-eyebrow">COMMERCE / FULFILLMENT</p><h1>ORDERS<span>.</span></h1><p>Review customer purchases and payment details.</p></div><button className="admin-btn admin-btn--secondary" onClick={loadOrders} disabled={loading}>↻ Refresh</button></div>
              <div className="admin-toolbar"><input value={orderSearch} onChange={(event) => setOrderSearch(event.target.value)} placeholder="Search customer, email, phone or order ID…" /><select value={orderFilter} onChange={(event) => setOrderFilter(event.target.value)}><option value="all">All statuses</option><option value="pending">Pending</option><option value="processing">Processing</option><option value="shipped">Shipped</option><option value="delivered">Delivered</option><option value="cancelled">Cancelled</option></select></div>
              <div className="admin-table-shell"><table className="admin-data-table"><thead><tr><th>ORDER ID</th><th>CUSTOMER</th><th>DATE</th><th>STATUS</th><th>PAYMENT</th><th>TOTAL</th><th /></tr></thead><tbody>
                {filteredOrders.map((order) => <tr key={order.id}><td className="admin-mono">#{order.id.slice(0, 8).toUpperCase()}</td><td><strong>{order.customer_name}</strong><small>{order.customer_email}</small></td><td>{dateTime(order.created_at)}</td><td><span className={`admin-status admin-status--${order.status}`}>{label(order.status)}</span></td><td>{label(order.payment_status)}</td><td className="admin-money">{money(order.total)}</td><td><button className="admin-row-action" onClick={() => setSelectedOrder(order)}>Details ↗</button></td></tr>)}
              </tbody></table>{!filteredOrders.length && <div className="admin-blank">{loading ? 'Loading orders…' : 'No orders match your search.'}</div>}</div>
            </section>
          )}

          {section === 'products' && (
            <section className="admin-page-section">
              <div className="admin-section-title"><div><p className="admin-eyebrow">CATALOG / INVENTORY</p><h1>PRODUCTS<span>.</span></h1><p>Build, update and control your storefront catalog.</p></div><button className="admin-btn admin-btn--lime" onClick={openNewProduct}>＋ Add product</button></div>
              <div className="admin-product-summary"><div><strong>{stats.products}</strong><span>ALL PRODUCTS</span></div><div><strong>{stats.activeProducts}</strong><span>LIVE & AVAILABLE</span></div><div><strong>{stats.lowStock}</strong><span>LOW STOCK</span></div><div><strong>{stats.outOfStock}</strong><span>OUT OF STOCK</span></div><button className="admin-btn admin-btn--secondary" onClick={loadProducts} disabled={productsLoading}>↻ {productsLoading ? 'Loading' : 'Refresh catalog'}</button></div>
              <div className="admin-toolbar"><input value={productSearch} onChange={(event) => setProductSearch(event.target.value)} placeholder="Search product name, ID or category…" /><select value={productFilter} onChange={(event) => setProductFilter(event.target.value)}><option value="all">All products</option><option value="active">Live & available</option><option value="sold">Sold out</option><option value="hidden">Hidden</option><option value="low">Low stock</option><option value="out">Out of stock</option></select></div>
              <div className="admin-catalog-grid">
                {filteredProducts.map((product) => <article className="admin-catalog-card" key={product.id}>
                  <div className="admin-catalog-image">{product.images?.[0] ? <img src={product.images[0]} alt={product.name} loading="lazy" /> : <span>NO IMAGE</span>}<span className={`admin-status-tag ${product.is_active && !product.sold_out ? 'is-live' : 'is-muted'}`}>{!product.is_active ? 'HIDDEN' : product.sold_out ? 'SOLD OUT' : 'LIVE'}</span></div>
                  <div className="admin-catalog-body"><div className="admin-catalog-heading"><div><h3>{product.name}</h3><small>{product.id}</small></div><strong>{money(product.price)}</strong></div><p className="admin-catalog-category">{product.category || 'Uncategorized'}{product.tag ? ` / ${product.tag}` : ''}</p><div className="admin-stock-line"><span>IN STOCK</span><strong className={product.stock_quantity != null && Number(product.stock_quantity) === 0 ? 'is-out' : product.stock_quantity != null && Number(product.stock_quantity) <= Number(product.low_stock_threshold ?? 5) ? 'is-low' : ''}>{product.stock_quantity == null ? 'Not set' : `${Number(product.stock_quantity)} units`}</strong></div><div className="admin-catalog-options"><span>COLORS <b>{product.colors?.join(', ') || '—'}</b></span><span>SIZES <b>{product.sizes?.join(', ') || '—'}</b></span></div><div className="admin-card-actions"><button onClick={() => openEditProduct(product)}>Edit product</button><button onClick={() => toggleProduct(product, 'is_active')}>{product.is_active ? 'Hide' : 'Publish'}</button><button onClick={() => toggleProduct(product, 'sold_out')}>{product.sold_out ? 'Mark available' : 'Mark sold out'}</button><button className="admin-delete-action" onClick={() => deleteProduct(product)}>Delete</button></div></div>
                </article>)}
              </div>
              {!filteredProducts.length && <div className="admin-blank">{productsLoading ? 'Loading products…' : 'No products found. Add your first product to get started.'}</div>}
            </section>
          )}
          {section === 'coupons' && (
            <section className="admin-page-section">
              <div className="admin-section-title">
                <div><p className="admin-eyebrow">COMMERCE / PROMOTIONS</p><h1>COUPONS<span>.</span></h1><p>Create discount codes and control their limits.</p></div>
                <button className="admin-btn admin-btn--lime" onClick={openNewCoupon}>＋ Create coupon</button>
              </div>
              <div className="admin-product-summary">
                <div><strong>{coupons.length}</strong><span>TOTAL CODES</span></div>
                <div><strong>{coupons.filter((coupon) => coupon.is_active).length}</strong><span>ACTIVE</span></div>
                <div><strong>{coupons.reduce((sum, coupon) => sum + Number(coupon.usage_count || 0), 0)}</strong><span>REDEMPTIONS</span></div>
                <button className="admin-btn admin-btn--secondary" onClick={loadCoupons} disabled={couponsLoading}>↻ {couponsLoading ? 'Loading' : 'Refresh codes'}</button>
              </div>
              <div className="admin-table-shell">
                <table className="admin-data-table">
                  <thead><tr><th>CODE</th><th>DISCOUNT</th><th>MINIMUM</th><th>USAGE</th><th>EXPIRY</th><th>STATUS</th><th>ACTIONS</th></tr></thead>
                  <tbody>
                    {coupons.map((coupon) => <tr key={coupon.id}>
                      <td className="admin-mono">{coupon.code}</td>
                      <td>{coupon.discount_type === 'percent' ? `${coupon.discount_value}%` : money(coupon.discount_value)}</td>
                      <td>{money(coupon.min_order_amount)}</td>
                      <td>{coupon.usage_count}{coupon.usage_limit == null ? ' / ∞' : ` / ${coupon.usage_limit}`}</td>
                      <td>{coupon.expires_at ? dateTime(coupon.expires_at) : 'No expiry'}</td>
                      <td><span className={`admin-status ${coupon.is_active ? 'admin-status--delivered' : 'admin-status--cancelled'}`}>{coupon.is_active ? 'Active' : 'Disabled'}</span></td>
                      <td><button className="admin-row-action" onClick={() => openEditCoupon(coupon)}>Edit</button> <button className="admin-row-action" onClick={() => toggleCoupon(coupon)}>{coupon.is_active ? 'Disable' : 'Enable'}</button> <button className="admin-row-action" onClick={() => deleteCoupon(coupon)}>Delete</button></td>
                    </tr>)}
                  </tbody>
                </table>
                {!coupons.length && <div className="admin-blank">{couponsLoading ? 'Loading coupons…' : 'No coupons yet. Create your first discount code.'}</div>}
              </div>
            </section>
          )}

        </div>
      </main>

      {selectedOrder && <div className="admin-overlay" onClick={() => setSelectedOrder(null)}><section className="admin-dialog admin-order-dialog" role="dialog" aria-modal="true" onClick={(event) => event.stopPropagation()}><button className="admin-dialog-close" onClick={() => setSelectedOrder(null)}>×</button><p className="admin-eyebrow">ORDER / {selectedOrder.id.slice(0, 8).toUpperCase()}</p><h2>{selectedOrder.customer_name}</h2><div className="admin-order-details"><div><small>EMAIL</small><strong>{selectedOrder.customer_email}</strong></div><div><small>PHONE</small><strong>{selectedOrder.customer_phone}</strong></div><div><small>ADDRESS</small><strong>{[selectedOrder.address, selectedOrder.city, selectedOrder.postal_code].filter(Boolean).join(', ')}</strong></div><div><small>DATE</small><strong>{dateTime(selectedOrder.created_at)}</strong></div><div><small>ORDER STATUS</small><select className="admin-order-status-select" value={selectedOrder.status} onChange={(event) => updateOrderStatus(selectedOrder, event.target.value)}><option value="pending">Pending</option><option value="processing">Processing</option><option value="shipped">Shipped</option><option value="delivered">Delivered</option><option value="cancelled">Cancelled</option></select></div><div><small>PAYMENT</small><strong>{label(selectedOrder.payment_method)} / {label(selectedOrder.payment_status)}</strong></div></div>{selectedOrder.delivery_note && <p className="admin-order-note">NOTE: {selectedOrder.delivery_note}</p>}<p className="admin-eyebrow admin-items-label">PURCHASED ITEMS</p>{(selectedOrder.order_items || []).map((item) => <div className="admin-dialog-item" key={item.id}><div><strong>{item.product_name}</strong><small>{[item.selected_color, item.selected_size].filter(Boolean).join(' / ')} · Qty {item.quantity}</small></div><strong>{money(Number(item.unit_price) * Number(item.quantity))}</strong></div>)}<div className="admin-dialog-total"><span>Subtotal</span><strong>{money(selectedOrder.subtotal)}</strong></div><div className="admin-dialog-total"><span>Shipping</span><strong>{money(selectedOrder.shipping_fee)}</strong></div><div className="admin-dialog-total is-final"><span>Total</span><strong>{money(selectedOrder.total)}</strong></div></section></div>}

      {couponEditor && <div className="admin-overlay" onClick={() => !saving && setCouponEditor(null)}><form className="admin-dialog admin-product-dialog" onSubmit={saveCoupon} onClick={(event) => event.stopPropagation()}>
        <button type="button" className="admin-dialog-close" onClick={() => !saving && setCouponEditor(null)}>×</button>
        <p className="admin-eyebrow">PROMOTION MANAGEMENT</p><h2>{couponEditor === 'new' ? 'NEW COUPON' : 'EDIT COUPON'}<span>.</span></h2>
        <p className="admin-dialog-subtitle">Discounts are recalculated and validated by Supabase during checkout.</p>
        <div className="admin-form-grid">
          <label>COUPON CODE<input value={couponForm.code} onChange={(event) => setCouponForm((form) => ({ ...form, code: event.target.value.toUpperCase() }))} placeholder="WELCOME10" required /></label>
          <label>DISCOUNT TYPE<select value={couponForm.discount_type} onChange={(event) => setCouponForm((form) => ({ ...form, discount_type: event.target.value }))}><option value="percent">Percentage</option><option value="fixed">Fixed amount (EGP)</option></select></label>
          <label>DISCOUNT VALUE<input type="number" min="0.01" max={couponForm.discount_type === 'percent' ? '100' : undefined} step="0.01" value={couponForm.discount_value} onChange={(event) => setCouponForm((form) => ({ ...form, discount_value: event.target.value }))} required /></label>
          <label>MINIMUM ORDER (EGP)<input type="number" min="0" step="1" value={couponForm.min_order_amount} onChange={(event) => setCouponForm((form) => ({ ...form, min_order_amount: event.target.value }))} /></label>
          <label>MAX DISCOUNT (EGP)<small>Optional cap for percentage coupons</small><input type="number" min="0.01" step="1" value={couponForm.max_discount_amount} onChange={(event) => setCouponForm((form) => ({ ...form, max_discount_amount: event.target.value }))} placeholder="No cap" /></label>
          <label>USAGE LIMIT<small>Leave blank for unlimited uses</small><input type="number" min="1" step="1" value={couponForm.usage_limit} onChange={(event) => setCouponForm((form) => ({ ...form, usage_limit: event.target.value }))} placeholder="Unlimited" /></label>
          <label>STARTS AT<input type="datetime-local" value={couponForm.starts_at} onChange={(event) => setCouponForm((form) => ({ ...form, starts_at: event.target.value }))} /></label>
          <label>EXPIRES AT<input type="datetime-local" value={couponForm.expires_at} onChange={(event) => setCouponForm((form) => ({ ...form, expires_at: event.target.value }))} /></label>
          <div className="admin-form-toggles wide"><label><input type="checkbox" checked={couponForm.is_active} onChange={(event) => setCouponForm((form) => ({ ...form, is_active: event.target.checked }))} /> Coupon active</label></div>
        </div>
        <div className="admin-dialog-actions"><button type="button" className="admin-btn admin-btn--secondary" onClick={() => setCouponEditor(null)} disabled={saving}>Cancel</button><button type="submit" className="admin-btn admin-btn--lime" disabled={saving}>{saving ? 'Saving…' : 'Save coupon'}</button></div>
      </form></div>}

      {productEditor && <div className="admin-overlay" onClick={() => !saving && setProductEditor(null)}><form className="admin-dialog admin-product-dialog" onSubmit={saveProduct} onClick={(event) => event.stopPropagation()}><button type="button" className="admin-dialog-close" onClick={() => !saving && setProductEditor(null)}>×</button><p className="admin-eyebrow">CATALOG MANAGEMENT</p><h2>{productEditor === 'edit' ? 'EDIT PRODUCT' : 'NEW PRODUCT'}<span>.</span></h2><p className="admin-dialog-subtitle">Product prices are saved in Egyptian pounds (EGP).</p>
        <div className="admin-form-grid">
          <label className="wide">PRODUCT NAME<input value={productForm.name} onChange={(event) => updateProductField('name', event.target.value)} placeholder="Oversized Graphic Tee" required /></label>
          <label>PRODUCT ID<input value={productForm.id} onChange={(event) => updateProductField('id', event.target.value)} readOnly={productEditor === 'edit'} placeholder="oversized-tee" required /></label>
          <label>PRICE (EGP)<input type="number" min="0" step="1" value={productForm.price} onChange={(event) => updateProductField('price', event.target.value)} placeholder="850" required /></label>
          <label>STOCK QUANTITY<input type="number" min="0" step="1" value={productForm.stock_quantity} onChange={(event) => updateProductField('stock_quantity', event.target.value)} placeholder="Enter units" required /></label>
          <label>LOW STOCK ALERT AT<input type="number" min="0" step="1" value={productForm.low_stock_threshold} onChange={(event) => updateProductField('low_stock_threshold', event.target.value)} placeholder="5" required /></label>
          <label>CATEGORY<input value={productForm.category} onChange={(event) => updateProductField('category', event.target.value)} placeholder="T-Shirts" /></label>
          <label>TAG<input value={productForm.tag} onChange={(event) => updateProductField('tag', event.target.value)} placeholder="New / Best Seller" /></label>
          <label>SEASON<input value={productForm.season} onChange={(event) => updateProductField('season', event.target.value)} placeholder="Core / Winter 26" /></label>
          <label>COLORS <small>Separate with commas</small><input value={productForm.colors} onChange={(event) => updateProductField('colors', event.target.value)} placeholder="Black, White" /></label>
          <label>SIZES <small>Separate with commas</small><input value={productForm.sizes} onChange={(event) => updateProductField('sizes', event.target.value)} placeholder="S, M, L, XL" /></label>
          <label className="wide">IMAGE URLS <small>One image URL per line. First URL is the cover.</small><textarea rows="3" value={productForm.images} onChange={(event) => updateProductField('images', event.target.value)} placeholder="https://…" /></label>
          <label className="wide">DESCRIPTION<textarea rows="3" value={productForm.description} onChange={(event) => updateProductField('description', event.target.value)} placeholder="Describe the product…" /></label>
          <div className="admin-form-toggles wide"><label><input type="checkbox" checked={productForm.is_active} onChange={(event) => updateProductField('is_active', event.target.checked)} /> Published on store</label><label><input type="checkbox" checked={productForm.sold_out} onChange={(event) => updateProductField('sold_out', event.target.checked)} /> Sold out</label></div>
        </div>
        <div className="admin-dialog-actions"><button type="button" className="admin-btn admin-btn--secondary" onClick={() => setProductEditor(null)} disabled={saving}>Cancel</button><button type="submit" className="admin-btn admin-btn--lime" disabled={saving}>{saving ? 'Saving…' : productEditor === 'edit' ? 'Save changes' : 'Create product'}</button></div>
      </form></div>}
    </div>
  )
}
