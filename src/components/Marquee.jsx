
export default function Marquee({ items }) {
  const loop = [...items, ...items]

  return (
    <div className="marquee" aria-hidden="true">
      <div className="marquee-track">
        {loop.map((item, i) => (
          <span key={`${item}-${i}`}>
            {item} <em>✦</em>
          </span>
        ))}
      </div>
    </div>
  )
}
