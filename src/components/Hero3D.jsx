import { useEffect, useRef, useState } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { MathUtils } from 'three'

const VOLT = '#d6ff3a'

// Small hardware shards that orbit the knot. Built once at module load from a fixed seed,
// so the layout is identical on every load and render stays pure.
const SHARDS = (() => {
  let seed = 7
  const rand = () => {
    seed = (seed * 16807) % 2147483647
    return seed / 2147483647
  }
  return Array.from({ length: 18 }, () => {
    const a = rand() * Math.PI * 2
    const r = 1.6 + rand() * 1.1
    return {
      position: [Math.cos(a) * r, (rand() - 0.5) * 2.4, Math.sin(a) * r],
      rotation: [rand() * 3, rand() * 3, rand() * 3],
      scale: 0.05 + rand() * 0.09,
    }
  })
})()

function Knot({ pointer, still }) {
  const group = useRef(null)
  const { viewport } = useThree()

  // Wide screens park the knot on the right; phones tuck it into the top corner so it never covers the copy.
  const wide = viewport.width > 5
  const x = wide ? viewport.width * 0.26 : viewport.width * 0.2
  const y = wide ? 0.15 : viewport.height * 0.31
  const scale = wide ? 1 : Math.min(0.46, viewport.width / 7)

  useFrame((state, dt) => {
    const g = group.current
    if (!g || still) return
    const scroll = Math.min(window.scrollY / Math.max(window.innerHeight, 1), 1.4)
    const targetY = state.clock.elapsedTime * 0.25 + pointer.current.x * 0.6 + scroll * 1.6
    const targetX = -pointer.current.y * 0.4 + scroll * 0.5
    g.rotation.y = MathUtils.damp(g.rotation.y, targetY, 3, dt)
    g.rotation.x = MathUtils.damp(g.rotation.x, targetX, 3, dt)
    g.position.y = y + Math.sin(state.clock.elapsedTime * 0.8) * 0.06 - scroll * 0.35
  })

  return (
    <group ref={group} position={[x, y, 0]} scale={scale} rotation={[0.35, 0.6, 0]}>
      <mesh>
        <torusKnotGeometry args={[0.85, 0.27, 180, 24, 2, 3]} />
        <meshStandardMaterial color="#17190d" metalness={0.92} roughness={0.26} flatShading />
      </mesh>
      <mesh scale={1.035}>
        <torusKnotGeometry args={[0.85, 0.27, 90, 12, 2, 3]} />
        <meshBasicMaterial color={VOLT} wireframe transparent opacity={0.28} />
      </mesh>
      {SHARDS.map((s, i) => (
        <mesh key={i} position={s.position} rotation={s.rotation} scale={s.scale}>
          <octahedronGeometry args={[1, 0]} />
          <meshStandardMaterial color={i % 3 === 0 ? VOLT : '#2a2c20'} metalness={0.8} roughness={0.3} flatShading />
        </mesh>
      ))}
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
    window.addEventListener('pointermove', onMove, { passive: true })
    document.addEventListener('visibilitychange', onVis)
    return () => {
      io.disconnect()
      mq.removeEventListener('change', onMq)
      window.removeEventListener('pointermove', onMove)
      document.removeEventListener('visibilitychange', onVis)
    }
  }, [])

  // Reduced motion: draw one still frame. Offscreen or hidden tab: stop the loop completely.
  const frameloop = reduced ? 'demand' : visible && !hidden ? 'always' : 'never'

  return (
    <div ref={wrap} className="hero-3d" aria-hidden="true">
      <Canvas
        frameloop={frameloop}
        dpr={[1, 1.75]}
        camera={{ position: [0, 0, 6], fov: 40 }}
        gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
      >
        <ambientLight intensity={0.35} />
        <directionalLight position={[3, 2, 3]} intensity={2.6} color={VOLT} />
        <directionalLight position={[-3, -1, 2]} intensity={1.4} color="#ffffff" />
        <pointLight position={[0, 0, 3]} intensity={6} color="#ffffff" distance={9} />
        <Knot pointer={pointer} still={reduced} />
      </Canvas>
    </div>
  )
}
