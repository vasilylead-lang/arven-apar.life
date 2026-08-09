<script setup>
// The approved mark, inline so it inherits currentColor for the bone body and
// keeps the alpenglow treeline fixed. Geometry matches brand/build_logo.py.
defineProps({
  size: { type: Number, default: 34 },
})
</script>

<template>
  <svg
    class="mark"
    :width="size"
    :height="size"
    viewBox="0 0 512 512"
    aria-hidden="true"
    focusable="false"
  >
    <defs>
      <clipPath :id="'arven-clip'">
        <path
          d="M44 430 L300 76 L470 430 Z M200 430 L302 244 L390 430 Z"
          clip-rule="evenodd"
        />
      </clipPath>
    </defs>
    <path
      fill="currentColor"
      fill-rule="evenodd"
      d="M44 430 L300 76 L470 430 Z M200 430 L302 244 L390 430 Z"
    />
    <rect x="0" y="316" width="512" height="78" fill="#e0573a" clip-path="url(#arven-clip)" />
  </svg>
</template>

<style scoped>
.mark {
  display: block;
  flex: none;
}
</style>
