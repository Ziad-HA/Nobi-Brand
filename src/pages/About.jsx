
export default function About() {
  return (
    <section className="section about-page">
      <div className="about-heading">
        <p className="eyebrow">Who's Nobi?</p>
        <h1>Nobi is a night brand.</h1>
        <span className="about-index">NOBI / ABOUT — 001</span>
      </div>

      <div className="about-grid">
        <p className="lede">
          We started in a shared studio above a closed bar: one rail, two
          patterns, and a rule that nothing ships unless it survives a week of
          actual wear.
        </p>

        <div className="about-copy">
          <p>
            Streetwear here is not a costume. It’s a uniform for people who
            move after dark — DJs, riders, designers, anyone who needs a
            silhouette that still holds at 3am.
          </p>
          <p>
            Drops are small. Fabrics are heavy. Prints crack on purpose. When a
            run sells through, we archive it instead of reprinting the same
            graphic into the ground.
          </p>
        </div>
      </div>

      <div className="stats">
        <div>
          <strong>09</strong>
          <span>Drops shipped</span>
        </div>
        <div>
          <strong>6</strong>
          <span>Cities shot</span>
        </div>
        <div>
          <strong>460</strong>
          <span>GSM core fleece</span>
        </div>
      </div>

      <div className="about-image-wrap">
        <img
          className="about-image"
          alt="Nobi TRAP"
          src={`${import.meta.env.BASE_URL}images/TRAP.jpg`}
        />
        <span className="about-image-label">NOBI — VISUAL ARCHIVE</span>
      </div>
    </section>
  )
}
