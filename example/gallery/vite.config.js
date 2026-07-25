import { defineConfig } from 'vite'
import { resolve } from 'node:path'

const projectRoot = resolve(import.meta.dirname, '../..')
const exampleRoot = resolve(projectRoot, 'example')

// Builds the recipe gallery as a static site so it can be hosted, instead of
// only being reachable by cloning the repository and running a dev server.
export default defineConfig({
  root: exampleRoot,
  // Served from a project path on GitHub Pages; override with --base for a
  // custom domain.
  base: process.env.GALLERY_BASE ?? './',
  build: {
    outDir: resolve(projectRoot, 'dist-gallery'),
    emptyOutDir: true,
    rollupOptions: {
      input: {
        gallery: resolve(exampleRoot, 'gallery/index.html'),
        preview: resolve(exampleRoot, 'gallery/preview.html'),
      },
    },
  },
})
