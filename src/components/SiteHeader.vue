<script setup>
import BrandMark from './BrandMark.vue'
import { SECTIONS } from '../data/site.js'
import { soundOn } from '../composables/useWind.js'

defineProps({
  activeSection: { type: String, default: '' },
  menuOpen: { type: Boolean, default: false },
})
defineEmits(['toggle-sound', 'toggle-menu'])
</script>

<template>
  <header class="masthead">
    <a class="skip" href="#main">Skip to content</a>

    <a class="masthead__brand" href="#hero" aria-label="ARVEN, back to the top">
      <BrandMark :size="30" />
      <span class="masthead__word">ARVEN</span>
    </a>

    <nav class="masthead__nav" aria-label="Sections">
      <ul>
        <li v-for="s in SECTIONS" :key="s.id">
          <a :href="`#${s.id}`" class="hud" :class="{ 'is-active': activeSection === s.id }">
            <span class="masthead__idx">{{ s.index }}</span>
            {{ s.label }}
          </a>
        </li>
      </ul>
    </nav>

    <div class="masthead__right">
      <button
        class="sound"
        :aria-pressed="soundOn"
        @click="$emit('toggle-sound')"
      >
        <span class="sound__bars" :class="{ 'is-on': soundOn }" aria-hidden="true">
          <i /><i /><i /><i />
        </span>
        <span class="hud">{{ soundOn ? 'Sound on' : 'Sound off' }}</span>
      </button>

      <a class="enquire-link hud hud--ink" href="#enquire">
        Enquire
        <span class="enquire-link__dot" aria-hidden="true" />
      </a>

      <button
        class="burger"
        :aria-expanded="menuOpen"
        aria-controls="site-menu"
        @click="$emit('toggle-menu')"
      >
        <span class="burger__bars" :class="{ 'is-open': menuOpen }" aria-hidden="true">
          <i /><i />
        </span>
        <span class="sr-only">{{ menuOpen ? 'Close menu' : 'Open menu' }}</span>
      </button>
    </div>
  </header>
</template>

<style scoped>
.masthead {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 60;
  display: grid;
  grid-template-columns: auto 1fr auto;
  align-items: center;
  gap: 28px;
  padding: 22px var(--gutter);
}

/* The masthead floats over photography and over the model, both of which can
   go bright. A top scrim keeps the nav readable without boxing it in. */
.masthead::before {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(
    180deg,
    rgba(10, 13, 15, 0.92) 0%,
    rgba(10, 13, 15, 0.66) 52%,
    rgba(10, 13, 15, 0) 100%
  );
  pointer-events: none;
  z-index: -1;
}

.skip {
  position: absolute;
  left: var(--gutter);
  top: 12px;
  padding: 8px 14px;
  background: var(--accent);
  color: var(--bg);
  font-family: var(--font-mono);
  font-size: var(--hud);
  text-transform: uppercase;
  letter-spacing: 0.16em;
  transform: translateY(-160%);
  transition: transform var(--dur) var(--ease);
}

.skip:focus-visible {
  transform: none;
}

.masthead__brand {
  display: flex;
  align-items: center;
  gap: 12px;
  color: var(--ink);
}

.masthead__word {
  font-family: var(--font-display);
  font-size: 1.4rem;
  letter-spacing: 0.16em;
  line-height: 1;
}

.masthead__nav ul {
  display: flex;
  justify-content: center;
  gap: clamp(14px, 2vw, 30px);
}

.masthead__nav a {
  display: flex;
  align-items: baseline;
  gap: 7px;
  padding: 6px 0;
  transition: color var(--dur) var(--ease);
}

.masthead__nav a:hover,
.masthead__nav a.is-active {
  color: var(--ink);
}

.masthead__idx {
  color: var(--accent);
}

.masthead__right {
  display: flex;
  align-items: center;
  gap: 26px;
}

.sound {
  display: flex;
  align-items: center;
  gap: 9px;
  color: var(--ink-faint);
  transition: color var(--dur) var(--ease);
}

.sound:hover {
  color: var(--ink);
}

.sound__bars {
  display: flex;
  align-items: flex-end;
  gap: 2px;
  height: 12px;
}

.sound__bars i {
  width: 2px;
  height: 3px;
  background: currentColor;
  transition: height var(--dur) var(--ease);
}

.sound__bars.is-on {
  color: var(--accent);
}

.sound__bars.is-on i {
  animation: eq 1.1s ease-in-out infinite;
}

.sound__bars.is-on i:nth-child(2) {
  animation-delay: 0.16s;
}
.sound__bars.is-on i:nth-child(3) {
  animation-delay: 0.32s;
}
.sound__bars.is-on i:nth-child(4) {
  animation-delay: 0.48s;
}

@keyframes eq {
  0%,
  100% {
    height: 3px;
  }
  50% {
    height: 12px;
  }
}

.enquire-link {
  display: flex;
  align-items: center;
  gap: 8px;
}

.enquire-link__dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: var(--accent);
  transition: transform var(--dur) var(--ease);
}

.enquire-link:hover .enquire-link__dot {
  transform: scale(1.9);
}

.burger {
  display: none;
  align-items: center;
  justify-content: center;
  width: 30px;
  height: 22px;
  color: var(--ink);
}

.burger__bars {
  display: grid;
  gap: 6px;
  width: 26px;
}

.burger__bars i {
  display: block;
  height: 1px;
  background: currentColor;
  transition: transform var(--dur) var(--ease);
}

.burger__bars.is-open i:first-child {
  transform: translateY(3.5px) rotate(45deg);
}

.burger__bars.is-open i:last-child {
  transform: translateY(-3.5px) rotate(-45deg);
}

.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip-path: inset(50%);
  white-space: nowrap;
}

@media (max-width: 1080px) {
  .masthead__nav {
    display: none;
  }

  .masthead {
    grid-template-columns: auto 1fr;
  }

  .masthead__right {
    justify-content: flex-end;
  }

  .burger {
    display: inline-flex;
  }
}

@media (max-width: 760px) {
  .sound .hud {
    display: none;
  }
}
</style>
