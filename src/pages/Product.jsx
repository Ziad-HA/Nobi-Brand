
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
      <section className="section" style={{ textAlign: 'center', padding: '100px 20px', color: '#fff' }}>
        <h1>Piece not found.</h1>
        <Link to="/shop" className="text-link" style={{ color: '#aaa', textDecoration: 'underline' }}>
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

      <div className="product-layout">

        {/* Product images */}
        <div className="product-gallery">
          <div className="product-main-image">
            <img
              src={product.images[shot]}
              alt={product.name}
            />
          </div>

          <div className="product-thumbnails">
            {product.images.map((src, i) => (
              <button
                key={src}
                onClick={() => setShot(i)}
                className={`product-thumbnail ${shot === i ? 'active' : ''}`}
              >
                <img src={src} alt="" />
              </button>
            ))}
          </div>
        </div>

        {/* Product information */}
        <div className="product-details">

          <p className="product-category">
            {product.tag} · {product.category}
          </p>

          <h1 className="product-title">
            {product.name}
          </h1>

          <p className="product-price">
            ${product.price}
          </p>

          <p className="product-description">
            {product.description}
          </p>

          {/* Color selection */}
          <div className="product-option">
            <p className="product-option-label">COLOR</p>

            <div className="product-option-list">
              {product.colors.map((c) => (
                <button
                  key={c}
                  onClick={() => setColor(c)}
                  className={`product-color-btn ${color === c ? 'active' : ''}`}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>

          {/* Size selection */}
          <div className="product-option product-size-option">
            <p className="product-option-label">SIZE</p>

            <div className="product-option-list">
              {product.sizes.map((s) => (
                <button
                  key={s}
                  onClick={() => setSize(s)}
                  className={`product-size-btn ${size === s ? 'active' : ''}`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          {/* Add to cart */}
          <div className="product-actions">
            <button
              disabled={product.soldOut}
              onClick={onAdd}
              className="product-add-btn"
            >
              {product.soldOut
                ? 'Sold out'
                : added
                  ? 'Added to bag ✓'
                  : 'ADD TO BAG'}
            </button>

            {added && (
              <button
                onClick={() => navigate('/cart')}
                className="product-view-bag-btn"
              >
                View bag
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Related products */}
      <div className="product-related">
        <h2>Also in the drop</h2>

        <div className="product-grid">
          {related.map((item) => (
            <ProductCard key={item.id} product={item} />
          ))}
        </div>
      </div>

    </section>
  )
}
