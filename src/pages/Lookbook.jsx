import { lookbook } from "../data/products";
import { motion, useReducedMotion } from "framer-motion";
import OrbitGallery from "../components/OrbitGallery";
import TiltLink, { Glare } from "../components/TiltLink";
import usePageMeta from "../lib/usePageMeta";

export default function Lookbook() {
  const shots = lookbook.slice(0, 4);
  const reduceMotion = useReducedMotion();
  usePageMeta('Lookbook', 'Captured after dark: the Nobi lookbook, season by season.', shots[0]?.image);

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
        <motion.figure
          key={shot.id}
          initial={reduceMotion ? false : { opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.55, delay: i * 0.06 }}
        >
          <TiltLink
            to={`/lookbook/${shot.city.toLowerCase()}`}
            max={10}
            hoverScale={1.04}
            aria-label={`Open season ${shot.city}`}
          >
            <img src={shot.image} alt={`Season ${shot.city} look`} loading="lazy" decoding="async" />
            <Glare />
          </TiltLink>
          <figcaption>
            {String(i + 1).padStart(2, "0")} / {shot.city}
          </figcaption>
        </motion.figure>
      ))}
    />
  );
}
