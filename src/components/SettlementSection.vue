<script setup>
import ResponsiveImage from './ResponsiveImage.vue'
import { OFFERINGS, SITE } from '../data/site.js'

const ALTS = {
  interior:
    'A pale-oak alpine living room with a blackened steel fireplace and one large window onto snow-covered peaks',
  homesite:
    'An undeveloped alpine meadow clearing on a ridge shoulder, ringed by old stone pines, at dusk',
}
</script>

<template>
  <section id="settlement" class="section settlement panel" aria-labelledby="settlement-title">
    <div class="shell">
      <header class="section__head">
        <div>
          <p class="section__marker hud">
            <span class="hud--accent">04</span>
            <span>The Settlement</span>
          </p>
          <h2 id="settlement-title" class="display display--l">
            <!-- non-breaking hyphens: "twenty-/third" splitting across lines reads badly -->
            Twenty&#8209;two doors,<br /><em>and no twenty&#8209;third</em>
          </h2>
        </div>
        <p class="lede">
          The density was fixed before the first parcel was drawn and is written into
          the title. Eight residences at the lodge, fourteen sites on the shoulder.
          That is the whole of it, permanently.
        </p>
      </header>

      <div class="settlement__grid">
        <article v-for="o in OFFERINGS" :key="o.id" class="offer">
          <ResponsiveImage
            :name="o.image"
            :alt="ALTS[o.image]"
            :widths="[480, 720, 1080]"
            sizes="(max-width: 1080px) 100vw, 52vw"
            ratio="3 / 2"
          />

          <div class="offer__head">
            <p class="hud"><span class="hud--accent">{{ o.index }}</span> — {{ o.count }} available</p>
            <h3 class="display display--m">{{ o.name }}</h3>
            <p class="offer__price hud hud--ink">{{ o.price }}</p>
          </div>

          <p class="body-copy">{{ o.body }}</p>

          <dl class="offer__spec">
            <div v-for="[k, v] in o.spec" :key="k">
              <dt class="hud">{{ k }}</dt>
              <dd>{{ v }}</dd>
            </div>
          </dl>
        </article>
      </div>

      <p class="settlement__foot">
        <span class="hud">Held by one family since 1961</span>
        <span class="hud">{{ SITE.hectares.toLocaleString('en-US') }} ha · one title · no further subdivision</span>
      </p>
    </div>
  </section>
</template>

<style scoped>
.settlement__grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: clamp(32px, 4.5vw, 72px);
}

.offer {
  display: grid;
  gap: 20px;
  align-content: start;
}

.offer__head {
  display: grid;
  gap: 10px;
  padding-top: 22px;
  border-top: 1px solid var(--line);
}

.offer__price {
  color: var(--accent);
}

.offer__spec {
  display: grid;
  gap: 14px;
  margin: 6px 0 0;
}

.offer__spec > div {
  display: grid;
  grid-template-columns: 128px minmax(0, 1fr);
  gap: 16px;
  padding-bottom: 13px;
  border-bottom: 1px solid var(--line);
}

.offer__spec dt {
  padding-top: 4px;
}

.offer__spec dd {
  margin: 0;
  color: var(--ink);
}

.settlement__foot {
  display: flex;
  justify-content: space-between;
  gap: 20px;
  flex-wrap: wrap;
  margin-top: clamp(38px, 5vw, 70px);
  padding-top: 22px;
  border-top: 1px solid var(--line);
}

@media (max-width: 1080px) {
  .settlement__grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 760px) {
  .offer__spec > div {
    grid-template-columns: 1fr;
    gap: 6px;
  }
}
</style>
