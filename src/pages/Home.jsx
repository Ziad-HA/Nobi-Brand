import { Link } from 'react-router-dom'
import Marquee from '../components/Marquee'
import ProductCard from '../components/ProductCard'
import { lookbook, products } from '../data/products'

export default function Home() {
  const featured = products.slice(0, 4)

  return (
    <>
      <section className="hero">
        <img
          src="/images/hero.jpg"
          alt="KAGE campaign"
        />
        <div className="hero-copy">
          <p className="eyebrow">Season 04 · Night Shift</p>
          <h1>
            Cut for
            <br />
            the night.
          </h1>
          <p className="lede">
            Limited streetwear. Oversized silhouettes. Hardware that doesn’t
            pretend to be quiet.
          </p>
          <div className="hero-actions">
            <Link to="/shop" className="btn btn-primary">
              Shop drop 09
            </Link>
            <Link to="/lookbook" className="btn btn-ghost">
              Lookbook
            </Link>
          </div>
        </div>
        <p className="hero-stamp">KAGE / 09</p>
      </section>

      <Marquee items={['Limited runs', 'Night cargo', 'Shadow core', 'No restocks', 'City grade']} />

      <section className="section">
        <div className="section-head">
          <div>
            <p className="eyebrow">Now live</p>
            <h2>Drop 09</h2>
          </div>
          <Link to="/shop" className="text-link">
            View all
          </Link>
        </div>
        <div className="product-grid">
          {featured.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>

      <section className="split">
        <div className="split-copy">
          <p className="eyebrow">House notes</p>
          <h2>Built like a night shift, not a trend cycle.</h2>
          <p>
            KAGE cuts streetwear for people who actually wear it — late trains,
            wet pavement, rooms that don’t close until four. Every piece is a
            small run. When it’s gone, it’s gone.
          </p>
          <Link to="/about" className="btn btn-primary">
            The house
          </Link>
        </div>
        <div className="split-media">
          <img
            src="/images/look-berlin.jpg"
            alt="Editorial look"
          />
        </div>
      </section>

      <section className="section">
        <div className="section-head">
          <div>
            <p className="eyebrow">Cities</p>
            <h2>Lookbook</h2>
          </div>
          <Link to="/lookbook" className="text-link">
            Full edit
          </Link>
        </div>
        <div className="look-strip">
          {lookbook.slice(0, 4).map((shot) => (
            <Link to="/lookbook" key={shot.id} className="look-tile">
              <img src={shot.image} alt={shot.city} />
              <span>{shot.city}</span>
            </Link>
          ))}
        </div>
      </section>
    </>
  )
}
