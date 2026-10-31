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
    <section className="product-page" style={{ maxWidth: '1400px', margin: '0 auto', padding: '40px 40px', color: '#fff' }}>
      
      {/* المعرض على الشمال والتفاصيل جنبه بنفس المقاسات */}
      <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'flex-start', gap: '60px', alignItems: 'flex-start', marginBottom: '100px' }}>
        
        {/* صندوق الصور والمعرض */}
        <div style={{ width: '55%', flexShrink: 0 }}>
          <div style={{ width: '100%', height: '650px', backgroundColor: '#0b0b0b', borderRadius: '4px', overflow: 'hidden', border: '1px solid #1a1a1a', marginBottom: '16px' }}>
            <img 
              src={product.images[shot]} 
              alt={product.name} 
              style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
            />
          </div>
          
          {/* الصور المصغرة */}
          <div style={{ display: 'flex', gap: '12px', overflowX: 'auto', paddingBottom: '8px' }}>
            {product.images.map((src, i) => (
              <button 
                key={src} 
                onClick={() => setShot(i)}
                style={{
                  width: '90px',
                  height: '100px',
                  borderRadius: '4px',
                  overflow: 'hidden',
                  border: shot === i ? '1px solid #fff' : '1px solid #222',
                  opacity: shot === i ? 1 : 0.4,
                  cursor: 'pointer',
                  backgroundColor: '#111',
                  padding: 0,
                  flexShrink: 0
                }}
              >
                <img src={src} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </button>
            ))}
          </div>
        </div>

        {/* صندوق التفاصيل والكتابة على اليمين */}
        <div style={{ width: '40%', paddingTop: '10px' }}>
          <p style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '2px', color: '#888', marginBottom: '12px' }}>
            {product.tag} · {product.category}
          </p>
          
          <h1 style={{ fontSize: '42px', fontWeight: '900', textTransform: 'uppercase', letterSpacing: '-1px', margin: '0 0 16px 0', lineHeight: '1.1' }}>
            {product.name}
          </h1>
          
          <p style={{ fontSize: '24px', fontFamily: 'monospace', fontWeight: 'bold', color: '#fff', marginBottom: '24px' }}>
            ${product.price}
          </p>

          <p style={{ fontSize: '14px', color: '#bbb', lineHeight: '1.7', marginBottom: '32px' }}>
            {product.description}
          </p>

          {/* اختيار اللون */}
          <div style={{ marginBottom: '28px' }}>
            <p style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '1.5px', color: '#888', fontWeight: 'bold', marginBottom: '12px' }}>
              COLOR
            </p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
              {product.colors.map((c) => (
                <button 
                  key={c} 
                  onClick={() => setColor(c)}
                  style={{
                    padding: '10px 24px',
                    fontSize: '12px',
                    fontFamily: 'monospace',
                    textTransform: 'uppercase',
                    borderRadius: '4px',
                    border: 'none',
                    backgroundColor: color === c ? '#ccff00' : '#161616',
                    color: color === c ? '#000' : '#888',
                    fontWeight: 'bold',
                    cursor: 'pointer'
                  }}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>

          {/* اختيار المقاس */}
          <div style={{ marginBottom: '40px' }}>
            <p style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '1.5px', color: '#888', fontWeight: 'bold', marginBottom: '12px' }}>
              SIZE
            </p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
              {product.sizes.map((s) => (
                <button 
                  key={s} 
                  onClick={() => setSize(s)}
                  style={{
                    width: '48px',
                    height: '48px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '13px',
                    fontFamily: 'monospace',
                    fontWeight: 'bold',
                    borderRadius: '4px',
                    border: 'none',
                    backgroundColor: size === s ? '#ccff00' : '#161616',
                    color: size === s ? '#000' : '#888',
                    cursor: 'pointer'
                  }}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          {/* أزرار الإضافة للسلة */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <button 
              disabled={product.soldOut} 
              onClick={onAdd}
              style={{
                width: '100%',
                padding: '18px',
                fontSize: '13px',
                fontWeight: '900',
                textTransform: 'uppercase',
                letterSpacing: '2px',
                borderRadius: '4px',
                border: 'none',
                backgroundColor: product.soldOut ? '#222' : '#ccff00',
                color: product.soldOut ? '#555' : '#000',
                cursor: product.soldOut ? 'not-allowed' : 'pointer',
                transition: 'all 0.2s'
              }}
            >
              {product.soldOut ? 'Sold out' : added ? 'Added to bag ✓' : 'ADD TO BAG'}
            </button>

            {added && (
              <button 
                onClick={() => navigate('/cart')}
                style={{
                  width: '100%',
                  padding: '14px',
                  fontSize: '12px',
                  fontWeight: 'bold',
                  textTransform: 'uppercase',
                  letterSpacing: '1px',
                  borderRadius: '4px',
                  border: '1px solid #333',
                  backgroundColor: '#111',
                  color: '#fff',
                  cursor: 'pointer'
                }}
              >
                View bag
              </button>
            )}
          </div>
        </div>

      </div>

      {/* قسم Also in the drop تحت خالص */}
      <div style={{ borderTop: '1px solid #1a1a1a', paddingTop: '60px', width: '100%' }}>
        <h2 style={{ fontSize: '20px', fontWeight: '900', textTransform: 'uppercase', marginBottom: '30px', letterSpacing: '-0.5px' }}>
          Also in the drop
        </h2>
        <div className="product-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '24px' }}>
          {related.map((item) => (
            <ProductCard key={item.id} product={item} />
          ))}
        </div>
      </div>
    </section>
  )
}