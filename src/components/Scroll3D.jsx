import { useRef } from 'react'
import { motion, useReducedMotion, useScroll, useTransform } from 'framer-motion'

// Swings its child across a 3D fan while it scrolls through the viewport.
// `dir` flips the direction so neighbours move against each other; reduced motion renders it flat.
export default function Scroll3D({ children, className = '', dir = 1, swing = 12, drift = 36 }) {
  const ref = useRef(null)
  const reduce = useReducedMotion()
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] })
  const rotateY = useTransform(scrollYProgress, [0, 1], [swing * dir, -swing * dir])
  const rotateX = useTransform(scrollYProgress, [0, 0.5, 1], [7, 0, -7])
  const y = useTransform(scrollYProgress, [0, 1], [drift * dir, -drift * dir])

  return (
    <motion.div
      ref={ref}
      className={`scroll3d ${className}`.trim()}
      style={reduce ? undefined : { rotateX, rotateY, y, transformPerspective: 1100 }}
    >
      {children}
    </motion.div>
  )
}
