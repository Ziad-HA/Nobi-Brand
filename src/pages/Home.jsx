import { Link } from "react-router-dom";
import useProducts from "../lib/useProducts";
import { motion, useReducedMotion } from "motion/react";
import ProductCard from "../components/ProductCard";
import Hero3DLayer from "../components/Hero3DLayer";
import OrbitGallery from "../components/OrbitGallery";
import TiltLink, { Glare } from "../components/TiltLink";
import { lookbook } from "../data/products";
import usePageMeta from "../lib/usePageMeta";
import DropCountdown from "../components/DropCountdown";
import Reveal from "../components/Reveal";

function shouldUseStaticHero(reduceMotion) {
  if (reduceMotion || typeof navigator === "undefined") return true;
  const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
  return Boolean(connection?.saveData || ["slow-2g", "2g"].includes(connection?.effectiveType));
}

export default function Home() {
  const { products } = useProducts();
  const reduceMotion = useReducedMotion();
  const useStaticHero = shouldUseStaticHero(reduceMotion);
  const reveal = reduceMotion
    ? {}
    : { initial: { opacity: 0, y: 34 }, whileInView: { opacity: 1, y: 0 }, viewport: { once: true, amount: 0.16 }, transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] } };
  const featured = products.slice(0, 4);
  usePageMeta('', undefined, `${import.meta.env.BASE_URL}images/TRAP.jpg`);

  return (
    <>
      <section className="hero home-hero video-hero">
        {useStaticHero ? (
          <img
            src={`${import.meta.env.BASE_URL}images/TRAP.jpg`}
            alt="Unseen campaign"
            loading="eager"
            fetchPriority="high"
            decoding="async"
          />
        ) : (
          <video
            className="hero-video"
            src={`${import.meta.env.BASE_URL}videos/hero.mp4`}
            poster={`${import.meta.env.BASE_URL}images/TRAP.jpg`}
            autoPlay
            muted
            loop
            playsInline
            preload="metadata"
            aria-hidden="true"
          />
        )}
        <div className="hero-overlay" />
        <Hero3DLayer />
        <div className="hero-copy home-hero-copy">
          <p className="eyebrow">Season 04 · Night Shift</p>
          <h1 aria-label="Stay unseen.">
            <small aria-hidden="true">STAY</small>
            <strong aria-hidden="true">UNSEEN<i>.</i></strong>
          </h1>
          <p className="lede">
            Limited drops. Heavy fabrics. Made for the ones who move after dark.
          </p>
          <div className="hero-actions">
            <Link to="/shop" className="btn btn-primary">Shop drop 26</Link>
            <Link to="/lookbook" className="btn btn-ghost">Explore lookbook</Link>
          </div>
        </div>
        <p className="hero-stamp">UNSEEN / 09</p>
        <span className="hero-bottom-label">UNIFORM FOR THE AFTER HOURS</span>
      </section>

      <motion.section className="section home-products" {...reveal}>
        <div className="section-head">
          <div>
            <p className="eyebrow">The latest selection</p>
            <h2>DROP 26<span>.</span></h2>
          </div>
          <Link to="/shop" className="text-link">View all products ↗</Link>
        </div>
        <div className="product-grid">
          {featured.map((product, index) => (
            <Reveal key={product.id} delay={index * 0.08} y={30}>
              <ProductCard product={product} priority={index === 0} />
            </Reveal>
          ))}
        </div>
      </motion.section>

      <motion.section className="split split-bg home-story" {...reveal}>
        <div className="split-media">
          <img
            src={`${import.meta.env.BASE_URL}images/download.jpg`}
            alt="Unseen editorial campaign"
            loading="lazy"
            decoding="async"
          />
          <span className="story-image-label">UNSEEN / EDITORIAL 004</span>
        </div>
        <div className="split-copy">
          <p className="eyebrow">House notes / 001</p>
          <h2>
            BUILT LIKE A NIGHT SHIFT,
            <br />
            NOT A TREND CYCLE<span>.</span>
          </h2>
          <p>
            Unseen cuts streetwear for people who actually wear it — late trains,
            wet pavement, rooms that don’t close until four. Every piece is a
            small run. When it’s gone, it’s gone.
          </p>
          <Link to="/about" className="btn btn-primary">Discover Unseen</Link>
        </div>
      </motion.section>

      <OrbitGallery
        className="section home-lookbook"
        gridClassName="look-strip"
        head={
          <div className="section-head">
            <div>
              <p className="eyebrow">Captured after dark</p>
              <h2>LOOKBOOK<span>.</span></h2>
            </div>
            <Link to="/lookbook" className="text-link">View full edit ↗</Link>
          </div>
        }
        items={lookbook.slice(0, 4).map((shot, index) => (
          <TiltLink
            key={shot.id}
            to="/lookbook"
            className="look-tile"
            max={11}
            hoverScale={1.05}
            aria-label={`Season ${shot.city} lookbook`}
          >
            <img src={shot.image} alt="" loading="lazy" decoding="async" />
            <Glare />
            <span className="look-number" aria-hidden="true">0{index + 1}</span>
            <span className="look-city">{shot.city}</span>
          </TiltLink>
        ))}
      />

      <DropCountdown />

      <motion.section className="home-final" {...reveal}>
        <p className="eyebrow">UNSEEN / AFTER HOURS</p>
        <h2>OWN THE NIGHT<span>.</span></h2>
        <Link to="/shop" className="btn btn-primary">Shop the collection</Link>
      </motion.section>
    </>
  );
}
