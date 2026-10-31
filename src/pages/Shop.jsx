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
    <section className="section shop-page max-w-7xl mx-auto px-4 md:px-8 py-12 text-white">
      {/* Header Section */}
      <div className="section-head flex flex-col md:flex-row md:items-end justify-between mb-10 border-b border-neutral-800 pb-6 gap-4">
        <div>
          <p className="eyebrow text-xs uppercase tracking-widest text-neutral-500 mb-1">Catalog</p>
          <h1 className="text-4xl md:text-5xl font-black uppercase tracking-tight">Shop Drop</h1>
        </div>
        <p className="muted text-sm font-mono text-neutral-400 bg-neutral-900/60 px-4 py-2 rounded-full border border-neutral-800 w-fit">
          {list.length} {list.length === 1 ? 'piece' : 'pieces'} available
        </p>
      </div>

      {/* Category Filters */}
      <div className="filters flex flex-wrap gap-2 md:gap-3 mb-12">
        {categories.map((cat) => (
          <button
            key={cat}
            className={`px-5 py-2.5 text-xs md:text-sm font-bold uppercase tracking-wider rounded-full transition-all duration-300 border ${
              filter === cat
                ? 'bg-white text-black border-white shadow-lg shadow-white/10 scale-105'
                : 'bg-neutral-900/40 text-neutral-400 border-neutral-800 hover:border-neutral-600 hover:text-white'
            }`}
            onClick={() => setFilter(cat)}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Product Grid */}
      {list.length === 0 ? (
        <div className="text-center py-24 text-neutral-500">
          <p className="text-lg uppercase tracking-wider">No pieces found in this category.</p>
        </div>
      ) : (
        <div className="product-grid grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {list.map((product) => (
            <div key={product.id} className="group transition-transform duration-500 hover:-translate-y-1">
              <ProductCard product={product} />
            </div>
          ))}
        </div>
      )}
    </section>
  )
}