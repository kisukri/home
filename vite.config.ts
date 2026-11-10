import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vitest/config'
import vue from '@vitejs/plugin-vue'
import Icons from 'unplugin-icons/vite'
import { siteHtml } from './tools/vite/site-html.ts'

export default defineConfig({
  plugins: [vue(), Icons({ compiler: 'vue3' }), siteHtml()],
  build: {
    rollupOptions: {
      output: {
        manualChunks: (id) => (id.includes('/node_modules/') ? 'vendor' : undefined),
      },
    },
  },
  test: {
    include: ['tests/unit/**/*.test.ts'],
  },
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
})
