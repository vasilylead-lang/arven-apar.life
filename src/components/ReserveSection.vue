<script setup>
import { LOCATIONS } from '../data/site.js'

defineProps({
  active: { type: String, default: '' },
})
const emit = defineEmits(['select', 'clear'])

const current = (id) => LOCATIONS.find((l) => l.id === id)
</script>

<template>
  <section id="reserve" class="section reserve" aria-labelledby="reserve-title">
    <div class="shell">
      <header class="section__head">
        <div>
          <p class="section__marker hud">
            <span class="hud--accent">01</span>
            <span>The Reserve</span>
          </p>
          <h2 id="reserve-title" class="display display--l">
            Six places<br />worth naming
          </h2>
        </div>
        <p class="lede">
          The model turns. Drag it, or take one of the six below and the camera will
          go there. Everything inside the boundary is held in a single title and will
          not be subdivided further.
        </p>
      </header>

      <div class="reserve__body">
        <ol class="reserve__list">
          <li v-for="loc in LOCATIONS" :key="loc.id">
            <button
              class="place"
              :class="{ 'is-active': active === loc.id }"
              :aria-expanded="active === loc.id"
              @click="active === loc.id ? emit('clear') : emit('select', loc.id)"
            >
              <span class="place__row">
                <span class="place__name display display--m">{{ loc.name }}</span>
                <span class="place__alt hud">{{ loc.altitude }} m</span>
              </span>
              <span class="place__kind hud">{{ loc.kind }}</span>
            </button>
          </li>
        </ol>

        <aside class="reserve__note" :class="{ 'is-on': active }">
          <template v-if="active">
            <p class="hud hud--accent">{{ current(active)?.kind }}</p>
            <p class="body-copy reserve__note-text">{{ current(active)?.note }}</p>
            <button class="reserve__clear hud" @click="emit('clear')">
              Release the camera
            </button>
          </template>
          <p v-else class="hud">Select a place to fly the survey camera to it</p>
        </aside>
      </div>
    </div>
  </section>
</template>

<style scoped>
.reserve__body {
  display: grid;
  grid-template-columns: minmax(0, 1.35fr) minmax(0, 1fr);
  gap: clamp(28px, 5vw, 84px);
  align-items: start;
}

.reserve__list {
  counter-reset: place;
  border-top: 1px solid var(--line);
}

.reserve__list li {
  border-bottom: 1px solid var(--line);
}

.place {
  display: grid;
  gap: 8px;
  width: 100%;
  padding: 20px 0;
  text-align: left;
  transition: padding var(--dur) var(--ease);
}

.place:hover,
.place.is-active {
  padding-inline-start: 14px;
}

.place__row {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 18px;
}

.place__name {
  color: var(--ink-dim);
  transition: color var(--dur) var(--ease);
}

.place:hover .place__name,
.place.is-active .place__name {
  color: var(--ink);
}

.place.is-active .place__alt {
  color: var(--accent);
}

.reserve__note {
  position: sticky;
  top: 120px;
  padding: 26px;
  border: 1px solid var(--line);
  background: rgba(10, 13, 15, 0.66);
  backdrop-filter: blur(14px);
  min-height: 190px;
  display: grid;
  align-content: start;
  gap: 16px;
}

.reserve__note-text {
  color: var(--ink);
}

.reserve__clear {
  justify-self: start;
  color: var(--ink-faint);
  border-bottom: 1px solid var(--line);
  padding-bottom: 4px;
  transition: color var(--dur) var(--ease);
}

.reserve__clear:hover {
  color: var(--ink);
}

@media (max-width: 1080px) {
  .reserve__body {
    grid-template-columns: 1fr;
  }

  .reserve__note {
    position: static;
    min-height: 0;
  }
}
</style>
