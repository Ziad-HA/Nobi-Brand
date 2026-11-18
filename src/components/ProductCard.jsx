import { useCallback, useState } from 'react'
import { motion } from 'motion/react'
import TiltLink, { Glare } from './TiltLink'
import ProductQuickView from './ProductQuickView'
import { useWishlist } from '../context/WishlistContext'

export default function ProductCard({ product, priority = false }) {
  const [quickViewOpen, setQuickViewOpen] = useState(false)
  const secondaryImage = product.images?.[1]
  const { isWishlisted, toggleWishlist } = useWishlist()
  const saved = isWishlisted(product.id)
  const closeQuickView = useCallback(() => setQuickViewOpen(false), [])

  return (
    <>
      <article className="product-card-shell">
        <TiltLink to={`/product/${product.id}`} className={secondaryImage ? 'product-card has-secondary-image' : 'product-card'} max={13} hoverScale={1.035}>
          <div className="product-media">
            <img className="product-image-primary" src={product.images?.[0]} alt={product.name} loading={priority ? 'eager' : 'lazy'} fetchPriority={priority ? 'high' : 'auto'} decoding="async" />
            {secondaryImage && <img className="product-image-secondary" src={secondaryImage} alt="" loading="lazy" decoding="async" />}
            <Glare />
            <span className="chip">{product.soldOut ? 'Sold out' : product.tag}</span>
            <span className="product-card-action" aria-hidden="true">View piece <span>↗</span></span>
          </div>
          <div className="product-meta"><div><h3>{product.name}</h3><p>{product.category}</p></div><strong>${product.price}</strong></div>
        </TiltLink>
        <button type="button" className={`product-wishlist-btn ${saved ? 'is-saved' : ''}`} aria-label={saved ? `Remove ${product.name} from wishlist` : `Add ${product.name} to wishlist`} aria-pressed={saved} onClick={() => toggleWishlist(product.id)}><motion.span key={String(saved)} style={{ display: 'inline-block' }} initial={{ scale: saved ? 0.6 : 1 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 320, damping: 14 }}>{saved ? '♥' : '♡'}</motion.span></button>
        <button type="button" className="product-quick-view-btn" onClick={() => setQuickViewOpen(true)}>Quick view <span>↗</span></button>
      </article>
      <ProductQuickView product={quickViewOpen ? product : null} onClose={closeQuickView} />
    </>
  )
}
