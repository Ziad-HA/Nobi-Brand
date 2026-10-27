export default function About() {
  return (
    <section className="section about-page">
      <p className="eyebrow">The house</p>
      <h1>KAGE is a night brand.</h1>
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
      <img
        className="about-image"
        src="/images/studio.jpg"
        alt="Studio rack"
      />
    </section>
  )
}
