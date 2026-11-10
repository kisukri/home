import { fileURLToPath } from 'node:url'
import { defineConfig } from '@playwright/test'

const PORT = 4173
const ROOT = fileURLToPath(new URL('../..', import.meta.url))

export default defineConfig({
  testDir: '.',
  outputDir: fileURLToPath(new URL('../../test-results', import.meta.url)),
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? 'github' : 'list',
  use: {
    baseURL: `http://localhost:${PORT}`,
    browserName: 'chromium',
    viewport: { width: 1280, height: 800 },
  },
  webServer: {
    command: `pnpm exec vite preview --port ${PORT} --strictPort`,
    cwd: ROOT,
    port: PORT,
    reuseExistingServer: !process.env.CI,
  },
})
