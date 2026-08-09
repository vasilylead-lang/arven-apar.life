<script setup>
import { SITE } from '../data/site.js'
</script>

<template>
  <section id="hero" class="hero" aria-labelledby="hero-title">
    <div class="hero__scrim" aria-hidden="true" />

    <div class="hero__grid shell">
      <p class="hero__eyebrow hud">
        <span class="hud--accent">00</span> — Arrival
      </p>

      <h1 id="hero-title" class="hero__title display display--xl">
        In the silence of<br />
        <em>the Valais Alps</em>
      </h1>

      <div class="hero__foot">
        <p class="hero__claim lede">
          Four thousand hectares between {{ SITE.altitudeLow.toLocaleString('en-US') }} and
          {{ SITE.altitudeHigh.toLocaleString('en-US') }} metres. Twenty-two doors, and
          nothing else.
        </p>

        <dl class="hero__facts">
          <div>
            <dt class="hud">Position</dt>
            <dd>{{ SITE.coords }}</dd>
          </div>
          <div>
            <dt class="hud">Holding</dt>
            <dd>4,000 ha</dd>
          </div>
          <div>
            <dt class="hud">Residences</dt>
            <dd>{{ SITE.doors }}</dd>
          </div>
        </dl>
      </div>
    </div>

    <a class="hero__scroll hud" href="#reserve">
      <span>Scroll to survey</span>
      <span class="hero__scroll-line" aria-hidden="true" />
    </a>
  </section>
</template>

<style scoped>
.hero {
  position: relative;
  min-height: 100svh;
  display: flex;
  align-items: flex-end;
  padding-block: 128px 76px;
}

.hero__scrim {
  position: absolute;
  inset: 0;
  background: linear-gradient(
    180deg,
    rgba(10, 13, 15, 0.66) 0%,
    rgba(10, 13, 15, 0.24) 26%,
    rgba(10, 13, 15, 0.42) 52%,
    rgba(10, 13, 15, 0.9) 100%
  );
  pointer-events: none;
}

.hero__grid {
  position: relative;
  width: 100%;
}

.hero__eyebrow {
  display: flex;
  gap: 10px;
  margin-bottom: 26px;
}

.hero__title {
  margin: 0 0 clamp(34px, 5vw, 60px);
}

.hero__foot {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  gap: clamp(28px, 5vw, 80px);
  align-items: end;
  padding-top: 26px;
  border-top: 1px solid var(--line);
}

.hero__facts {
  display: flex;
  gap: clamp(24px, 3.4vw, 56px);
  margin: 0;
}

.hero__facts dt {
  margin-bottom: 8px;
}

.hero__facts dd {
  margin: 0;
  font-family: var(--font-display);
  font-size: 1.55rem;
  line-height: 1;
  white-space: nowrap;
}

.hero__scroll {
  position: absolute;
  right: var(--gutter);
  bottom: 76px;
  display: grid;
  justify-items: center;
  gap: 12px;
  writing-mode: vertical-rl;
}

.hero__scroll-line {
  width: 1px;
  height: 62px;
  background: linear-gradient(to bottom, var(--accent), transparent);
}

@media (max-width: 1080px) {
  .hero__foot {
    grid-template-columns: 1fr;
    align-items: start;
  }

  .hero__scroll {
    display: none;
  }
}

@media (max-width: 760px) {
  .hero__facts {
    flex-wrap: wrap;
    gap: 22px 32px;
  }
}
</style>
