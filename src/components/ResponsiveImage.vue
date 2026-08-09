<script setup>
import { computed } from 'vue'

// Every image on the site goes through here so the fill-and-crop rule is
// applied in one place. The files were already cropped to `ratio` on import
// (see brand/src-images -> public/images), so object-fit only has to absorb
// the box flexing between breakpoints.

const props = defineProps({
  name: { type: String, required: true },
  alt: { type: String, required: true },
  widths: { type: Array, required: true },
  sizes: { type: String, required: true },
  ratio: { type: String, default: '3 / 2' },
  focus: { type: String, default: '50% 50%' },
  priority: { type: Boolean, default: false },
})

const srcset = (ext) =>
  props.widths.map((w) => `/images/${props.name}-${w}.${ext} ${w}w`).join(', ')

const fallback = computed(() => `/images/${props.name}-${props.widths.at(-1)}.jpg`)
const ratioParts = computed(() => props.ratio.split('/').map((n) => Number(n.trim())))
const height = computed(() =>
  Math.round((props.widths.at(-1) * ratioParts.value[1]) / ratioParts.value[0]),
)
</script>

<template>
  <figure class="media" :style="{ aspectRatio: ratio }">
    <picture>
      <source type="image/avif" :srcset="srcset('avif')" :sizes="sizes" />
      <source type="image/webp" :srcset="srcset('webp')" :sizes="sizes" />
      <img
        :src="fallback"
        :srcset="srcset('jpg')"
        :sizes="sizes"
        :alt="alt"
        :width="widths.at(-1)"
        :height="height"
        :loading="priority ? 'eager' : 'lazy'"
        :fetchpriority="priority ? 'high' : 'auto'"
        decoding="async"
        :style="{ objectPosition: focus }"
      />
    </picture>
  </figure>
</template>

<style scoped>
.media {
  position: relative;
  margin: 0;
  overflow: hidden;
  background: var(--bg-raised);
}

.media img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}
</style>
