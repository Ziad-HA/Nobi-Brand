let audioContext;

function getAudioContext() {
  const AudioContextClass = window.AudioContext || window.webkitAudioContext;
  if (!AudioContextClass) return null;

  if (!audioContext) {
    audioContext = new AudioContextClass();
  }

  if (audioContext.state === 'suspended') {
    audioContext.resume().catch(() => {});
  }

  return audioContext;
}

function playTone(context, { frequency, endFrequency, startAt, duration, volume, type = 'sine' }) {
  const oscillator = context.createOscillator();
  const gain = context.createGain();

  oscillator.type = type;
  oscillator.frequency.setValueAtTime(frequency, startAt);
  if (endFrequency) {
    oscillator.frequency.exponentialRampToValueAtTime(endFrequency, startAt + duration);
  }

  gain.gain.setValueAtTime(0.0001, startAt);
  gain.gain.exponentialRampToValueAtTime(volume, startAt + 0.008);
  gain.gain.exponentialRampToValueAtTime(0.0001, startAt + duration);

  oscillator.connect(gain);
  gain.connect(context.destination);
  oscillator.start(startAt);
  oscillator.stop(startAt + duration + 0.015);
}

export function playSoundEffect(kind = 'tap') {
  if (typeof window === 'undefined') return;

  const context = getAudioContext();
  if (!context) return;

  const now = context.currentTime;

  if (kind === 'add') {
    playTone(context, {
      frequency: 520,
      endFrequency: 760,
      startAt: now,
      duration: 0.11,
      volume: 0.055,
      type: 'sine',
    });
    playTone(context, {
      frequency: 780,
      endFrequency: 1040,
      startAt: now + 0.065,
      duration: 0.13,
      volume: 0.035,
      type: 'triangle',
    });
    return;
  }

  if (kind === 'confirm') {
    playTone(context, {
      frequency: 620,
      endFrequency: 820,
      startAt: now,
      duration: 0.12,
      volume: 0.045,
    });
    playTone(context, {
      frequency: 830,
      endFrequency: 1120,
      startAt: now + 0.09,
      duration: 0.16,
      volume: 0.04,
      type: 'triangle',
    });
    return;
  }

  if (kind === 'remove') {
    playTone(context, {
      frequency: 460,
      endFrequency: 260,
      startAt: now,
      duration: 0.1,
      volume: 0.035,
      type: 'triangle',
    });
    return;
  }

  playTone(context, {
    frequency: 920,
    endFrequency: 680,
    startAt: now,
    duration: 0.045,
    volume: 0.022,
    type: 'sine',
  });
}
