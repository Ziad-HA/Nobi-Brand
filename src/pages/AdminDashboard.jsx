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
  colors: '', sizes: '', images: '', description: '',
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
      .select('id, name, price, category, tag, season, colors, sizes, sold_out, images, description, is_active, created_at')
      .order('created_at', { ascending: false })
    if (queryError) setError(queryError.message)
    else setProducts(data || [])
    setProductsLoading(false)
  }, [])

  useEffect(() => {
    if (authState === 'admin') {
      loadOrders()
      loadProducts()
    }
  }, [authState, loadOrders, loadProducts])

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
  }), [orders, products])

  async function refreshAll() {
    setError('')
    await Promise.all([loadOrders(), loadProducts()])
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
      sold_out: productForm.sold_out,
      is_active: productForm.is_active,
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
                  <div className="admin-inventory-line"><span>Sold out</span><strong>{products.filter((product) => product.sold_out).length}</strong></div>
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
              <div className="admin-product-summary"><div><strong>{stats.products}</strong><span>ALL PRODUCTS</span></div><div><strong>{stats.activeProducts}</strong><span>LIVE & AVAILABLE</span></div><div><strong>{products.filter((product) => product.sold_out).length}</strong><span>SOLD OUT</span></div><button className="admin-btn admin-btn--secondary" onClick={loadProducts} disabled={productsLoading}>↻ {productsLoading ? 'Loading' : 'Refresh catalog'}</button></div>
              <div className="admin-toolbar"><input value={productSearch} onChange={(event) => setProductSearch(event.target.value)} placeholder="Search product name, ID or category…" /><select value={productFilter} onChange={(event) => setProductFilter(event.target.value)}><option value="all">All products</option><option value="active">Live & available</option><option value="sold">Sold out</option><option value="hidden">Hidden</option></select></div>
              <div className="admin-catalog-grid">
                {filteredProducts.map((product) => <article className="admin-catalog-card" key={product.id}>
                  <div className="admin-catalog-image">{product.images?.[0] ? <img src={product.images[0]} alt={product.name} loading="lazy" /> : <span>NO IMAGE</span>}<span className={`admin-status-tag ${product.is_active && !product.sold_out ? 'is-live' : 'is-muted'}`}>{!product.is_active ? 'HIDDEN' : product.sold_out ? 'SOLD OUT' : 'LIVE'}</span></div>
                  <div className="admin-catalog-body"><div className="admin-catalog-heading"><div><h3>{product.name}</h3><small>{product.id}</small></div><strong>{money(product.price)}</strong></div><p className="admin-catalog-category">{product.category || 'Uncategorized'}{product.tag ? ` / ${product.tag}` : ''}</p><div className="admin-catalog-options"><span>COLORS <b>{product.colors?.join(', ') || '—'}</b></span><span>SIZES <b>{product.sizes?.join(', ') || '—'}</b></span></div><div className="admin-card-actions"><button onClick={() => openEditProduct(product)}>Edit product</button><button onClick={() => toggleProduct(product, 'is_active')}>{product.is_active ? 'Hide' : 'Publish'}</button><button onClick={() => toggleProduct(product, 'sold_out')}>{product.sold_out ? 'Mark available' : 'Mark sold out'}</button><button className="admin-delete-action" onClick={() => deleteProduct(product)}>Delete</button></div></div>
                </article>)}
              </div>
              {!filteredProducts.length && <div className="admin-blank">{productsLoading ? 'Loading products…' : 'No products found. Add your first product to get started.'}</div>}
            </section>
          )}
        </div>
      </main>

      {selectedOrder && <div className="admin-overlay" onClick={() => setSelectedOrder(null)}><section className="admin-dialog admin-order-dialog" role="dialog" aria-modal="true" onClick={(event) => event.stopPropagation()}><button className="admin-dialog-close" onClick={() => setSelectedOrder(null)}>×</button><p className="admin-eyebrow">ORDER / {selectedOrder.id.slice(0, 8).toUpperCase()}</p><h2>{selectedOrder.customer_name}</h2><div className="admin-order-details"><div><small>EMAIL</small><strong>{selectedOrder.customer_email}</strong></div><div><small>PHONE</small><strong>{selectedOrder.customer_phone}</strong></div><div><small>ADDRESS</small><strong>{[selectedOrder.address, selectedOrder.city, selectedOrder.postal_code].filter(Boolean).join(', ')}</strong></div><div><small>DATE</small><strong>{dateTime(selectedOrder.created_at)}</strong></div><div><small>STATUS</small><strong>{label(selectedOrder.status)}</strong></div><div><small>PAYMENT</small><strong>{label(selectedOrder.payment_method)} / {label(selectedOrder.payment_status)}</strong></div></div>{selectedOrder.delivery_note && <p className="admin-order-note">NOTE: {selectedOrder.delivery_note}</p>}<p className="admin-eyebrow admin-items-label">PURCHASED ITEMS</p>{(selectedOrder.order_items || []).map((item) => <div className="admin-dialog-item" key={item.id}><div><strong>{item.product_name}</strong><small>{[item.selected_color, item.selected_size].filter(Boolean).join(' / ')} · Qty {item.quantity}</small></div><strong>{money(Number(item.unit_price) * Number(item.quantity))}</strong></div>)}<div className="admin-dialog-total"><span>Subtotal</span><strong>{money(selectedOrder.subtotal)}</strong></div><div className="admin-dialog-total"><span>Shipping</span><strong>{money(selectedOrder.shipping_fee)}</strong></div><div className="admin-dialog-total is-final"><span>Total</span><strong>{money(selectedOrder.total)}</strong></div></section></div>}

      {productEditor && <div className="admin-overlay" onClick={() => !saving && setProductEditor(null)}><form className="admin-dialog admin-product-dialog" onSubmit={saveProduct} onClick={(event) => event.stopPropagation()}><button type="button" className="admin-dialog-close" onClick={() => !saving && setProductEditor(null)}>×</button><p className="admin-eyebrow">CATALOG MANAGEMENT</p><h2>{productEditor === 'edit' ? 'EDIT PRODUCT' : 'NEW PRODUCT'}<span>.</span></h2><p className="admin-dialog-subtitle">Product prices are saved in Egyptian pounds (EGP).</p>
        <div className="admin-form-grid">
          <label className="wide">PRODUCT NAME<input value={productForm.name} onChange={(event) => updateProductField('name', event.target.value)} placeholder="Oversized Graphic Tee" required /></label>
          <label>PRODUCT ID<input value={productForm.id} onChange={(event) => updateProductField('id', event.target.value)} placeholder="oversized-tee" required /></label>
          <label>PRICE (EGP)<input type="number" min="0" step="1" value={productForm.price} onChange={(event) => updateProductField('price', event.target.value)} placeholder="850" required /></label>
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
