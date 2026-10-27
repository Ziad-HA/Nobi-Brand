import { useMemo, useState } from 'react'
import ProductCard from '../components/ProductCard'
import { categories, products } from '../data/products'

export default function Shop() {
  const [filter, setFilter] = useState('All')

  const list = useMemo(
    () => (filter === 'All' ? products : products.filter((p) => p.category === filter)),
    [filter],
  )

  return (
    <section className="section shop-page">
      <div className="section-head">
        <div>
          <p className="eyebrow">Catalog</p>
          <h1>Shop</h1>
        </div>
        <p className="muted">{list.length} pieces</p>
      </div>
      <div className="filters">
        {categories.map((cat) => (
          <button
            key={cat}
            className={filter === cat ? 'is-active' : ''}
            onClick={() => setFilter(cat)}
          >
            {cat}
          </button>
        ))}
      </div>
      <div className="product-grid">
        {list.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </section>
  )
}
