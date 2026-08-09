<script setup>
import { onMounted, onBeforeUnmount, ref } from 'vue'
import BrandMark from './BrandMark.vue'
import { prefersReducedMotion } from '../composables/useReducedMotion.js'

// A designed page load rather than a spinner — but never a trap. The counter
// is capped, and if anything stalls the choice appears anyway.

const emit = defineEmits(['enter'])

const count = ref(0)
const ready = ref(false)
const leaving = ref(false)
const firstBtn = ref(null)

let raf = null
let hardStop = null

onMounted(() => {
  if (prefersReducedMotion.value) {
    count.value = 100
    finish()
    return
  }

  const started = performance.now()
  const DURATION = 1900

  const tick = (now) => {
    const t = Math.min(1, (now - started) / DURATION)
    // ease-out so it decelerates into 100 like a real load
    count.value = Math.round((1 - Math.pow(1 - t, 2.2)) * 100)
    if (t < 1) raf = requestAnimationFrame(tick)
    else finish()
  }
  raf = requestAnimationFrame(tick)

  // never hold the page hostage
  hardStop = setTimeout(finish, 3600)
})

function finish() {
  if (ready.value) return
  count.value = 100
  ready.value = true
  requestAnimationFrame(() => firstBtn.value?.focus())
}

function enter(withSound) {
  leaving.value = true
  emit('enter', withSound)
}

onBeforeUnmount(() => {
  if (raf) cancelAnimationFrame(raf)
  if (hardStop) clearTimeout(hardStop)
})
</script>

<template>
  <div
    class="preloader"
    :class="{ 'is-leaving': leaving }"
    role="dialog"
    aria-modal="true"
    aria-label="Enter ARVEN"
  >
    <div class="preloader__inner">
      <div class="preloader__top hud">
        <span>Val d'Hérens · Valais · CH</span>
        <span>46°06′ N · 07°30′ E</span>
      </div>

      <div class="preloader__mid">
        <BrandMark :size="72" />
        <p class="preloader__word display display--l">ARVEN</p>
      </div>

      <div class="preloader__bar" aria-hidden="true">
        <span class="preloader__fill" :style="{ transform: `scaleX(${count / 100})` }" />
      </div>

      <div class="preloader__bottom">
        <span class="hud">Surveying 4,000 hectares</span>
        <span class="hud hud--ink preloader__count">{{ String(count).padStart(3, '0') }}</span>
      </div>

      <div class="preloader__enter" :class="{ 'is-ready': ready }">
        <button ref="firstBtn" class="enter-btn" :disabled="!ready" @click="enter(true)">
          <span class="enter-btn__label">Enter with sound</span>
          <span class="enter-btn__rule" aria-hidden="true" />
        </button>
        <button class="enter-btn enter-btn--quiet" :disabled="!ready" @click="enter(false)">
          <span class="enter-btn__label">Enter silently</span>
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.preloader {
  position: fixed;
  inset: 0;
  z-index: 200;
  background: var(--bg);
  display: grid;
  place-items: center;
  transition: opacity var(--dur-slow) var(--ease);
}

.preloader.is-leaving {
  opacity: 0;
  pointer-events: none;
}

.preloader__inner {
  width: min(760px, 100% - 2 * var(--gutter));
  display: grid;
  gap: 26px;
}

.preloader__top,
.preloader__bottom {
  display: flex;
  justify-content: space-between;
  gap: 16px;
}

.preloader__mid {
  display: flex;
  align-items: center;
  gap: 26px;
  color: var(--ink);
}

.preloader__word {
  letter-spacing: 0.09em;
  margin: 0;
}

.preloader__bar {
  height: 1px;
  background: var(--line);
  overflow: hidden;
}

.preloader__fill {
  display: block;
  height: 100%;
  background: var(--accent);
  transform-origin: 0 50%;
  transform: scaleX(0);
}

.preloader__count {
  font-variant-numeric: tabular-nums;
}

.preloader__enter {
  display: flex;
  gap: 32px;
  align-items: center;
  margin-top: 18px;
  opacity: 0;
  transform: translateY(10px);
  transition:
    opacity var(--dur-slow) var(--ease),
    transform var(--dur-slow) var(--ease);
}

.preloader__enter.is-ready {
  opacity: 1;
  transform: none;
}

.enter-btn {
  font-family: var(--font-mono);
  font-size: var(--hud);
  letter-spacing: 0.19em;
  text-transform: uppercase;
  color: var(--ink);
  padding: 12px 0;
  position: relative;
}

.enter-btn[disabled] {
  cursor: default;
  color: var(--ink-faint);
}

.enter-btn__rule {
  position: absolute;
  left: 0;
  right: 0;
  bottom: 6px;
  height: 1px;
  background: var(--accent);
  transform-origin: 0 50%;
  transition: transform var(--dur) var(--ease);
}

.enter-btn:hover:not([disabled]) .enter-btn__rule {
  transform: scaleX(0.4);
}

.enter-btn--quiet {
  color: var(--ink-faint);
}

.enter-btn--quiet:hover:not([disabled]) {
  color: var(--ink);
}

@media (max-width: 760px) {
  .preloader__mid {
    gap: 16px;
  }

  .preloader__enter {
    flex-direction: column;
    align-items: flex-start;
    gap: 6px;
  }
}
</style>
