let ctx = null

function ensureCtx() {
  if (!ctx) ctx = new (window.AudioContext || window.webkitAudioContext)()
  if (ctx.state === 'suspended') ctx.resume()
  return ctx
}

// Sblocca AudioContext dopo il primo gesto utente (richiesto da Safari/Chrome mobile)
export function unlockAudio() {
  const c = ensureCtx()
  const buf = c.createBuffer(1, 1, 22050)
  const src = c.createBufferSource()
  src.buffer = buf
  src.connect(c.destination)
  src.start(0)
}

// Bip bitonale per nuovo ordine
export function playOrderBeep() {
  const c = ensureCtx()
  const now = c.currentTime
  const tone = (freq, t0, dur) => {
    const osc = c.createOscillator()
    const gain = c.createGain()
    osc.type = 'sine'
    osc.frequency.value = freq
    gain.gain.setValueAtTime(0, t0)
    gain.gain.linearRampToValueAtTime(0.28, t0 + 0.02)
    gain.gain.exponentialRampToValueAtTime(0.001, t0 + dur)
    osc.connect(gain).connect(c.destination)
    osc.start(t0)
    osc.stop(t0 + dur + 0.05)
  }
  tone(880, now, 0.18)
  tone(1320, now + 0.16, 0.22)
}
