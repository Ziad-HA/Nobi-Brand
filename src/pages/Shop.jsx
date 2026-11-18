import { useMemo, useState } from 'react'
import { motion, useReducedMotion } from 'motion/react'
import ProductCard from '../components/ProductCard'
import { categories, products } from '../data/products'
import usePageMeta from '../lib/usePageMeta'

const sortOptions = [
  { value: 'featured', label: 'Featured' },
  { value: 'price-low', label: 'Price: low to high' },
  { value: 'price-high', label: 'Price: high to low' },
  { value: 'name', label: 'Name: A to Z' },
]

export default function Shop() {
  const [filter, setFilter] = useState('All')
  const [query, setQuery] = useState('')
  const [sort, setSort] = useState('featured')
  const [availability, setAvailability] = useState('all')
  const reduce = useReducedMotion()
  usePageMeta('Shop the Drop', 'Limited streetwear drops: outerwear, tops, bottoms and accessories cut for the night.')

  const list = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase()
    const filtered = products.filter((product) => {
      const matchesCategory = filter === 'All' || product.category === filter
      const matchesQuery = !normalizedQuery || [product.name, product.category, product.tag]
        .filter(Boolean)
        .some((value) => value.toLowerCase().includes(normalizedQuery))
      const matchesAvailability = availability === 'all' || (availability === 'available' ? !product.soldOut : product.soldOut)
      return matchesCategory && matchesQuery && matchesAvailability
    })

    if (sort === 'price-low') return filtered.sort((a, b) => a.price - b.price)
    if (sort === 'price-high') return filtered.sort((a, b) => b.price - a.price)
    if (sort === 'name') return filtered.sort((a, b) => a.name.localeCompare(b.name))
    return filtered
  }, [filter, query, sort, availability])

  return (
    <section className="section shop-page max-w-7xl mx-auto px-4 md:px-8 py-12 text-white">
      <div className="section-head shop-heading">
        <div>
          <p className="eyebrow">Catalog / NOBI archive</p>
          <h1>Shop the drop<span>.</span></h1>
          <p className="shop-intro">Pieces made to be worn on repeat. Find your next uniform.</p>
        </div>
        <p className="shop-count" aria-live="polite" aria-atomic="true">{list.length} {list.length === 1 ? 'piece' : 'pieces'} found</p>
      </div>

      <div className="shop-toolbar">
        <label className="shop-search">
          <span className="sr-only">Search products</span>
          <span aria-hidden="true">⌕</span>
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search the collection"
          />
          {query && <button type="button" onClick={() => setQuery('')} aria-label="Clear search">×</button>}
        </label>
        <label className="shop-sort">
          <span>Sort</span>
          <select value={sort} onChange={(event) => setSort(event.target.value)}>
            {sortOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
          </select>
        </label>
      </div>

      <div className="shop-filter-row">
        <div className="filters" aria-label="Filter by category">
          {categories.map((cat) => (
            <button
              key={cat}
              type="button"
              className={filter === cat ? 'is-active' : ''}
              aria-pressed={filter === cat}
              onClick={() => setFilter(cat)}
            >
              {cat}
            </button>
          ))}
        </div>
        <label className="availability-filter">
          <input
            type="checkbox"
            checked={availability === 'available'}
            onChange={(event) => setAvailability(event.target.checked ? 'available' : 'all')}
          />
          <span>Available only</span>
        </label>
      </div>

      {list.length === 0 ? (
        <div className="shop-empty">
          <p className="eyebrow">No match</p>
          <h2>Nothing in this edit.</h2>
          <p>Try another search or clear your filters.</p>
          <button type="button" className="btn btn-ghost" onClick={() => { setQuery(''); setFilter('All'); setAvailability('all'); setSort('featured') }}>
            Clear filters
          </button>
        </div>
      ) : (
        <div className="product-grid shop-product-grid">
          {list.map((product, index) => (
            <motion.div
              key={product.id}
              initial={reduce ? false : { opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.12 }}
              transition={{ duration: 0.48, ease: [0.22, 1, 0.36, 1], delay: (index % 4) * 0.045 }}
            >
              <ProductCard product={product} priority={index < 4} />
            </motion.div>
          ))}
        </div>
      )}
    </section>
  )
}
