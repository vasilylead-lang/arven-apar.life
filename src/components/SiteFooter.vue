<script setup>
import BrandMark from './BrandMark.vue'
import { SITE, SECTIONS } from '../data/site.js'

const year = new Date().getFullYear()
</script>

<template>
  <footer class="footer panel">
    <div class="shell footer__inner">
      <div class="footer__top">
        <BrandMark :size="42" />
        <ul class="footer__nav">
          <li v-for="s in SECTIONS" :key="s.id">
            <a class="hud" :href="`#${s.id}`">
              <span class="hud--accent">{{ s.index }}</span> {{ s.label }}
            </a>
          </li>
        </ul>
      </div>

      <p class="footer__wordmark display" aria-hidden="true">ARVEN</p>

      <div class="footer__meta">
        <p class="hud">{{ SITE.valley }} · {{ SITE.canton }}</p>
        <p class="hud">{{ SITE.coords }}</p>
        <p class="hud">© {{ year }} {{ SITE.name }}</p>
      </div>

      <p class="footer__note">
        ARVEN is a fictional estate, built as a design demonstration. The natural
        history on this page — the nutcracker's role in seeding arolla forest, the
        reintroduction of the bearded vulture, the chough's nesting altitude — is
        accurate. The property, the prices and the collection are not real.
      </p>
    </div>
  </footer>
</template>

<style scoped>
.footer {
  position: relative;
  z-index: 2;
  padding-block: clamp(56px, 8vw, 110px) 34px;
  border-top: 1px solid var(--line);
  overflow: hidden;
}

.footer__inner {
  display: grid;
  gap: clamp(28px, 4vw, 54px);
}

.footer__top {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 32px;
  flex-wrap: wrap;
}

.footer__nav {
  display: flex;
  flex-wrap: wrap;
  gap: 10px 26px;
}

.footer__nav a {
  transition: color var(--dur) var(--ease);
}

.footer__nav a:hover {
  color: var(--ink);
}

/* the giant edge-to-edge wordmark the reference set puts in every footer */
.footer__wordmark {
  font-size: clamp(4.5rem, 22vw, 21rem);
  line-height: 0.78;
  letter-spacing: 0.02em;
  color: transparent;
  -webkit-text-stroke: 1px var(--line-strong);
  text-align: center;
  user-select: none;
  margin-block: clamp(10px, 2vw, 30px);
}

.footer__meta {
  display: flex;
  justify-content: space-between;
  gap: 18px;
  flex-wrap: wrap;
  padding-top: 22px;
  border-top: 1px solid var(--line);
}

.footer__note {
  color: var(--ink-faint);
  font-size: 0.8rem;
  line-height: 1.65;
  max-width: 74ch;
}

@media (max-width: 760px) {
  .footer__meta {
    gap: 8px;
  }
}
</style>
