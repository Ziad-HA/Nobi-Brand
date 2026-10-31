import { Link } from "react-router-dom";
import { lookbook } from "../data/products";

export default function Lookbook() {
  const shots = lookbook.slice(0, 4);

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
        {shots.map((shot, i) => (
          <figure key={shot.id}>
            <Link to={`/lookbook/${shot.city.toLowerCase()}`}>
              <img src={shot.image} alt={`${shot.city} look`} />
            </Link>
            <figcaption>
              {String(i + 1).padStart(2, "0")} / {shot.city}
            </figcaption>
          </figure>
        ))}
      </div>
    </section>
  );
}