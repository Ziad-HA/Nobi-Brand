import { Link } from 'react-router-dom'
import { useCart } from '../context/CartContext'

export default function Cart() {
  const { items, updateQty, removeItem, subtotal } = useCart()

  if (!items.length) {
    return (
      <section className="section cart-empty flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
        <p className="eyebrow text-xs uppercase tracking-widest text-neutral-500 mb-2">Bag</p>
        <h1 className="text-3xl md:text-5xl font-black uppercase tracking-tight text-white mb-6">
          Your bag is empty.
        </h1>
        <Link 
          to="/shop" 
          className="btn btn-primary inline-block bg-white text-black font-bold uppercase tracking-wider px-8 py-4 hover:bg-neutral-200 transition-all duration-300 transform hover:-translate-y-0.5"
        >
          Shop the drop
        </Link>
      </section>
    )
  }

  return (
    <section className="section cart-page max-w-7xl mx-auto px-4 md:px-8 py-12 text-white">
      {/* Head Section */}
      <div className="section-head mb-10 border-b border-neutral-800 pb-6">
        <div>
          <p className="eyebrow text-xs uppercase tracking-widest text-neutral-500 mb-1">Bag</p>
          <h1 className="text-3xl md:text-4xl font-extrabold uppercase tracking-tight">
            Checkout ready.
          </h1>
        </div>
      </div>

      {/* Cart Layout */}
      <div className="cart-layout grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
        {/* Items List */}
        <ul className="cart-list lg:col-span-8 space-y-6">
          {items.map((item) => (
            <li 
              key={item.key} 
              className="flex items-center gap-6 bg-neutral-900/40 border border-neutral-800/80 p-4 md:p-6 rounded-xl backdrop-blur-sm transition-all hover:border-neutral-700"
            >
              {/* Product Image */}
              <div className="w-24 h-28 md:w-32 md:h-36 bg-neutral-800 rounded-lg overflow-hidden flex-shrink-0">
                <img 
                  src={item.image} 
                  alt={item.name} 
                  className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-500" 
                />
              </div>

              {/* Product Info */}
              <div className="flex-1 min-w-0 space-y-2">
                <h3 className="text-lg md:text-xl font-bold uppercase tracking-wider truncate">
                  {item.name}
                </h3>
                <p className="text-xs md:text-sm text-neutral-400 font-mono">
                  {item.color} / {item.size}
                </p>

                {/* Quantity Controls */}
                <div className="flex items-center gap-3 pt-2">
                  <div className="qty flex items-center border border-neutral-700 rounded-lg overflow-hidden bg-black/40">
                    <button 
                      onClick={() => updateQty(item.key, item.qty - 1)}
                      className="px-3 py-1 hover:bg-neutral-800 transition-colors text-lg"
                    >
                      -
                    </button>
                    <span className="px-4 py-1 text-sm font-bold font-mono">
                      {item.qty}
                    </span>
                    <button 
                      onClick={() => updateQty(item.key, item.qty + 1)}
                      className="px-3 py-1 hover:bg-neutral-800 transition-colors text-lg"
                    >
                      +
                    </button>
                  </div>

                  <button 
                    className="text-link text-xs text-neutral-500 hover:text-red-400 transition-colors underline underline-offset-4 ml-2" 
                    onClick={() => removeItem(item.key)}
                  >
                    Remove
                  </button>
                </div>
              </div>

              {/* Item Price */}
              <div className="text-right flex-shrink-0">
                <strong className="text-lg md:text-xl font-black font-mono">
                  ${item.price * item.qty}
                </strong>
              </div>
            </li>
          ))}
        </ul>

        {/* Cart Summary Sidebar */}
        <aside className="cart-summary lg:col-span-4 bg-neutral-900/60 border border-neutral-800 p-6 md:p-8 rounded-xl space-y-6 backdrop-blur-md sticky top-24">
          <p className="eyebrow text-xs uppercase tracking-widest text-neutral-500 border-b border-neutral-800 pb-3">
            Summary
          </p>

          <div className="space-y-3 font-mono">
            <div className="row flex justify-between text-sm">
              <span className="text-neutral-400">Subtotal</span>
              <strong className="text-lg text-white font-bold">${subtotal}</strong>
            </div>
            <div className="row muted flex justify-between text-xs text-neutral-500 pt-1">
              <span>Shipping</span>
              <span>Calculated next</span>
            </div>
          </div>

          <div className="pt-4 border-t border-neutral-800">
            <Link 
              to="/checkout" 
              className="btn btn-primary block w-full text-center bg-white text-black font-extrabold uppercase tracking-widest py-4 hover:bg-neutral-200 transition-all duration-300 shadow-lg hover:shadow-white/10"
            >
              Checkout
            </Link>
          </div>
        </aside>
      </div>
    </section>
  )
}