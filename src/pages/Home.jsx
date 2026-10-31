
import { Link } from "react-router-dom";
import Marquee from "../components/Marquee";
import ProductCard from "../components/ProductCard";
import { lookbook, products } from "../data/products";

export default function Home() {
  const featured = products.slice(0, 4);

  return (
    <>
      <section className="hero home-hero">
        <img
          src={`${import.meta.env.BASE_URL}images/TRAP.jpg`}
          alt="Nobi campaign"
        />

        <div className="hero-overlay" />

        <div className="hero-copy home-hero-copy">
          <p className="eyebrow">Season 04 · Night Shift</p>

          <h1>
            CUT FOR
            <br />
            THE NIGHT<span>.</span>
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
              Explore lookbook
            </Link>
          </div>
        </div>

        <p className="hero-stamp">NOBI / 09</p>
        <span className="hero-bottom-label">UNIFORM FOR THE AFTER HOURS</span>
      </section>

      <Marquee items={["Nobi", "Nobi", "Nobi", "Nobi", "Nobi"]} />

      <section className="section home-products">
        <div className="section-head">
          <div>
            <p className="eyebrow">The latest selection</p>
            <h2>DROP 09<span>.</span></h2>
          </div>

          <Link to="/shop" className="text-link">
            View all products ↗
          </Link>
        </div>

        <div className="product-grid">
          {featured.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>

      <section className="split split-bg home-story">
        <div className="split-media">
          <img
            src={`${import.meta.env.BASE_URL}images/download.jpg`}
            alt="Nobi editorial campaign"
          />
          <span className="story-image-label">NOBI / EDITORIAL 004</span>
        </div>

        <div className="split-copy">
          <p className="eyebrow">House notes / 001</p>

          <h2>
            BUILT LIKE A NIGHT SHIFT,
            <br />
            NOT A TREND CYCLE<span>.</span>
          </h2>

          <p>
            Nobi cuts streetwear for people who actually wear it — late trains,
            wet pavement, rooms that don’t close until four. Every piece is a
            small run. When it’s gone, it’s gone.
          </p>

          <Link to="/about" className="btn btn-primary">
            Discover Nobi
          </Link>
        </div>
      </section>

      <section className="section home-lookbook">
        <div className="section-head">
          <div>
            <p className="eyebrow">Captured after dark</p>
            <h2>LOOKBOOK<span>.</span></h2>
          </div>

          <Link to="/lookbook" className="text-link">
            View full edit ↗
          </Link>
        </div>

        <div className="look-strip">
          {lookbook.slice(0, 4).map((shot, index) => (
            <Link to="/lookbook" key={shot.id} className="look-tile">
              <img src={shot.image} alt={shot.city} />
              <span className="look-number">
                0{index + 1}
              </span>
              <span className="look-city">{shot.city}</span>
            </Link>
          ))}
        </div>
      </section>

      <section className="home-final">
        <p className="eyebrow">NOBI / AFTER HOURS</p>
        <h2>OWN THE NIGHT<span>.</span></h2>
        <Link to="/shop" className="btn btn-primary">
          Shop the collection
        </Link>
      </section>
    </>
  );
}
