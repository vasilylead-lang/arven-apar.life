<script setup>
import ResponsiveImage from './ResponsiveImage.vue'
import { COLLECTION } from '../data/site.js'

const ALTS = {
  dolomites: 'Pale limestone Dolomite towers at first light above larch forest',
  lofoten: 'A steep Norwegian fjord in winter, black granite walls dropping into dark water',
  cairngorms: 'A rounded Scottish Highland plateau at dawn with granite tors and mist in the glen',
  pyrenees: 'A Pyrenean cirque at dusk, granite walls around a dark glacial lake',
}
</script>

<template>
  <section id="collection" class="section collection panel" aria-labelledby="collection-title">
    <div class="shell">
      <header class="section__head">
        <div>
          <p class="section__marker hud">
            <span class="hud--accent">05</span>
            <span>The Collection</span>
          </p>
          <h2 id="collection-title" class="display display--l">
            Four more<br />of <em>the same idea</em>
          </h2>
        </div>
        <p class="lede">
          ARVEN is one of five holdings assembled on the same terms: a single title,
          a fixed door count, and a covenant that outlives the owner. An interest in
          one is an introduction to all of them.
        </p>
      </header>

      <ul class="collection__grid">
        <li v-for="(c, i) in COLLECTION" :key="c.id">
          <article class="reserve-card">
            <ResponsiveImage
              :name="c.image"
              :alt="ALTS[c.image]"
              :widths="[400, 600, 900]"
              sizes="(max-width: 760px) 100vw, (max-width: 1080px) 46vw, 23vw"
              ratio="4 / 3"
            />

            <p class="reserve-card__idx hud">
              <span class="hud--accent">{{ String(i + 1).padStart(2, '0') }}</span>
              <span>{{ c.status }}</span>
            </p>

            <h3 class="reserve-card__name display display--m">{{ c.name }}</h3>
            <p class="reserve-card__where">{{ c.region }}<br />{{ c.country }}</p>

            <dl class="reserve-card__facts">
              <div>
                <dt class="hud">Holding</dt>
                <dd>{{ c.hectares }}</dd>
              </div>
              <div>
                <dt class="hud">Doors</dt>
                <dd>{{ c.doors }}</dd>
              </div>
            </dl>
          </article>
        </li>
      </ul>
    </div>
  </section>
</template>

<style scoped>
.collection__grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: clamp(20px, 2.6vw, 40px);
}

.reserve-card {
  display: grid;
  gap: 12px;
  align-content: start;
}

.reserve-card__idx {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  padding-top: 16px;
  border-top: 1px solid var(--line);
}

.reserve-card__where {
  color: var(--ink-faint);
  font-size: 0.9rem;
  line-height: 1.45;
}

.reserve-card__facts {
  display: flex;
  gap: 26px;
  margin: 6px 0 0;
  padding-top: 14px;
  border-top: 1px solid var(--line);
}

.reserve-card__facts dt {
  margin-bottom: 7px;
}

.reserve-card__facts dd {
  margin: 0;
  font-family: var(--font-display);
  font-size: 1.15rem;
  line-height: 1;
  white-space: nowrap;
}

@media (max-width: 1080px) {
  .collection__grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 760px) {
  .collection__grid {
    grid-template-columns: 1fr;
  }
}
</style>
