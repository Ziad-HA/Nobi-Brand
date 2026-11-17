import { useEffect, useState } from 'react'

function getRemaining(target) {
  const diff = Math.max(0, target - Date.now())
  return { days: Math.floor(diff / 86400000), hours: Math.floor(diff / 3600000) % 24, minutes: Math.floor(diff / 60000) % 60, seconds: Math.floor(diff / 1000) % 60 }
}

export default function DropCountdown() {
  const rawDate = import.meta.env.VITE_DROP_DATE
  const target = rawDate ? new Date(rawDate).getTime() : NaN
  const valid = Number.isFinite(target) && target > 0
  const [remaining, setRemaining] = useState(() => valid ? getRemaining(target) : null)
  useEffect(() => {
    if (!valid || target <= Date.now()) return undefined
    const timer = window.setInterval(() => setRemaining(getRemaining(target)), 1000)
    return () => window.clearInterval(timer)
  }, [valid, target])
  return (
    <section className="drop-countdown" aria-label="Next NOBI drop">
      <div><p className="eyebrow">The next release</p><h2>DON'T MISS THE DROP<span>.</span></h2><p>Small runs. No reruns promised.</p></div>
      {valid ? remaining && (target <= Date.now()
        ? <strong className="drop-countdown-status">THE DROP IS LIVE</strong>
        : <div className="drop-countdown-clock" aria-live="off">{Object.entries(remaining).map(([unit, value]) => <div key={unit}><strong>{String(value).padStart(2, '0')}</strong><span>{unit}</span></div>)}</div>)
        : <div className="drop-countdown-status">DROP DATE TO BE ANNOUNCED</div>}
    </section>
  )
}
