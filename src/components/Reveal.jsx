import { motion, useReducedMotion } from 'motion/react'
import { EASE, DURATION, viewportOnce } from '../lib/motion'

// Soft fade + rise when scrolled into view. Pass `delay` to stagger siblings.
export default function Reveal({ as = 'div', children, delay = 0, y = 24, className, ...rest }) {
  const reduce = useReducedMotion()
  const Tag = motion[as] || motion.div
  if (reduce) return <Tag className={className} {...rest}>{children}</Tag>
  return (
    <Tag
      className={className}
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={viewportOnce}
      transition={{ duration: DURATION.base, ease: EASE, delay }}
      {...rest}
    >
      {children}
    </Tag>
  )
}
