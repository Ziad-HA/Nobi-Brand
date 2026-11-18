import { useParams, Link } from "react-router-dom";
import { motion, useReducedMotion } from "motion/react";
import ProductCard from "../components/ProductCard";
import { seasons } from "../data/seasons";
import { products } from "../data/products";
import usePageMeta from "../lib/usePageMeta";

export default function SeasonPage() {
  const { slug } = useParams();
  const reduceMotion = useReducedMotion();
  const season = seasons.find((s) => s.slug === slug);
  usePageMeta(season ? `Season ${season.label} Lookbook` : "Season not found", season?.description);

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

      {items.length > 0 ? (
        <div className="product-grid">
          {items.map((product, index) => (
            <motion.div
              key={product.id}
              initial={reduceMotion ? false : { opacity: 0, y: 22 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.12 }}
              transition={{ duration: 0.5, delay: (index % 4) * 0.05 }}
            >
              <ProductCard product={product} />
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="season-empty">
          <p className="eyebrow">Archive / {season.label}</p>
          <h2>No pieces in this archive yet.</h2>
          <Link to="/shop" className="btn btn-primary">Explore current pieces</Link>
        </div>
      )}
    </section>
  );
}