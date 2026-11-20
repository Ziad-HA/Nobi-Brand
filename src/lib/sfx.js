import { useSyncExternalStore } from 'react'

/* =====================================================================
   SOUND EFFECTS - this is the one place to wire them up.

   1. Drop your audio files into  public/sfx/   (mp3, ogg or wav all work)
   2. Put each file's name next to the event below (volume is 0 to 1)
   3. Done. Until a file exists, that event is simply silent.

   Where each event fires:
     hover        - mouse enters a product card or lookbook photo
     click        - a card / photo link is pressed
     orbitSpin    - lookbook photos start spinning (on the way in and on the way out)
     orbitSettle  - lookbook photos lock into place

   Sound is ON by default. Browsers may block playback until the visitor interacts
   with the page, after which supported effects can play normally.

   To trigger a sound from anywhere else:  import { sfx } from '../lib/sfx'
                                           sfx.play('hover')
   ===================================================================== */
export const SOUNDS = {
  hover: { file: 'hover.mp3', volume: 0.35 },
  click: { file: 'click.mp3', volume: 0.5 },
  orbitSpin: { file: 'orbit-spin.mp3', volume: 0.5 },
}

const MIN_GAP_MS = 90 // stops a sound from machine-gunning when the cursor jitters

const listeners = new Set()
const loaded = {} // name -> HTMLAudioElement
const missing = new Set() // names whose file failed to load, so we stop trying
const lastPlayed = {}

// Sound and interface effects are enabled by default.
// Browsers may block audio until the visitor's first interaction.
let enabled = true

function emit() {
  listeners.forEach((fn) => fn())
}

function load(name) {
  if (loaded[name] || missing.has(name)) return loaded[name]
  const def = SOUNDS[name]
  if (!def || typeof Audio === 'undefined') return undefined
  const audio = new Audio(`${import.meta.env.BASE_URL}sfx/${def.file}`)
  audio.preload = 'auto'
  audio.addEventListener('error', () => missing.add(name), { once: true })
  loaded[name] = audio
  return audio
}

export const sfx = {
  isEnabled: () => enabled,

  setEnabled(next) {
    enabled = Boolean(next)
    try {
    } catch {
      /* ignore */
    }
    if (enabled) Object.keys(SOUNDS).forEach(load)
    emit()
    if (enabled) sfx.play('click')
  },

  toggle() {
    sfx.setEnabled(!enabled)
  },

  play(name) {
    if (!enabled) return
    const now = performance.now()
    if (now - (lastPlayed[name] || 0) < MIN_GAP_MS) return
    lastPlayed[name] = now

    const base = load(name)
    if (!base || missing.has(name)) return
    // A fresh copy per play so quick repeats overlap instead of cutting each other off.
    const node = base.cloneNode()
    node.volume = SOUNDS[name].volume
    node.play().catch(() => {
      /* blocked until the first click/tap, or file missing - both fine */
    })
  },

  subscribe(fn) {
    listeners.add(fn)
    return () => listeners.delete(fn)
  },
}

// Warm the files up on page load if the visitor left sound on last time.
if (enabled && typeof window !== 'undefined') Object.keys(SOUNDS).forEach(load)

export function useSoundEnabled() {
  return useSyncExternalStore(sfx.subscribe, sfx.isEnabled, () => false)
}
