import { Link } from 'react-router-dom'
import ProductCard from '../components/ProductCard'
import { products } from '../data/products'
import { useWishlist } from '../context/WishlistContext'
import usePageMeta from '../lib/usePageMeta'

export default function Wishlist() {
  const { ids } = useWishlist()
  const saved = ids.map((id) => products.find((product) => product.id === id)).filter(Boolean)
  usePageMeta('Wishlist', 'Your saved NOBI pieces.')
  return (
    <section className="section wishlist-page">
      <div className="section-head"><div><p className="eyebrow">NOBI / Saved pieces</p><h1>Your wishlist<span>.</span></h1></div><p className="muted">{saved.length} saved {saved.length === 1 ? 'piece' : 'pieces'}</p></div>
      {saved.length ? <div className="product-grid">{saved.map((product) => <ProductCard key={product.id} product={product} />)}</div> : <div className="wishlist-empty"><p className="eyebrow">Nothing saved yet</p><h2>Keep the pieces that stay with you.</h2><Link className="btn btn-primary" to="/shop">Explore the drop ↗</Link></div>}
    </section>
  )
}
