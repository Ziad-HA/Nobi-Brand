import { Link } from 'react-router-dom'
import { useCart } from '../context/CartContext'

export default function Cart() {
  const { items, updateQty, removeItem, subtotal } = useCart()

  if (!items.length) {
    return (
      <section className="section cart-empty">
        <p className="eyebrow">Bag</p>
        <h1>Your bag is empty.</h1>
        <Link to="/shop" className="btn btn-primary">
          Shop the drop
        </Link>
      </section>
    )
  }

  return (
    <section className="section cart-page">
      <div className="section-head">
        <div>
          <p className="eyebrow">Bag</p>
          <h1>Checkout ready.</h1>
        </div>
      </div>
      <div className="cart-layout">
        <ul className="cart-list">
          {items.map((item) => (
            <li key={item.key}>
              <img src={item.image} alt={item.name} />
              <div>
                <h3>{item.name}</h3>
                <p>
                  {item.color} / {item.size}
                </p>
                <div className="qty">
                  <button onClick={() => updateQty(item.key, item.qty - 1)}>-</button>
                  <span>{item.qty}</span>
                  <button onClick={() => updateQty(item.key, item.qty + 1)}>+</button>
                </div>
                <button className="text-link" onClick={() => removeItem(item.key)}>
                  Remove
                </button>
              </div>
              <strong>${item.price * item.qty}</strong>
            </li>
          ))}
        </ul>
        <aside className="cart-summary">
          <p className="eyebrow">Summary</p>
          <div className="row">
            <span>Subtotal</span>
            <strong>${subtotal}</strong>
          </div>
          <div className="row muted">
            <span>Shipping</span>
            <span>Calculated next</span>
          </div>
          <Link to="/checkout" className="btn btn-primary">
            Checkout
          </Link>
        </aside>
      </div>
    </section>
  )
}
