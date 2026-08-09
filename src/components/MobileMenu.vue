<script setup>
import { nextTick, ref, watch } from 'vue'
import { SECTIONS, SITE } from '../data/site.js'

// Below 1080px the masthead nav is hidden, so this is the only way to reach a
// section. It is a real dialog: Escape closes it, focus moves in and back out.

const props = defineProps({
  open: { type: Boolean, default: false },
})
const emit = defineEmits(['close'])

const panel = ref(null)
let restoreTo = null

watch(
  () => props.open,
  async (isOpen) => {
    if (isOpen) {
      restoreTo = document.activeElement
      await nextTick()
      panel.value?.querySelector('a')?.focus()
    } else if (restoreTo instanceof HTMLElement) {
      restoreTo.focus()
      restoreTo = null
    }
  },
)

function onKeydown(e) {
  if (e.key === 'Escape') {
    emit('close')
    return
  }
  if (e.key !== 'Tab' || !panel.value) return

  const items = panel.value.querySelectorAll('a, button')
  if (!items.length) return
  const first = items[0]
  const last = items[items.length - 1]
  if (e.shiftKey && document.activeElement === first) {
    e.preventDefault()
    last.focus()
  } else if (!e.shiftKey && document.activeElement === last) {
    e.preventDefault()
    first.focus()
  }
}
</script>

<template>
  <Transition name="menu">
    <div
      v-if="open"
      ref="panel"
      class="menu"
      role="dialog"
      aria-modal="true"
      aria-label="Sections"
      @keydown="onKeydown"
    >
      <nav class="menu__nav">
        <ul>
          <li v-for="s in SECTIONS" :key="s.id">
            <a :href="`#${s.id}`" @click="emit('close')">
              <span class="menu__idx hud">{{ s.index }}</span>
              <span class="menu__label display display--m">{{ s.label }}</span>
            </a>
          </li>
        </ul>
      </nav>

      <div class="menu__foot">
        <a class="hud hud--ink" :href="`mailto:${SITE.email}`" @click="emit('close')">
          {{ SITE.email }}
        </a>
        <p class="hud">{{ SITE.coords }}</p>
      </div>
    </div>
  </Transition>
</template>

<style scoped>
.menu {
  position: fixed;
  inset: 0;
  z-index: 55;
  display: grid;
  align-content: space-between;
  gap: 40px;
  padding: 108px var(--gutter) 44px;
  background: rgba(10, 13, 15, 0.97);
  backdrop-filter: blur(20px);
  overflow-y: auto;
}

.menu__nav li + li {
  border-top: 1px solid var(--line);
}

.menu__nav a {
  display: flex;
  align-items: baseline;
  gap: 16px;
  padding: 18px 0;
  transition: padding var(--dur) var(--ease);
}

.menu__nav a:hover {
  padding-inline-start: 10px;
}

.menu__idx {
  color: var(--accent);
}

.menu__foot {
  display: grid;
  gap: 12px;
  padding-top: 22px;
  border-top: 1px solid var(--line);
}

.menu-enter-active,
.menu-leave-active {
  transition: opacity var(--dur-slow) var(--ease);
}

.menu-enter-from,
.menu-leave-to {
  opacity: 0;
}
</style>
