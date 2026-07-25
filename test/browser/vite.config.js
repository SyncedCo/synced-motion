import { defineConfig } from 'vite'
import { resolve } from 'node:path'

const projectRoot = resolve(import.meta.dirname, '../..')

export default defineConfig({
  root: import.meta.dirname,
  server: {
    port: 5199,
    strictPort: true,
    // The harness imports straight from ../../src.
    fs: { allow: [projectRoot] },
  },
})
