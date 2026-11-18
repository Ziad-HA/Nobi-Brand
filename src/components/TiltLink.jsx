import { Link } from 'react-router-dom'
import { motion, useMotionValue, useReducedMotion, useSpring } from 'motion/react'
import { sfx } from '../lib/sfx'

const MotionLink = motion.create(Link)

// Soft highlight that follows the cursor. Drop it inside the image box of a card;
// it reads --mx / --my that TiltLink keeps up to date.
export function Glare() {
  return <span className="tilt-glare" aria-hidden="true" />
}

// A Link that leans toward the cursor (mouse) or the finger (touch, while pressed) and,
// with hoverScale > 1, rises toward you on hover. Spring-driven so it eases back instead
// of snapping, and does nothing under reduced motion.
// It also publishes --px/--py (-1..1) and --mx/--my (%) so CSS can shift the photo inside.
export default function TiltLink({ max = 8, hoverScale = 1, className = '', children, onClick, ...props }) {
  const reduce = useReducedMotion()
  const rx = useSpring(useMotionValue(0), { stiffness: 220, damping: 20 })
  const ry = useSpring(useMotionValue(0), { stiffness: 220, damping: 20 })
  const scale = useSpring(useMotionValue(1), { stiffness: 260, damping: 22 })

  const aim = (e) => {
    if (reduce) return
    const el = e.currentTarget
    const r = el.getBoundingClientRect()
    const px = (e.clientX - r.left) / r.width - 0.5
    const py = (e.clientY - r.top) / r.height - 0.5
    ry.set(px * max * 2)
    rx.set(-py * max * 2)
    el.style.setProperty('--px', (px * 2).toFixed(3))
    el.style.setProperty('--py', (py * 2).toFixed(3))
    el.style.setProperty('--mx', `${((px + 0.5) * 100).toFixed(1)}%`)
    el.style.setProperty('--my', `${((py + 0.5) * 100).toFixed(1)}%`)
  }

  const rest = (e) => {
    rx.set(0)
    ry.set(0)
    scale.set(1)
    const el = e.currentTarget
    delete el.dataset.pressed
    el.style.setProperty('--px', '0')
    el.style.setProperty('--py', '0')
    el.style.setProperty('--mx', '50%')
    el.style.setProperty('--my', '50%')
  }

  return (
    <MotionLink
      {...props}
      className={`tilt3d ${className}`.trim()}
      style={reduce ? undefined : { rotateX: rx, rotateY: ry, scale, transformPerspective: 900 }}
      onPointerEnter={(e) => {
        if (e.pointerType !== 'mouse') return
        if (!reduce) scale.set(hoverScale)
        sfx.play('hover')
      }}
      onPointerMove={(e) => e.pointerType === 'mouse' && aim(e)}
      onPointerDown={(e) => {
        if (e.pointerType === 'mouse') return
        // Touch has no hover, so pressing is the hover: the card rises toward the finger and
        // data-pressed switches on the same ring, glow, highlight and photo zoom the mouse gets.
        e.currentTarget.dataset.pressed = ''
        aim(e)
        if (!reduce) scale.set(Math.max(1.04, hoverScale * 0.98))
      }}
      onPointerUp={(e) => e.pointerType !== 'mouse' && rest(e)}
      onPointerCancel={rest}
      onPointerLeave={rest}
      onClick={(e) => {
        sfx.play('click')
        onClick?.(e)
      }}
    >
      {children}
    </MotionLink>
  )
}
