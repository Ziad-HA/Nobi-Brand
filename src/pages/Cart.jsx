import { Link } from 'react-router-dom'
import { useCart } from '../context/CartContext'
import usePageMeta from '../lib/usePageMeta'

export default function Cart() {
  const { items, updateQty, removeItem, subtotal } = useCart()
  usePageMeta('Your Bag')

  if (!items.length) {
    return (
      <section className="section cart-empty cart-empty-upgraded">
        <p className="eyebrow">UNSEEN / Your bag</p>
        <h1>Nothing in here<span>.</span></h1>
        <p className="muted">The next piece is waiting in the collection.</p>
        <Link to="/shop" className="btn btn-primary">Explore the drop ↗</Link>
      </section>
    )
  }

  return (
    <section className="section cart-page cart-page-upgraded">
      <div className="section-head cart-heading">
        <div><p className="eyebrow">UNSEEN / Your bag</p><h1>Your selection<span>.</span></h1></div>
        <p className="cart-item-count">{items.length} {items.length === 1 ? 'line item' : 'line items'} · {items.reduce((sum, item) => sum + item.qty, 0)} pieces</p>
      </div>

      <div className="cart-layout">
        <ul className="cart-list">
          {items.map((item) => (
            <li key={item.key} className="cart-item">
              <Link to={`/product/${item.id}`} className="cart-item-image">
                <img src={item.image} alt={item.name} loading="lazy" decoding="async" />
              </Link>
              <div className="cart-item-info">
                <p className="eyebrow">{item.color}</p>
                <Link to={`/product/${item.id}`}><h2>{item.name}</h2></Link>
                <p className="cart-item-variant">Size: {item.size}</p>
                <div className="cart-item-controls">
                  <div className="qty" aria-label={`Quantity for ${item.name}`}>
                    <button type="button" onClick={() => updateQty(item.key, item.qty - 1)} aria-label={`Decrease quantity of ${item.name}`}>−</button>
                    <span>{item.qty}</span>
                    <button type="button" onClick={() => updateQty(item.key, item.qty + 1)} aria-label={`Increase quantity of ${item.name}`} disabled={item.qty >= 99}>+</button>
                  </div>
                  <button className="remove-btn" type="button" onClick={() => removeItem(item.key)} aria-label={`Remove ${item.name} from your bag`} data-sound="remove">Remove</button>
                </div>
              </div>
              <strong className="cart-item-price">${(item.price * item.qty).toFixed(2)}</strong>
            </li>
          ))}
        </ul>

        <aside className="cart-summary cart-summary-upgraded">
          <p className="eyebrow">Order summary</p>
          <div className="cart-summary-line"><span>Subtotal</span><strong>${subtotal.toFixed(2)}</strong></div>
          <div className="cart-summary-line muted"><span>Shipping</span><span>Not included</span></div>
          <div className="cart-summary-line muted"><span>Taxes</span><span>Not included</span></div>
          <div className="cart-summary-total"><span>Subtotal</span><strong>${subtotal.toFixed(2)}</strong></div>
          <Link to="/checkout" className="btn btn-primary cart-checkout-btn">Continue to checkout <span>↗</span></Link>
          <Link to="/shop" className="cart-continue-link">Continue shopping</Link>
          <p className="cart-note">Your bag is saved on this device while you browse.</p>
        </aside>
      </div>
    </section>
  )
}
