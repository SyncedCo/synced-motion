import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    environment: 'jsdom',
    setupFiles: ['./test/setup.js'],
    // Browser specs (*.browser.js) belong to Playwright, not vitest.
    include: ['test/**/*.test.js'],
  },
})
