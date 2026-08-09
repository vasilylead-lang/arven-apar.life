<script setup>
import { computed } from 'vue'
import { ATMOSPHERES } from '../data/atmospheres.js'

const props = defineProps({
  modelValue: { type: String, required: true },
})
const emit = defineEmits(['update:modelValue'])

const current = computed(() => ATMOSPHERES.find((a) => a.id === props.modelValue) ?? ATMOSPHERES[0])
</script>

<template>
  <section id="atmosphere" class="section atmosphere" aria-labelledby="atmosphere-title">
    <div class="shell">
      <header class="section__head">
        <div>
          <p class="section__marker hud">
            <span class="hud--accent">02</span>
            <span>Atmosphere</span>
          </p>
          <h2 id="atmosphere-title" class="display display--l">
            The mountain is<br /><em>four mountains</em>
          </h2>
        </div>
        <p class="lede">
          The same four thousand hectares, under the four conditions that actually
          define a year here. Change the air and watch the model change with it.
        </p>
      </header>

      <div class="atmosphere__switch" role="tablist" aria-label="Atmospheric condition">
        <button
          v-for="a in ATMOSPHERES"
          :key="a.id"
          role="tab"
          class="cond"
          :class="{ 'is-on': modelValue === a.id }"
          :aria-selected="modelValue === a.id"
          @click="emit('update:modelValue', a.id)"
        >
          <span class="cond__time hud">{{ a.time }}</span>
          <span class="cond__name display display--m">{{ a.name }}</span>
          <span class="cond__bar" aria-hidden="true" />
        </button>
      </div>

      <div class="atmosphere__read" aria-live="polite">
        <p class="atmosphere__blurb body-copy">{{ current.blurb }}</p>
        <dl class="atmosphere__metrics">
          <div v-for="[k, v] in current.metrics" :key="k">
            <dt class="hud">{{ k }}</dt>
            <dd>{{ v }}</dd>
          </div>
          <div>
            <dt class="hud">Snowline</dt>
            <dd>{{ current.snowline.toLocaleString('en-US') }} m</dd>
          </div>
        </dl>
      </div>
    </div>
  </section>
</template>

<style scoped>
.atmosphere__switch {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 1px;
  background: var(--line);
  border-block: 1px solid var(--line);
}

.cond {
  position: relative;
  display: grid;
  gap: 12px;
  padding: 26px 22px 30px;
  text-align: left;
  background: rgba(10, 13, 15, 0.5);
  backdrop-filter: blur(10px);
  transition: background var(--dur) var(--ease);
}

.cond:hover {
  background: rgba(10, 13, 15, 0.78);
}

.cond__name {
  color: var(--ink-dim);
  transition: color var(--dur) var(--ease);
}

.cond.is-on .cond__name,
.cond:hover .cond__name {
  color: var(--ink);
}

.cond.is-on .cond__time {
  color: var(--accent);
}

.cond__bar {
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  height: 2px;
  background: var(--accent);
  transform: scaleX(0);
  transform-origin: 0 50%;
  transition: transform var(--dur-slow) var(--ease);
}

.cond.is-on .cond__bar {
  transform: scaleX(1);
}

.atmosphere__read {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  gap: clamp(28px, 5vw, 80px);
  align-items: start;
  padding-top: 34px;
}

.atmosphere__blurb {
  font-size: 1.1rem;
  color: var(--ink);
}

.atmosphere__metrics {
  display: flex;
  gap: clamp(22px, 3vw, 48px);
  margin: 0;
}

.atmosphere__metrics dt {
  margin-bottom: 8px;
}

.atmosphere__metrics dd {
  margin: 0;
  font-family: var(--font-display);
  font-size: 1.4rem;
  line-height: 1;
  white-space: nowrap;
}

@media (max-width: 1080px) {
  .atmosphere__switch {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .atmosphere__read {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 760px) {
  .atmosphere__metrics {
    flex-wrap: wrap;
    gap: 20px 30px;
  }
}
</style>
