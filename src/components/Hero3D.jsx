import { useEffect, useMemo, useRef, useState } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { CanvasTexture, MathUtils } from 'three'

const VOLT = '#d6ff3a'

// Fixed-seed layout so the dust looks the same on every load and render stays pure.
function seeded(seed) {
  let s = seed
  return () => {
    s = (s * 16807) % 2147483647
    return s / 2147483647
  }
}

const DUST_MAX = 150
const DUST = (() => {
  const rand = seeded(11)
  const pos = new Float32Array(DUST_MAX * 3)
  const speed = new Float32Array(DUST_MAX)
  for (let i = 0; i < DUST_MAX; i++) {
    pos[i * 3] = (rand() - 0.5) * 12
    pos[i * 3 + 1] = (rand() - 0.5) * 7
    pos[i * 3 + 2] = -2 + rand() * 4
    speed[i] = 0.05 + rand() * 0.14
  }
  return { pos, speed }
})()

const MISTS = (() => {
  const rand = seeded(5)
  return Array.from({ length: 6 }, (_, i) => ({
    x: (rand() - 0.5) * 8,
    y: (rand() - 0.5) * 3.5,
    z: -2.5 + rand() * 1.5,
    size: 5 + rand() * 4,
    opacity: 0.07 + rand() * 0.06,
    phase: rand() * 6,
    tint: i % 3 === 0 ? VOLT : '#f4f4f0',
  }))
})()

// One soft round blob, reused for every dust speck and every patch of mist.
function useSoftTexture() {
  return useMemo(() => {
    const c = document.createElement('canvas')
    c.width = c.height = 64
    const g = c.getContext('2d')
    const grad = g.createRadialGradient(32, 32, 0, 32, 32, 32)
    grad.addColorStop(0, 'rgba(255,255,255,1)')
    grad.addColorStop(0.35, 'rgba(255,255,255,0.45)')
    grad.addColorStop(1, 'rgba(255,255,255,0)')
    g.fillStyle = grad
    g.fillRect(0, 0, 64, 64)
    return new CanvasTexture(c)
  }, [])
}

function Atmosphere({ pointer, still }) {
  const group = useRef(null)
  const points = useRef(null)
  const mists = useRef([])
  const { viewport } = useThree()
  const tex = useSoftTexture()
  const count = viewport.width > 5 ? DUST_MAX : 110

  useFrame((state, dt) => {
    const g = group.current
    if (!g || still) return
    const t = state.clock.elapsedTime
    const scroll = Math.min(window.scrollY / Math.max(window.innerHeight, 1), 1.4)

    // Dust rises slowly and wraps around; scrolling makes it drift up faster.
    const attr = points.current.geometry.attributes.position
    for (let i = 0; i < count; i++) {
      let y = attr.array[i * 3 + 1] + DUST.speed[i] * dt * (1 + scroll * 2.5)
      if (y > 3.6) y = -3.6
      attr.array[i * 3 + 1] = y
      attr.array[i * 3] += Math.sin(t * 0.4 + i) * dt * 0.02
    }
    attr.needsUpdate = true

    // Cursor parallax: the whole atmosphere leans a little toward the pointer.
    g.position.x = MathUtils.damp(g.position.x, -pointer.current.x * 0.5, 2.5, dt)
    g.position.y = MathUtils.damp(g.position.y, pointer.current.y * 0.3 + scroll * 0.6, 2.5, dt)

    mists.current.forEach((m, i) => {
      if (!m) return
      const d = MISTS[i]
      m.position.x = d.x + Math.sin(t * 0.07 + d.phase) * 0.9
      m.position.y = d.y + Math.cos(t * 0.05 + d.phase) * 0.4
    })
  })

  return (
    <group ref={group}>
      {MISTS.map((m, i) => (
        <sprite
          key={i}
          ref={(el) => (mists.current[i] = el)}
          position={[m.x, m.y, m.z]}
          scale={[m.size, m.size, 1]}
        >
          <spriteMaterial map={tex} color={m.tint} transparent opacity={m.opacity} depthWrite={false} />
        </sprite>
      ))}
      <points ref={points}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[DUST.pos.slice(), 3]} count={DUST_MAX} />
        </bufferGeometry>
        <pointsMaterial
          map={tex}
          color="#f4f4f0"
          size={0.09}
          sizeAttenuation
          transparent
          opacity={0.55}
          depthWrite={false}
        />
      </points>
    </group>
  )
}

export default function Hero3D() {
  const wrap = useRef(null)
  const pointer = useRef({ x: 0, y: 0 })
  const [visible, setVisible] = useState(true)
  const [hidden, setHidden] = useState(false)
  const [reduced, setReduced] = useState(() => window.matchMedia('(prefers-reduced-motion: reduce)').matches)

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    const onMq = (e) => setReduced(e.matches)
    const onMove = (e) => {
      pointer.current.x = (e.clientX / window.innerWidth) * 2 - 1
      pointer.current.y = (e.clientY / window.innerHeight) * 2 - 1
    }
    const onVis = () => setHidden(document.hidden)
    const io = new IntersectionObserver(([entry]) => setVisible(entry.isIntersecting))
    if (wrap.current) io.observe(wrap.current)

    mq.addEventListener('change', onMq)
    const finePointer = window.matchMedia('(pointer: fine)').matches
    if (finePointer) window.addEventListener('pointermove', onMove, { passive: true })
    document.addEventListener('visibilitychange', onVis)
    return () => {
      io.disconnect()
      mq.removeEventListener('change', onMq)
      if (finePointer) window.removeEventListener('pointermove', onMove)
      document.removeEventListener('visibilitychange', onVis)
    }
  }, [])

  // Reduced motion: draw one still frame. Offscreen or hidden tab: stop the loop completely.
  const frameloop = reduced ? 'demand' : visible && !hidden ? 'always' : 'never'

  return (
    <div ref={wrap} className="hero-3d" aria-hidden="true">
      <Canvas
        frameloop={frameloop}
        dpr={[1, 1.25]}
        camera={{ position: [0, 0, 6], fov: 40 }}
        gl={{ antialias: false, alpha: true, powerPreference: 'low-power' }}
      >
        <Atmosphere pointer={pointer} still={reduced} />
      </Canvas>
    </div>
  )
}
