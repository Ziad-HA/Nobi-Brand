import { Link } from 'react-router-dom'

export default function ProductCard({ product }) {
  return (
    <Link to={`/product/${product.id}`} className="product-card">
      <div className="product-media">
        <img src={product.images[0]} alt={product.name} />
        <span className="chip">{product.soldOut ? 'Sold out' : product.tag}</span>
      </div>
      <div className="product-meta">
        <div>
          <h3>{product.name}</h3>
          <p>{product.category}</p>
        </div>
        <strong>${product.price}</strong>
      </div>
    </Link>
  )
}
