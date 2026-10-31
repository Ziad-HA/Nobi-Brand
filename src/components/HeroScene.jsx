import { useEffect, useRef } from 'react'
import {
  WebGLRenderer,
  Scene,
  OrthographicCamera,
  PlaneGeometry,
  ShaderMaterial,
  Mesh,
  VideoTexture,
  Vector2,
  LinearFilter,
  RGBFormat,
  TextureLoader,
} from 'three'

const vertexShader = `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = vec4(position.xy, 0.0, 1.0);
  }
`

const fragmentShader = `
  uniform sampler2D uTex;
  uniform vec2 uRes;
  uniform vec2 uTexRes;
  uniform vec2 uMouse;
  uniform float uTime;
  varying vec2 vUv;

  float hash(vec2 p) {
    return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
  }

  float noise(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    f = f * f * (3.0 - 2.0 * f);
    return mix(
      mix(hash(i), hash(i + vec2(1.0, 0.0)), f.x),
      mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), f.x),
      f.y
    );
  }

  float fbm(vec2 p) {
    float v = 0.0;
    float a = 0.5;
    for (int i = 0; i < 4; i++) {
      v += a * noise(p);
      p *= 2.0;
      a *= 0.5;
    }
    return v;
  }

  vec2 coverUv(vec2 uv) {
    float rs = uRes.x / uRes.y;
    float ri = uTexRes.x / uTexRes.y;
    vec2 s = rs > ri ? vec2(1.0, ri / rs) : vec2(rs / ri, 1.0);
    return (uv - 0.5) * s + 0.5;
  }

  void main() {
    vec2 uv = vUv;
    float t = uTime * 0.08;

    vec2 flow = vec2(fbm(uv * 3.0 + t), fbm(uv * 3.0 - t + 5.0)) - 0.5;
    vec2 parallax = (uMouse - 0.5) * 0.02;
    vec3 col = texture2D(uTex, coverUv(uv + flow * 0.03 + parallax)).rgb;

    float g = dot(col, vec3(0.299, 0.587, 0.114));
    col = mix(col, vec3(g), 0.35);
    col = (col - 0.5) * 1.08 + 0.5;

    float fog = fbm(uv * 2.5 + vec2(t * 2.0, -t));
    col = mix(col, vec3(0.04), fog * 0.25);

    float m = smoothstep(0.35, 0.0, distance(uv, uMouse));
    col += vec3(0.84, 1.0, 0.23) * m * 0.06;

    col += (hash(uv * uRes + uTime) - 0.5) * 0.06;

    gl_FragColor = vec4(col, 1.0);
  }
`

export default function HeroScene({ src, alt = '', isVideo = false }) {
  const ref = useRef(null)
  const videoRef = useRef(null)

  useEffect(() => {
    const mount = ref.current
    if (!mount) return

    let renderer
    try {
      renderer = new WebGLRenderer({ antialias: false, powerPreference: 'low-power' })
    } catch {
      return
    }

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, window.innerWidth < 768 ? 1 : 1.5))
    const canvas = renderer.domElement
    canvas.setAttribute('aria-hidden', 'true')
    mount.appendChild(canvas)

    const scene = new Scene()
    const camera = new OrthographicCamera(-1, 1, 1, -1, 0, 1)
    const uniforms = {
      uTex: { value: null },
      uRes: { value: new Vector2(1, 1) },
      uTexRes: { value: new Vector2(1, 1) },
      uMouse: { value: new Vector2(0.5, 0.5) },
      uTime: { value: 0 },
    }
    const geometry = new PlaneGeometry(2, 2)
    const material = new ShaderMaterial({ uniforms, vertexShader, fragmentShader })
    scene.add(new Mesh(geometry, material))

    const target = new Vector2(0.5, 0.5)
    const t0 = performance.now()
    let raf = 0
    let running = false
    let visible = true
    let ready = false
    let disposed = false
    let texture

    const frame = (now) => {
      uniforms.uTime.value = (now - t0) / 1000
      uniforms.uMouse.value.lerp(target, 0.06)
      
      if (isVideo && texture) {
        texture.needsUpdate = true
      }

      renderer.render(scene, camera)
      raf = requestAnimationFrame(frame)
    }

    const start = () => {
      if (running || !ready || !visible || document.hidden || reduceMotion) return
      running = true
      raf = requestAnimationFrame(frame)
    }

    const stop = () => {
      running = false
      cancelAnimationFrame(raf)
    }

    const resize = () => {
      const w = mount.clientWidth
      const h = mount.clientHeight
      if (!w || !h) return
      renderer.setSize(w, h, false)
      uniforms.uRes.value.set(w, h)
      if (ready) renderer.render(scene, camera)
    }

    const onMove = (e) => {
      const r = mount.getBoundingClientRect()
      target.set((e.clientX - r.left) / r.width, 1 - (e.clientY - r.top) / r.height)
    }

    const onVisibility = () => (document.hidden ? stop() : start())

    const io = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting
      if (visible) start()
      else stop()
    })
    const ro = new ResizeObserver(resize)

    io.observe(mount)
    ro.observe(mount)
    window.addEventListener('pointermove', onMove, { passive: true })
    document.addEventListener('visibilitychange', onVisibility)

    if (isVideo) {
      const video = videoRef.current
      if (video) {
        const initVideoTexture = () => {
          if (disposed) return
          texture = new VideoTexture(video)
          texture.minFilter = LinearFilter
          texture.magFilter = LinearFilter
          texture.format = RGBFormat

          uniforms.uTex.value = texture
          uniforms.uTexRes.value.set(video.videoWidth || 1920, video.videoHeight || 1080)
          ready = true
          resize()
          renderer.render(scene, camera)
          mount.classList.add('is-ready')
          start()
        }

        video.play().catch(() => {})

        if (video.readyState >= 1) {
          initVideoTexture()
        } else {
          video.addEventListener('loadedmetadata', initVideoTexture, { once: true })
        }
      }
    } else {
      new TextureLoader().load(src, (tex) => {
        if (disposed) {
          tex.dispose()
          return
        }
        texture = tex
        uniforms.uTex.value = tex
        uniforms.uTexRes.value.set(tex.image.width, tex.image.height)
        ready = true
        resize()
        renderer.render(scene, camera)
        mount.classList.add('is-ready')
        start()
      })
    }

    return () => {
      disposed = true
      stop()
      io.disconnect()
      ro.disconnect()
      window.removeEventListener('pointermove', onMove)
      document.removeEventListener('visibilitychange', onVisibility)
      texture?.dispose()
      geometry.dispose()
      material.dispose()
      renderer.dispose()
      canvas.remove()
      mount.classList.remove('is-ready')
    }
  }, [src, isVideo])

  return (
    <div ref={ref} className="hero-scene">
      {isVideo && (
        <video
          ref={videoRef}
          src={src}
          autoPlay
          loop
          muted
          playsInline
          style={{
            position: 'absolute',
            width: 0,
            height: 0,
            opacity: 0,
            pointerEvents: 'none',
          }}
        />
      )}
    </div>
  )
}