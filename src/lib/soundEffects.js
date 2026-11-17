let audioContext

function getAudioContext() {
  const AudioContextClass = window.AudioContext || window.webkitAudioContext
  if (!AudioContextClass) return null
  if (!audioContext) audioContext = new AudioContextClass()
  if (audioContext.state === 'suspended') audioContext.resume().catch(() => {})
  return audioContext
}

function playTone(context, { frequency, endFrequency, startAt, duration, volume, type = 'sine' }) {
  const oscillator = context.createOscillator()
  const filter = context.createBiquadFilter()
  const gain = context.createGain()

  oscillator.type = type
  oscillator.frequency.setValueAtTime(frequency, startAt)
  if (endFrequency) oscillator.frequency.exponentialRampToValueAtTime(endFrequency, startAt + duration)

  filter.type = 'lowpass'
  filter.frequency.setValueAtTime(520, startAt)
  filter.frequency.exponentialRampToValueAtTime(1500, startAt + duration * 0.55)
  filter.frequency.exponentialRampToValueAtTime(420, startAt + duration)

  gain.gain.setValueAtTime(0.0001, startAt)
  gain.gain.exponentialRampToValueAtTime(volume, startAt + Math.min(0.12, duration * 0.25))
  gain.gain.exponentialRampToValueAtTime(0.0001, startAt + duration)

  oscillator.connect(filter)
  filter.connect(gain)
  gain.connect(context.destination)
  oscillator.start(startAt)
  oscillator.stop(startAt + duration + 0.02)
}

function playAirSweep(context, { startAt, duration, volume, lowpass = 1800 }) {
  const frameCount = Math.ceil(context.sampleRate * duration)
  const buffer = context.createBuffer(1, frameCount, context.sampleRate)
  const channel = buffer.getChannelData(0)

  for (let i = 0; i < frameCount; i += 1) {
    const fadeIn = Math.min(1, i / (context.sampleRate * 0.18))
    const fadeOut = Math.min(1, (frameCount - i) / (context.sampleRate * 0.3))
    channel[i] = (Math.random() * 2 - 1) * fadeIn * fadeOut
  }

  const source = context.createBufferSource()
  const filter = context.createBiquadFilter()
  const gain = context.createGain()

  source.buffer = buffer
  filter.type = 'lowpass'
  filter.frequency.setValueAtTime(260, startAt)
  filter.frequency.exponentialRampToValueAtTime(lowpass, startAt + duration * 0.58)
  filter.frequency.exponentialRampToValueAtTime(240, startAt + duration)

  gain.gain.setValueAtTime(0.0001, startAt)
  gain.gain.linearRampToValueAtTime(volume, startAt + duration * 0.42)
  gain.gain.exponentialRampToValueAtTime(0.0001, startAt + duration)

  source.connect(filter)
  filter.connect(gain)
  gain.connect(context.destination)
  source.start(startAt)
  source.stop(startAt + duration + 0.02)
}

export function playSoundEffect(kind = 'tap') {
  if (typeof window === 'undefined') return
  const context = getAudioContext()
  if (!context) return
  const now = context.currentTime

  // The intro uses restrained, filtered sweeps instead of loud synthetic beeps.
  if (kind === 'intro-start') {
    playAirSweep(context, { startAt: now, duration: 1.55, volume: 0.035, lowpass: 1250 })
    playTone(context, { frequency: 54, endFrequency: 39, startAt: now + 0.05, duration: 1.35, volume: 0.045 })
    return
  }

  if (kind === 'intro-zoom') {
    playAirSweep(context, { startAt: now, duration: 1.05, volume: 0.052, lowpass: 2100 })
    playTone(context, { frequency: 68, endFrequency: 43, startAt: now + 0.08, duration: 0.92, volume: 0.052 })
    return
  }

  if (kind === 'intro-arrive') {
    playTone(context, { frequency: 88, endFrequency: 48, startAt: now, duration: 0.62, volume: 0.075 })
    playAirSweep(context, { startAt: now + 0.04, duration: 0.48, volume: 0.018, lowpass: 900 })
    playTone(context, { frequency: 392, endFrequency: 440, startAt: now + 0.12, duration: 0.38, volume: 0.012 })
    return
  }

  if (kind === 'intro-reveal') {
    playAirSweep(context, { startAt: now, duration: 1.05, volume: 0.045, lowpass: 1600 })
    playTone(context, { frequency: 58, endFrequency: 82, startAt: now + 0.06, duration: 0.95, volume: 0.04 })
    return
  }

  if (kind === 'add') {
    playTone(context, { frequency: 520, endFrequency: 760, startAt: now, duration: 0.11, volume: 0.055 })
    playTone(context, { frequency: 780, endFrequency: 1040, startAt: now + 0.065, duration: 0.13, volume: 0.035, type: 'triangle' })
    return
  }
  if (kind === 'confirm') {
    playTone(context, { frequency: 620, endFrequency: 820, startAt: now, duration: 0.12, volume: 0.045 })
    playTone(context, { frequency: 830, endFrequency: 1120, startAt: now + 0.09, duration: 0.16, volume: 0.04, type: 'triangle' })
    return
  }
  if (kind === 'remove') {
    playTone(context, { frequency: 460, endFrequency: 260, startAt: now, duration: 0.1, volume: 0.035, type: 'triangle' })
    return
  }
  playTone(context, { frequency: 920, endFrequency: 680, startAt: now, duration: 0.045, volume: 0.022 })
}
