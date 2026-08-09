import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// Vite 8 is Rolldown-based: `rolldownOptions` replaces the deprecated `rollupOptions`.
export default defineConfig({
  base: '/',
  plugins: [vue()],
  publicDir: 'public',
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  build: {
    target: 'es2022',
    cssCodeSplit: true,
    assetsInlineLimit: 4096,
    chunkSizeWarningLimit: 700,
    rolldownOptions: {
      output: {
        // three is by far the heaviest dependency — keep it in its own
        // long-cached chunk. Rolldown takes a function here, not a map.
        manualChunks(id) {
          if (id.includes('node_modules/three')) return 'three'
          if (id.includes('node_modules/gsap') || id.includes('node_modules/lenis')) {
            return 'motion'
          }
          return null
        },
      },
    },
  },
  server: {
    port: 5173,
  },
})
