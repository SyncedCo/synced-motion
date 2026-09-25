import { defineConfig } from 'vite'
import { resolve } from 'node:path'

const projectRoot = resolve(import.meta.dirname, '../..')
const exampleRoot = resolve(projectRoot, 'example')

// Builds the showcase, full-page examples and recipe gallery as one static
// site so they can be hosted, instead of only being reachable by cloning the
// repository and running a dev server. Pages link to each other with relative
// paths so the site works under any base.
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
        showcase: resolve(exampleRoot, 'index.html'),
        examples: resolve(exampleRoot, 'examples/index.html'),
        commonGround: resolve(exampleRoot, 'examples/common-ground/index.html'),
        fieldNotes: resolve(exampleRoot, 'examples/field-notes/index.html'),
        kestrelOne: resolve(exampleRoot, 'examples/kestrel-one/index.html'),
        gallery: resolve(exampleRoot, 'gallery/index.html'),
        preview: resolve(exampleRoot, 'gallery/preview.html'),
      },
    },
  },
})
