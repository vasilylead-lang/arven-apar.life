import { ref } from 'vue'

// Ambient föhn, synthesised rather than streamed: brown noise through a
// slowly-swept bandpass. No audio file to download, and the gust rate can be
// driven from whichever atmosphere is selected.

export const soundOn = ref(false)

let ctx = null
let master = null
let filter = null
let lfo = null
let lfoGain = null
let source = null

function brownNoiseBuffer(audioCtx) {
  const len = audioCtx.sampleRate * 4
  const buffer = audioCtx.createBuffer(1, len, audioCtx.sampleRate)
  const data = buffer.getChannelData(0)
  let last = 0
  for (let i = 0; i < len; i++) {
    const white = Math.random() * 2 - 1
    last = (last + 0.021 * white) / 1.021
    data[i] = last * 3.2
  }
  return buffer
}

function build() {
  const AudioCtx = window.AudioContext || window.webkitAudioContext
  if (!AudioCtx) return false

  ctx = new AudioCtx()
  source = ctx.createBufferSource()
  source.buffer = brownNoiseBuffer(ctx)
  source.loop = true

  filter = ctx.createBiquadFilter()
  filter.type = 'bandpass'
  filter.frequency.value = 460
  filter.Q.value = 0.7

  // slow gusting
  lfo = ctx.createOscillator()
  lfo.frequency.value = 0.06
  lfoGain = ctx.createGain()
  lfoGain.gain.value = 240
  lfo.connect(lfoGain).connect(filter.frequency)

  master = ctx.createGain()
  master.gain.value = 0

  source.connect(filter).connect(master).connect(ctx.destination)
  source.start()
  lfo.start()
  return true
}

export async function enableSound() {
  if (!ctx && !build()) return false
  if (ctx.state === 'suspended') await ctx.resume()
  master.gain.cancelScheduledValues(ctx.currentTime)
  master.gain.setTargetAtTime(0.085, ctx.currentTime, 1.4)
  soundOn.value = true
  return true
}

export function disableSound() {
  if (!ctx) {
    soundOn.value = false
    return
  }
  master.gain.cancelScheduledValues(ctx.currentTime)
  master.gain.setTargetAtTime(0, ctx.currentTime, 0.5)
  soundOn.value = false
}

export function toggleSound() {
  return soundOn.value ? (disableSound(), false) : enableSound()
}

/** Match the wind to the selected atmosphere. */
export function setWindCharacter({ gust = 0.06, centre = 460, level = 0.085 } = {}) {
  if (!ctx || !soundOn.value) return
  const t = ctx.currentTime
  lfo.frequency.setTargetAtTime(gust, t, 1.2)
  filter.frequency.setTargetAtTime(centre, t, 1.2)
  master.gain.setTargetAtTime(level, t, 1.2)
}
