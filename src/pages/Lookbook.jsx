import { lookbook } from "../data/products";

export default function Lookbook() {
  return (
    <section className="section lookbook-page">
      <div className="section-head">
        <div>
          <p className="eyebrow">Season 04</p>
          <h1>Lookbook</h1>
        </div>
        <p className="muted">
          Shot across six cities. No retouch. No posing for the algorithm.
        </p>
      </div>
      <div className="look-masonry">
        {lookbook.map((shot, i) => (
          <figure key={shot.id} className={i % 3 === 0 ? "tall" : ""}>
            <img src={shot.image} alt={`${shot.city} look`} />
            <figcaption>
              {String(i + 1).padStart(2, "0")} / {shot.city}
            </figcaption>
          </figure>
        ))}
      </div>
    </section>
  );
}
