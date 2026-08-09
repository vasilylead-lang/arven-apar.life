<script setup>
import { onMounted, onBeforeUnmount, ref } from 'vue'
import { prefersReducedMotion } from '../composables/useReducedMotion.js'

// Pointer-only flourish. It never replaces the system cursor on touch, and it
// is skipped entirely under reduced motion.

const dot = ref(null)
const ring = ref(null)
const enabled = ref(false)

let raf = null
const target = { x: 0, y: 0 }
const pos = { x: 0, y: 0 }
let hot = false

onMounted(() => {
  const fine = window.matchMedia('(pointer: fine)').matches
  if (!fine || prefersReducedMotion.value) return
  enabled.value = true

  target.x = pos.x = window.innerWidth / 2
  target.y = pos.y = window.innerHeight / 2

  window.addEventListener('pointermove', onMove, { passive: true })
  window.addEventListener('pointerover', onOver, { passive: true })
  document.documentElement.classList.add('has-custom-cursor')
  loop()
})

onBeforeUnmount(() => {
  window.removeEventListener('pointermove', onMove)
  window.removeEventListener('pointerover', onOver)
  document.documentElement.classList.remove('has-custom-cursor')
  if (raf) cancelAnimationFrame(raf)
})

function onMove(e) {
  target.x = e.clientX
  target.y = e.clientY
}

function onOver(e) {
  hot = !!e.target.closest?.('a, button, [role="tab"], .stage.is-interactive')
}

function loop() {
  pos.x += (target.x - pos.x) * 0.19
  pos.y += (target.y - pos.y) * 0.19
  if (dot.value) dot.value.style.transform = `translate3d(${target.x}px, ${target.y}px, 0)`
  if (ring.value) {
    ring.value.style.transform = `translate3d(${pos.x}px, ${pos.y}px, 0) scale(${hot ? 1.75 : 1})`
    ring.value.dataset.hot = hot ? '1' : '0'
  }
  raf = requestAnimationFrame(loop)
}
</script>

<template>
  <div v-if="enabled" class="cursor" aria-hidden="true">
    <span ref="ring" class="cursor__ring" />
    <span ref="dot" class="cursor__dot" />
  </div>
</template>

<style>
.has-custom-cursor,
.has-custom-cursor a,
.has-custom-cursor button {
  cursor: none;
}
</style>

<style scoped>
.cursor {
  position: fixed;
  inset: 0;
  z-index: 300;
  pointer-events: none;
}

.cursor__dot,
.cursor__ring {
  position: absolute;
  top: 0;
  left: 0;
  border-radius: 50%;
  will-change: transform;
}

.cursor__dot {
  width: 5px;
  height: 5px;
  margin: -2.5px 0 0 -2.5px;
  background: var(--accent);
}

.cursor__ring {
  width: 30px;
  height: 30px;
  margin: -15px 0 0 -15px;
  border: 1px solid var(--line-strong);
  transition: border-color var(--dur) var(--ease);
}

.cursor__ring[data-hot='1'] {
  border-color: var(--accent);
}
</style>
