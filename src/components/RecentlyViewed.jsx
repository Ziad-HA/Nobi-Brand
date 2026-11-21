import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import useProducts from '../lib/useProducts'
import ProductCard from './ProductCard'

const STORAGE_KEY = 'unseen-recently-viewed'

export function rememberRecentlyViewed(productId) {
  if (!productId || typeof window === 'undefined') return
  try {
    const previous = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]')
    const next = [String(productId), ...previous.filter((id) => id !== String(productId))].slice(0, 8)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
  } catch { /* Browsing history remains optional. */ }
}

export default function RecentlyViewed({ excludeId = '' }) {
  const { products } = useProducts()
  const [ids, setIds] = useState([])

  useEffect(() => {
    try {
      const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]')
      setIds(Array.isArray(stored) ? stored.filter((id) => typeof id === 'string') : [])
    } catch { setIds([]) }
  }, [])

  const viewed = ids
    .filter((id) => id !== String(excludeId))
    .map((id) => products.find((product) => product.id === id))
    .filter(Boolean)
    .slice(0, 4)

  if (!viewed.length) return null
  return (
    <section className="section recently-viewed-section">
      <div className="section-head">
        <div><p className="eyebrow">YOUR FOOTPRINT</p><h2>RECENTLY VIEWED<span>.</span></h2></div>
        <Link to="/shop" className="text-link">Explore all ↗</Link>
      </div>
      <div className="product-grid">
        {viewed.map((product) => <ProductCard key={product.id} product={product} />)}
      </div>
    </section>
  )
}
