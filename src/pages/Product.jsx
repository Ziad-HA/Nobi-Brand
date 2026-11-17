import { useState } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { products } from '../data/products'
import { useCart } from '../context/CartContext'
import ProductCard from '../components/ProductCard'
import usePageMeta from '../lib/usePageMeta'

export default function Product() {
  const { id } = useParams()
  const navigate = useNavigate()
  const product = products.find((item) => item.id === id)
  const { addItem } = useCart()
  const [size, setSize] = useState(product?.sizes?.[0] ?? '')
  const [color, setColor] = useState(product?.colors?.[0] ?? '')
  const [shot, setShot] = useState(0)
  const [added, setAdded] = useState(false)
  const reduceMotion = useReducedMotion()
  usePageMeta(product?.name ?? 'Not found', product?.description, product?.images?.[0])

  if (!product) {
    return (
      <section className="section product-not-found">
        <p className="eyebrow">NOBI archive</p>
        <h1>Piece not found<span>.</span></h1>
        <Link to="/shop" className="btn btn-primary">Back to shop</Link>
      </section>
    )
  }

  const related = products.filter((item) => item.id !== product.id && item.category === product.category).slice(0, 4)
  const images = product.images?.length ? product.images : []
  const showPreviousImage = () => setShot((current) => (current - 1 + images.length) % images.length)
  const showNextImage = () => setShot((current) => (current + 1) % images.length)
  const onGalleryKeyDown = (event) => {
    if (images.length < 2) return
    if (event.key === 'ArrowLeft') showPreviousImage()
    if (event.key === 'ArrowRight') showNextImage()
  }
  const onAdd = () => {
    if (product.soldOut || !size || !color) return
    addItem(product, { size, color })
    setAdded(true)
  }

  return (
    <section className="product-page product-detail-page">
      <div className="product-layout">
        <div className="product-gallery">
          <div className="product-main-image">
            {images[shot] && <img src={images[shot]} alt={product.name} fetchPriority="high" decoding="async" />}
            <span className="product-image-index">{String(shot + 1).padStart(2, '0')} / {String(images.length).padStart(2, '0')}</span>
          </div>
          {images.length > 1 && (
            <div className="product-thumbnails" aria-label="Product images">
              {images.map((src, index) => (
                <button
                  key={src}
                  type="button"
                  onClick={() => setShot(index)}
                  className={shot === index ? 'active' : ''}
                  aria-label={`Show product image ${index + 1}`}
                  aria-pressed={shot === index}
                >
                  <img src={src} alt="" loading="lazy" decoding="async" />
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="product-details">
          <Link to="/shop" className="product-back-link">← Back to shop</Link>
          <p className="product-category">{product.tag} <span>·</span> {product.category}</p>
          <h1 className="product-title">{product.name}</h1>
          <p className="product-price">${product.price}</p>
          <p className="product-description">{product.description}</p>

          <div className="product-detail-rule" />
          <div className="product-option">
            <div className="product-option-heading"><p className="product-option-label">Color</p><strong>{color}</strong></div>
            <div className="product-option-list">
              {product.colors.map((item) => (
                <button
                  key={item}
                  type="button"
                  onClick={() => { setColor(item); setAdded(false) }}
                  className={color === item ? 'active' : ''}
                  aria-pressed={color === item}
                >
                  {item}
                </button>
              ))}
            </div>
          </div>

          <div className="product-option product-size-option">
            <div className="product-option-heading"><p className="product-option-label">Select size</p><span>Choose your fit</span></div>
            <div className="product-option-list">
              {product.sizes.map((item) => (
                <button
                  key={item}
                  type="button"
                  onClick={() => { setSize(item); setAdded(false) }}
                  className={size === item ? 'active' : ''}
                  aria-pressed={size === item}
                >
                  {item}
                </button>
              ))}
            </div>
          </div>

          <div className="product-actions">
            <button disabled={product.soldOut} onClick={onAdd} className="product-add-btn" type="button" aria-live="polite">
              {product.soldOut ? 'Sold out' : added ? 'Added to bag ✓' : 'Add to bag — ' + '$' + product.price}
            </button>
            {added && (
              <button onClick={() => navigate('/cart')} className="product-view-bag-btn" type="button">
                View bag
              </button>
            )}
          </div>

          <div className="product-service-notes">
            <p><span>01</span> Small-batch streetwear</p>
            <p><span>02</span> Shipping calculated at checkout</p>
            <p><span>03</span> Secure your size before the drop moves</p>
          </div>
        </div>
      </div>

      {related.length > 0 && (
        <div className="product-related">
          <div className="section-head">
            <div><p className="eyebrow">Keep exploring</p><h2>More from {product.category}<span>.</span></h2></div>
            <Link to="/shop" className="text-link">All pieces ↗</Link>
          </div>
          <div className="product-grid">
            {related.map((item) => <ProductCard key={item.id} product={item} />)}
          </div>
        </div>
      )}
    </section>
  )
}
