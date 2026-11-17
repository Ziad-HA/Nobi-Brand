import TiltLink from './TiltLink'

export default function ProductCard({ product }) {
  return (
    <TiltLink to={`/product/${product.id}`} className="product-card" max={7}>
      <div className="product-media">
        <img src={product.images[0]} alt={product.name} loading="lazy" decoding="async" />
        <span className="chip">{product.soldOut ? 'Sold out' : product.tag}</span>
      </div>
      <div className="product-meta">
        <div>
          <h3>{product.name}</h3>
          <p>{product.category}</p>
        </div>
        <strong>${product.price}</strong>
      </div>
    </TiltLink>
  )
}
