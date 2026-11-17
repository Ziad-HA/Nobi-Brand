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
  const gain = context.createGain()
  oscillator.type = type
  oscillator.frequency.setValueAtTime(frequency, startAt)
  if (endFrequency) oscillator.frequency.exponentialRampToValueAtTime(endFrequency, startAt + duration)
  gain.gain.setValueAtTime(0.0001, startAt)
  gain.gain.exponentialRampToValueAtTime(volume, startAt + 0.008)
  gain.gain.exponentialRampToValueAtTime(0.0001, startAt + duration)
  oscillator.connect(gain)
  gain.connect(context.destination)
  oscillator.start(startAt)
  oscillator.stop(startAt + duration + 0.015)
}

export function playSoundEffect(kind = 'tap') {
  if (typeof window === 'undefined') return
  const context = getAudioContext()
  if (!context) return
  const now = context.currentTime

  if (kind === 'intro-start') {
    playTone(context, { frequency: 95, endFrequency: 520, startAt: now, duration: 1.05, volume: 0.09, type: 'sawtooth' })
    playTone(context, { frequency: 680, endFrequency: 190, startAt: now + 0.12, duration: 0.75, volume: 0.035, type: 'triangle' })
    playTone(context, { frequency: 42, endFrequency: 85, startAt: now, duration: 1.15, volume: 0.12, type: 'sine' })
    return
  }

  if (kind === 'intro-arrive') {
    playTone(context, { frequency: 160, endFrequency: 58, startAt: now, duration: 0.42, volume: 0.12, type: 'sine' })
    playTone(context, { frequency: 440, endFrequency: 880, startAt: now + 0.04, duration: 0.32, volume: 0.055, type: 'triangle' })
    playTone(context, { frequency: 1040, endFrequency: 720, startAt: now + 0.16, duration: 0.22, volume: 0.025, type: 'sine' })
    return
  }

  if (kind === 'intro-zoom') {
    playTone(context, { frequency: 75, endFrequency: 740, startAt: now, duration: 0.85, volume: 0.105, type: 'sawtooth' })
    playTone(context, { frequency: 330, endFrequency: 990, startAt: now + 0.2, duration: 0.58, volume: 0.045, type: 'triangle' })
    playTone(context, { frequency: 48, endFrequency: 34, startAt: now + 0.55, duration: 0.55, volume: 0.08, type: 'sine' })
    return
  }

  if (kind === 'intro-reveal') {
    // Wide, soft transition whoosh as the intro gives way to the storefront.
    playTone(context, { frequency: 62, endFrequency: 210, startAt: now, duration: 0.95, volume: 0.105, type: 'sine' })
    playTone(context, { frequency: 180, endFrequency: 720, startAt: now + 0.08, duration: 0.72, volume: 0.045, type: 'triangle' })
    playTone(context, { frequency: 920, endFrequency: 420, startAt: now + 0.28, duration: 0.52, volume: 0.022, type: 'sine' })
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
