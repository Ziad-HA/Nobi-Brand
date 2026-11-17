import { Link } from 'react-router-dom'
import { motion, useMotionValue, useReducedMotion, useSpring } from 'framer-motion'

const MotionLink = motion.create(Link)

// A Link that tips toward the cursor (mouse) or the finger (touch, while pressed).
// Spring-driven so it eases back instead of snapping, and does nothing under reduced motion.
export default function TiltLink({ max = 8, className = '', children, ...props }) {
  const reduce = useReducedMotion()
  const rx = useSpring(useMotionValue(0), { stiffness: 220, damping: 20 })
  const ry = useSpring(useMotionValue(0), { stiffness: 220, damping: 20 })

  const aim = (e) => {
    if (reduce) return
    const r = e.currentTarget.getBoundingClientRect()
    const px = (e.clientX - r.left) / r.width - 0.5
    const py = (e.clientY - r.top) / r.height - 0.5
    ry.set(px * max * 2)
    rx.set(-py * max * 2)
  }
  const rest = () => {
    rx.set(0)
    ry.set(0)
  }

  return (
    <MotionLink
      {...props}
      className={`tilt3d ${className}`.trim()}
      style={reduce ? undefined : { rotateX: rx, rotateY: ry, transformPerspective: 900 }}
      onPointerMove={(e) => e.pointerType === 'mouse' && aim(e)}
      onPointerDown={aim}
      onPointerUp={rest}
      onPointerCancel={rest}
      onPointerLeave={rest}
    >
      {children}
    </MotionLink>
  )
}
