import { lookbook } from "../data/products";
import Scroll3D from "../components/Scroll3D";
import TiltLink from "../components/TiltLink";

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
          <Scroll3D key={shot.id} dir={i % 2 ? -1 : 1}>
            <figure>
              <TiltLink to={`/lookbook/${shot.city.toLowerCase()}`} aria-label={`Open season ${shot.city}`}>
                <img src={shot.image} alt={`Season ${shot.city} look`} />
              </TiltLink>
              <figcaption>
                {String(i + 1).padStart(2, "0")} / {shot.city}
              </figcaption>
            </figure>
          </Scroll3D>
        ))}
      </div>
    </section>
  );
}