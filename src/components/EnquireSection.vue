<script setup>
import { SITE } from '../data/site.js'
</script>

<template>
  <section id="enquire" class="section enquire panel" aria-labelledby="enquire-title">
    <div class="shell">
      <p class="section__marker hud">
        <span class="hud--accent">06</span>
        <span>Enquire</span>
      </p>

      <h2 id="enquire-title" class="display display--l enquire__title">
        Introductions are made<br /><em>one at a time</em>
      </h2>

      <p class="lede enquire__lede">
        There is no brochure and no waiting list. Write to the private office and
        someone will answer you personally, usually within two working days.
      </p>

      <a class="enquire__mail display" :href="`mailto:${SITE.email}`">
        {{ SITE.email }}
      </a>

      <dl class="enquire__details">
        <div>
          <dt class="hud">Private office</dt>
          <dd>{{ SITE.phone }}</dd>
        </div>
        <div>
          <dt class="hud">Viewings</dt>
          <dd>By appointment, June to October</dd>
        </div>
        <div>
          <dt class="hud">Nearest approach</dt>
          <dd>Sion, 47 min by road</dd>
        </div>
      </dl>
    </div>
  </section>
</template>

<style scoped>
.enquire__title {
  margin-bottom: 26px;
}

.enquire__lede {
  margin-bottom: clamp(38px, 5vw, 68px);
}

.enquire__mail {
  display: inline-block;
  font-size: clamp(1.5rem, 4.4vw, 3.8rem);
  line-height: 1.05;
  color: var(--ink);
  border-bottom: 1px solid var(--line-strong);
  padding-bottom: 10px;
  word-break: break-word;
  transition:
    color var(--dur) var(--ease),
    border-color var(--dur) var(--ease);
}

.enquire__mail:hover {
  color: var(--accent);
  border-color: var(--accent);
}

.enquire__details {
  display: flex;
  flex-wrap: wrap;
  gap: clamp(24px, 4vw, 68px);
  margin: clamp(42px, 6vw, 80px) 0 0;
  padding-top: 24px;
  border-top: 1px solid var(--line);
}

.enquire__details dt {
  margin-bottom: 9px;
}

.enquire__details dd {
  margin: 0;
  font-family: var(--font-display);
  font-size: 1.3rem;
  line-height: 1.15;
}
</style>
