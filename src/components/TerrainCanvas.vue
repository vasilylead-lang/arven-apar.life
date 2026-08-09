<script setup>
import { onMounted, onBeforeUnmount, ref, shallowRef } from 'vue'
import { LOCATIONS } from '../data/site.js'
import { prefersReducedMotion } from '../composables/useReducedMotion.js'

// The reserve, as a lit scale model. The canvas is decorative to assistive
// tech — everything it shows is also in the DOM, in the sections behind it.

const props = defineProps({
  active: { type: String, default: '' },
  interactive: { type: Boolean, default: false },
})
const emit = defineEmits(['ready', 'select', 'failed'])

const canvas = ref(null)
const root = ref(null)
const scene = shallowRef(null)
const markers = ref(LOCATIONS.map((l) => ({ id: l.id, x: 0, y: 0, visible: false })))
const failed = ref(false)

let drag = null
let ro = null

onMounted(async () => {
  let createScene
  try {
    ;({ createScene } = await import('../three/scene.js'))
    // the dynamic import yields a tick; the component may be gone by now
    if (!canvas.value) return
    scene.value = createScene({
      canvas: canvas.value,
      reducedMotion: prefersReducedMotion.value,
    })
  } catch (err) {
    // No WebGL, or the context was refused. The page still reads fine.
    console.warn('[arven] 3D scene unavailable:', err)
    failed.value = true
    emit('failed')
    return
  }

  // dev-only handle for inspecting the scene from the console; stripped in prod
  if (import.meta.env.DEV) window.__arven = scene.value

  scene.value.onHotspots((list) => {
    markers.value = list
  })
  scene.value.start()
  emit('ready', scene.value)

  ro = new ResizeObserver(() => scene.value?.resize())
  ro.observe(root.value)

  window.addEventListener('pointermove', onPointerMove, { passive: true })
  document.addEventListener('visibilitychange', onVisibility)
})

onBeforeUnmount(() => {
  ro?.disconnect()
  window.removeEventListener('pointermove', onPointerMove)
  document.removeEventListener('visibilitychange', onVisibility)
  scene.value?.dispose()
})

function onVisibility() {
  if (!scene.value) return
  if (document.hidden) scene.value.stop()
  else scene.value.start()
}

function onPointerMove(e) {
  if (!scene.value) return
  scene.value.setPointer((e.clientX / window.innerWidth) * 2 - 1, (e.clientY / window.innerHeight) * 2 - 1)
}

function onDragStart(e) {
  if (!props.interactive || !scene.value) return
  drag = { x: e.clientX, y: e.clientY, az: 0, el: 0 }
  root.value.setPointerCapture?.(e.pointerId)
}

function onDrag(e) {
  if (!drag || !scene.value) return
  const dx = (e.clientX - drag.x) / window.innerWidth
  const dy = (e.clientY - drag.y) / window.innerHeight
  scene.value.setOrbit(drag.az - dx * 2.2, drag.el - dy * 1.1)
}

function onDragEnd(e) {
  drag = null
  root.value?.releasePointerCapture?.(e.pointerId)
}

function markerFor(id) {
  return markers.value.find((m) => m.id === id) || { x: 0, y: 0, visible: false }
}

function label(id) {
  return LOCATIONS.find((l) => l.id === id)
}

defineExpose({ scene })
</script>

<template>
  <div
    ref="root"
    class="stage"
    :class="{ 'is-interactive': interactive, 'is-failed': failed }"
    @pointerdown="onDragStart"
    @pointermove="onDrag"
    @pointerup="onDragEnd"
    @pointercancel="onDragEnd"
  >
    <canvas ref="canvas" class="stage__canvas" aria-hidden="true" />

    <div class="stage__pins" :class="{ 'is-on': interactive }" aria-hidden="true">
      <button
        v-for="loc in LOCATIONS"
        :key="loc.id"
        class="pin"
        :class="{ 'is-visible': markerFor(loc.id).visible, 'is-active': active === loc.id }"
        :style="{ transform: `translate3d(${markerFor(loc.id).x}px, ${markerFor(loc.id).y}px, 0)` }"
        tabindex="-1"
        @click="emit('select', loc.id)"
      >
        <span class="pin__dot" />
        <span class="pin__meta">
          <span class="pin__name">{{ loc.name }}</span>
          <span class="pin__alt hud">{{ loc.altitude }} m</span>
        </span>
      </button>
    </div>
  </div>
</template>

<style scoped>
.stage {
  position: fixed;
  inset: 0;
  z-index: 0;
  background: var(--bg);
  touch-action: pan-y;
}

.stage.is-interactive {
  cursor: grab;
}

.stage.is-interactive:active {
  cursor: grabbing;
}

.stage__canvas {
  width: 100%;
  height: 100%;
  display: block;
}

/* If WebGL is unavailable the page falls back to the still alpine plate, so
   the first screen still carries an image rather than an empty gradient. */
.stage.is-failed {
  background:
    linear-gradient(180deg, rgba(10, 13, 15, 0.35) 0%, rgba(10, 13, 15, 0.92) 88%),
    image-set(
        url('/images/hero-1280.avif') type('image/avif'),
        url('/images/hero-1280.webp') type('image/webp'),
        url('/images/hero-1280.jpg') type('image/jpeg')
      )
      center / cover no-repeat,
    linear-gradient(180deg, #0d141c 0%, var(--bg) 70%);
}

/* Fixed and above `.page` (z-index 1): otherwise the reading scrim on the
   open sections sits on top of the pins and the map looks inert. They are
   only ever shown while the reserve section is in view. */
.stage__pins {
  position: fixed;
  inset: 0;
  z-index: 3;
  opacity: 0;
  transition: opacity var(--dur-slow) var(--ease);
  pointer-events: none;
}

.stage__pins.is-on {
  opacity: 1;
  pointer-events: auto;
}

.pin {
  position: absolute;
  top: 0;
  left: 0;
  display: flex;
  align-items: center;
  gap: 10px;
  margin: -7px 0 0 -7px;
  opacity: 0;
  transition: opacity var(--dur) var(--ease);
  pointer-events: none;
  will-change: transform;
}

.pin.is-visible {
  opacity: 1;
  pointer-events: auto;
}

.pin__dot {
  position: relative;
  width: 14px;
  height: 14px;
  flex: none;
  border: 1px solid var(--ink);
  border-radius: 50%;
  transition:
    background var(--dur) var(--ease),
    border-color var(--dur) var(--ease);
}

.pin__dot::after {
  content: '';
  position: absolute;
  inset: 4px;
  background: var(--ink);
  border-radius: 50%;
  opacity: 0;
  transition: opacity var(--dur) var(--ease);
}

.pin:hover .pin__dot,
.pin.is-active .pin__dot {
  border-color: var(--accent);
}

.pin:hover .pin__dot::after,
.pin.is-active .pin__dot::after {
  background: var(--accent);
  opacity: 1;
}

.pin__meta {
  display: grid;
  gap: 3px;
  text-align: left;
  white-space: nowrap;
  transform: translateX(-4px);
  opacity: 0.72;
  transition:
    opacity var(--dur) var(--ease),
    transform var(--dur) var(--ease);
}

.pin:hover .pin__meta,
.pin.is-active .pin__meta {
  opacity: 1;
  transform: none;
}

.pin__name {
  font-family: var(--font-display);
  font-size: 1.05rem;
  line-height: 1;
  color: var(--ink);
}

@media (max-width: 760px) {
  .pin__meta {
    display: none;
  }
}
</style>
