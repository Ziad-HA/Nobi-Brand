// Shared motion tokens: one calm easing curve and gentle durations for the whole brand.
export const EASE = [0.22, 1, 0.36, 1]

export const DURATION = { fast: 0.35, base: 0.7, slow: 1.1 }

export const fadeUp = (distance = 24) => ({
  hidden: { opacity: 0, y: distance },
  show: { opacity: 1, y: 0, transition: { duration: DURATION.base, ease: EASE } },
})

export const stagger = (gap = 0.09, delay = 0) => ({
  hidden: {},
  show: { transition: { staggerChildren: gap, delayChildren: delay } },
})

export const viewportOnce = { once: true, amount: 0.15 }
