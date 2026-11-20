
export default function Marquee({ items = [] }) {
  const loop = [...items, ...items, ...items]

  return (
    <section className="marquee" aria-label="UNSEEN brand statement">
      <div className="marquee-track">
        {loop.map((item, i) => (
          <div className="marquee-item" key={`${item}-${i}`}>
            <span className="marquee-text">{item}</span>
            <span className="marquee-symbol">✳</span>
          </div>
        ))}
      </div>
    </section>
  )
}
