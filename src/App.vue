<script setup>
import { onMounted, onBeforeUnmount, ref, shallowRef, watch } from 'vue'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { SplitText } from 'gsap/SplitText'
import Lenis from 'lenis'

import ThePreloader from './components/ThePreloader.vue'
import SiteHeader from './components/SiteHeader.vue'
import MobileMenu from './components/MobileMenu.vue'
import TerrainCanvas from './components/TerrainCanvas.vue'
import HeroSection from './components/HeroSection.vue'
import ReserveSection from './components/ReserveSection.vue'
import AtmosphereSection from './components/AtmosphereSection.vue'
import ColonySection from './components/ColonySection.vue'
import SettlementSection from './components/SettlementSection.vue'
import CollectionSection from './components/CollectionSection.vue'
import EnquireSection from './components/EnquireSection.vue'
import SiteFooter from './components/SiteFooter.vue'
import CustomCursor from './components/CustomCursor.vue'

import { prefersReducedMotion } from './composables/useReducedMotion.js'
import { enableSound, disableSound, soundOn, setWindCharacter } from './composables/useWind.js'
import { DEFAULT_ATMOSPHERE, ATMOSPHERES } from './data/atmospheres.js'

gsap.registerPlugin(ScrollTrigger, SplitText)

// Pose index per section — must line up with POSES in src/three/scene.js.
const SECTION_ORDER = [
  'hero',
  'reserve',
  'atmosphere',
  'colony',
  'settlement',
  'collection',
  'enquire',
]

const entered = ref(false)
const atmosphere = ref(DEFAULT_ATMOSPHERE)
const activeLocation = ref('')
const activeSection = ref('hero')
const mapLive = ref(false)
const menuOpen = ref(false)

const scene = shallowRef(null)
let lenis = null
let io = null
let revealIo = null
const triggers = []

function onSceneReady(api) {
  scene.value = api
  api.applyAtmosphere(atmosphere.value, { immediate: true })
  buildScrollTriggers()
}

function buildScrollTriggers() {
  if (!scene.value) return

  SECTION_ORDER.forEach((id, i) => {
    if (i === 0) return
    const el = document.getElementById(id)
    if (!el) return
    triggers.push(
      ScrollTrigger.create({
        trigger: el,
        start: 'top bottom',
        end: 'top top',
        scrub: prefersReducedMotion.value ? false : 0.6,
        // Under reduced motion the camera snaps between poses on entry rather
        // than tracking scroll — scroll-linked movement is still movement.
        onUpdate: (self) => {
          if (prefersReducedMotion.value) return
          scene.value?.setPoseBlend(i - 1, i, self.progress)
        },
        onEnter: () => {
          if (prefersReducedMotion.value) scene.value?.setPoseBlend(i, i, 1)
        },
        onEnterBack: () => {
          if (prefersReducedMotion.value) scene.value?.setPoseBlend(i - 1, i - 1, 1)
        },
      }),
    )
  })

  ScrollTrigger.refresh()
}

function onEnter(withSound) {
  entered.value = true
  document.body.classList.remove('is-locked')
  if (withSound) enableSound()

  if (prefersReducedMotion.value) return

  // hero headline resolves per line, then per character
  const title = document.querySelector('#hero-title')
  if (title) {
    const split = new SplitText(title, { type: 'lines,chars', linesClass: 'split-line' })
    gsap.from(split.chars, {
      yPercent: 118,
      opacity: 0,
      duration: 1.1,
      ease: 'power4.out',
      stagger: { each: 0.014, from: 'start' },
      delay: 0.15,
    })
  }

  gsap.from('.hero__eyebrow, .hero__foot, .hero__scroll', {
    opacity: 0,
    y: 18,
    duration: 0.9,
    ease: 'power3.out',
    stagger: 0.09,
    delay: 0.5,
  })
}

function toggleSound() {
  soundOn.value ? disableSound() : enableSound()
}

function selectLocation(id) {
  activeLocation.value = id
  scene.value?.focusLocation(id)
}

function clearLocation() {
  activeLocation.value = ''
  scene.value?.clearFocus()
}

// The overlay covers the viewport and scrolls itself, so locking the body is
// enough. Stopping Lenis here would also swallow the anchor scroll fired by
// the menu link on the very same click.
watch(menuOpen, (open) => {
  document.body.classList.toggle('is-locked', open)
})

