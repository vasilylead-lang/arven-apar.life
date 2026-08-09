import { ref } from 'vue'

// One shared reactive flag. Every motion decision on the page reads this, so
// there is a single place that decides whether the site animates at all.

const query =
  typeof window !== 'undefined' && window.matchMedia
    ? window.matchMedia('(prefers-reduced-motion: reduce)')
    : null

export const prefersReducedMotion = ref(query ? query.matches : false)

query?.addEventListener('change', (e) => {
  prefersReducedMotion.value = e.matches
})
