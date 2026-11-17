import { lookbook } from "../data/products";
import OrbitGallery from "../components/OrbitGallery";
import TiltLink, { Glare } from "../components/TiltLink";

export default function Lookbook() {
  const shots = lookbook.slice(0, 4);

  return (
    <OrbitGallery
      className="section lookbook-page"
      gridClassName="look-masonry"
      head={
        <div className="section-head">
          <div>
            <p className="eyebrow">Season 04</p>
            <h1>Lookbook</h1>
          </div>
          <p className="muted">
            Shot across six cities. No retouch. No posing for the algorithm.
          </p>
        </div>
      }
      items={shots.map((shot, i) => (
        <figure key={shot.id}>
          <TiltLink
            to={`/lookbook/${shot.city.toLowerCase()}`}
            max={10}
            hoverScale={1.04}
            aria-label={`Open season ${shot.city}`}
          >
            <img src={shot.image} alt={`Season ${shot.city} look`} />
            <Glare />
          </TiltLink>
          <figcaption>
            {String(i + 1).padStart(2, "0")} / {shot.city}
          </figcaption>
        </figure>
      ))}
    />
  );
}