watch(atmosphere, (id) => {
  scene.value?.applyAtmosphere(id)
  const a = ATMOSPHERES.find((x) => x.id === id)
  if (!a) return
  setWindCharacter({
    gust: a.id === 'foehn' ? 0.22 : a.id === 'whiteout' ? 0.14 : 0.05,
    centre: a.id === 'foehn' ? 720 : a.id === 'nachtblau' ? 300 : 460,
    level: a.id === 'whiteout' ? 0.13 : a.id === 'nachtblau' ? 0.05 : 0.085,
  })
})

onMounted(() => {
  document.body.classList.add('is-locked')

  if (!prefersReducedMotion.value) {
    // `anchors` lets Lenis own in-page navigation. Without it the nav links and
    // the skip-to-content link fight the smooth-scroll loop and never arrive.
    // Passing a duration flips those jumps to time-based easing — at the
    // reading lerp a full-page jump crawls for ten seconds.
    lenis = new Lenis({
      lerp: 0.085,
      wheelMultiplier: 0.92,
      // No `offset` here — Lenis already honours the sections'
      // `scroll-margin-top`, and setting both lands you 88px too high.
      anchors: { duration: 1.05 },
    })
    lenis.on('scroll', ScrollTrigger.update)
    gsap.ticker.add(lenisRaf)
    gsap.ticker.lagSmoothing(0)
  }

  // which section the header should highlight, and when the map goes live
  io = new IntersectionObserver(
    (entries) => {
      entries.forEach((e) => {
        if (!e.isIntersecting) return
        activeSection.value = e.target.id
        mapLive.value = e.target.id === 'reserve'
        if (e.target.id !== 'reserve' && activeLocation.value) clearLocation()
      })
    },
    { rootMargin: '-45% 0px -45% 0px' },
  )
  SECTION_ORDER.forEach((id) => {
    const el = document.getElementById(id)
    if (el) io.observe(el)
  })

  revealIo = new IntersectionObserver(
    (entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) {
          e.target.classList.add('is-revealed')
          revealIo.unobserve(e.target)
        }
      })
    },
    { rootMargin: '0px 0px -12% 0px' },
  )
  // Reveal the inner container, never the <section> itself: a transform on the
  // section moves its own box, which throws off anchor scrolling by exactly the
  // reveal offset.
  document.querySelectorAll('.section > .shell').forEach((el) => {
    el.classList.add('reveal')
    revealIo.observe(el)
  })

  window.addEventListener('resize', onResize)
})

function lenisRaf(time) {
  lenis?.raf(time * 1000)
}

function onResize() {
  ScrollTrigger.refresh()
}

onBeforeUnmount(() => {
  io?.disconnect()
  revealIo?.disconnect()
  triggers.forEach((t) => t.kill())
  gsap.ticker.remove(lenisRaf)
  lenis?.destroy()
  window.removeEventListener('resize', onResize)
})
</script>

<template>
  <ThePreloader v-if="!entered" @enter="onEnter" />

  <TerrainCanvas
    :active="activeLocation"
    :interactive="mapLive"
    @ready="onSceneReady"
    @select="selectLocation"
  />

  <SiteHeader
    :active-section="activeSection"
    :menu-open="menuOpen"
    @toggle-sound="toggleSound"
    @toggle-menu="menuOpen = !menuOpen"
  />

  <MobileMenu id="site-menu" :open="menuOpen" @close="menuOpen = false" />

  <main id="main" class="page">
    <HeroSection />
    <ReserveSection :active="activeLocation" @select="selectLocation" @clear="clearLocation" />
    <AtmosphereSection v-model="atmosphere" />
    <ColonySection />
    <SettlementSection />
    <CollectionSection />
    <EnquireSection />
  </main>

  <SiteFooter />
  <CustomCursor />
</template>

<style>
body.is-locked {
  overflow: hidden;
}

.page {
  position: relative;
  z-index: 1;
}

/* Sections that carry long-form reading get a panel so the model behind them
   never fights the text; the first half of the page stays open to the scene. */
.panel {
  background: rgba(10, 13, 15, 0.88);
  backdrop-filter: blur(18px);
  border-top: 1px solid var(--line);
}

.split-line {
  overflow: hidden;
}
</style>
