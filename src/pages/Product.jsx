import { useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { products } from '../data/products'
import { useCart } from '../context/CartContext'
import ProductCard from '../components/ProductCard'

export default function Product() {
  const { id } = useParams()
  const navigate = useNavigate()
  const product = products.find((p) => p.id === id)
  const { addItem } = useCart()
  const [size, setSize] = useState(product?.sizes[0] ?? '')
  const [color, setColor] = useState(product?.colors[0] ?? '')
  const [shot, setShot] = useState(0)
  const [added, setAdded] = useState(false)

  if (!product) {
    return (
      <section className="section">
        <h1>Piece not found.</h1>
        <Link to="/shop" className="text-link">
          Back to shop
        </Link>
      </section>
    )
  }

  const related = products.filter((p) => p.id !== product.id).slice(0, 4)

  const onAdd = () => {
    if (product.soldOut) return
    addItem(product, { size, color })
    setAdded(true)
    setTimeout(() => setAdded(false), 1800)
  }

  return (
    <section className="product-page">
      <div className="product-gallery">
        <img src={product.images[shot]} alt={product.name} />
        <div className="thumbs">
          {product.images.map((src, i) => (
            <button key={src} className={shot === i ? 'is-active' : ''} onClick={() => setShot(i)}>
              <img src={src} alt="" />
            </button>
          ))}
        </div>
      </div>
      <div className="product-info">
        <p className="eyebrow">{product.tag} · {product.category}</p>
        <h1>{product.name}</h1>
        <p className="price">${product.price}</p>
        <p>{product.description}</p>

        <div className="option-block">
          <p className="option-label">Color</p>
          <div className="chips">
            {product.colors.map((c) => (
              <button key={c} className={color === c ? 'is-active' : ''} onClick={() => setColor(c)}>
                {c}
              </button>
            ))}
          </div>
        </div>

        <div className="option-block">
          <p className="option-label">Size</p>
          <div className="chips">
            {product.sizes.map((s) => (
              <button key={s} className={size === s ? 'is-active' : ''} onClick={() => setSize(s)}>
                {s}
              </button>
            ))}
          </div>
        </div>

        <div className="product-actions">
          <button className="btn btn-primary" disabled={product.soldOut} onClick={onAdd}>
            {product.soldOut ? 'Sold out' : added ? 'Added to bag' : 'Add to bag'}
          </button>
          {added && (
            <button className="btn btn-ghost" onClick={() => navigate('/cart')}>
              View bag
            </button>
          )}
        </div>
      </div>
      <div className="related">
        <div className="section-head">
          <h2>Also in the drop</h2>
        </div>
        <div className="product-grid">
          {related.map((item) => (
            <ProductCard key={item.id} product={item} />
          ))}
        </div>
      </div>
    </section>
  )
}
