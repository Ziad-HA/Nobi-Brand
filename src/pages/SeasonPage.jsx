import { useParams, Link } from "react-router-dom";
import { seasons } from "../data/seasons";
import { products } from "../data/products";

export default function SeasonPage() {
  const { slug } = useParams();
  const season = seasons.find((s) => s.slug === slug);

  if (!season) {
    return (
      <section className="section season-page">
        <Link to="/lookbook" className="back-link">← Lookbook</Link>
        <h1>Season not found</h1>
      </section>
    );
  }

  const items = products.filter((p) => p.season === season.slug);

  return (
    <section className="section season-page">
      <Link to="/lookbook" className="back-link">← Lookbook</Link>
      <p className="eyebrow">Season {season.label} · {season.year}</p>
      <h1>{season.label} Collection</h1>
      <p className="season-desc">{season.description}</p>

      <div className="product-grid">
        {items.map((p) => (
          <Link key={p.id} to={`/product/${p.id}`} className="product-card">
            <div className="product-media">
              <img src={p.images[0]} alt={p.name} />
              <span className="chip">{season.label}</span>
            </div>
            <div className="product-meta">
              <div>
                <h3>{p.name}</h3>
                <p>{p.category}</p>
              </div>
              <strong>${p.price}</strong>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}