<script setup>
import ResponsiveImage from './ResponsiveImage.vue'
import { BIRDS } from '../data/site.js'

const ALTS = {
  nutcracker:
    'A spotted nutcracker on an arolla pine branch, a pine seed held crosswise in its bill',
  lammergeier: 'A bearded vulture seen from above, banking over a grey alpine scree slope',
  chough: 'Two alpine choughs with yellow bills and red legs on a snow-covered rock ridge',
  eagle: 'A golden eagle soaring on a thermal above a dark forested valley',
}
</script>

<template>
  <section id="colony" class="section colony" aria-labelledby="colony-title">
    <div class="shell">
      <header class="section__head">
        <div>
          <p class="section__marker hud">
            <span class="hud--accent">03</span>
            <span>The Colony</span>
          </p>
          <h2 id="colony-title" class="display display--l">
            The forest was<br />planted by <em>a bird</em>
          </h2>
        </div>
        <p class="lede">
          Four species make the reserve legible. One of them built it — the arolla
          woodland here exists because a corvid buried more seeds than it could
          remember.
        </p>
      </header>

      <ul class="colony__grid">
        <li v-for="(b, i) in BIRDS" :key="b.id" class="bird">
          <ResponsiveImage
            :name="b.image"
            :alt="ALTS[b.image]"
            :widths="[480, 720, 1080]"
            sizes="(max-width: 760px) 100vw, 46vw"
            ratio="3 / 2"
            focus="50% 45%"
          />

          <div class="bird__body">
            <p class="bird__idx hud">
              <span class="hud--accent">{{ String(i + 1).padStart(2, '0') }}</span>
              / {{ String(BIRDS.length).padStart(2, '0') }}
            </p>

            <h3 class="bird__name display display--m">{{ b.name }}</h3>
            <p class="bird__latin">
              <em>{{ b.latin }}</em> · {{ b.french }}
            </p>

            <p class="bird__stat">
              <span class="bird__stat-value display">{{ b.stat }}</span>
              <span class="hud">{{ b.statLabel }}</span>
            </p>

            <p class="body-copy">{{ b.body }}</p>
          </div>
        </li>
      </ul>
    </div>
  </section>
</template>

<style scoped>
.colony__grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: clamp(34px, 5vw, 76px) clamp(24px, 4vw, 64px);
}

.bird__body {
  display: grid;
  gap: 12px;
  padding-top: 22px;
}

.bird__idx {
  display: flex;
  gap: 5px;
}

.bird__latin {
  color: var(--ink-faint);
  font-size: 0.9rem;
}

.bird__stat {
  display: flex;
  align-items: baseline;
  gap: 14px;
  padding: 14px 0;
  border-block: 1px solid var(--line);
  margin: 4px 0;
}

.bird__stat-value {
  font-size: clamp(2rem, 3.4vw, 3rem);
  line-height: 1;
  color: var(--accent);
}

@media (max-width: 760px) {
  .colony__grid {
    grid-template-columns: 1fr;
  }
}
</style>
