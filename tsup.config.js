import { defineConfig } from 'tsup'

export default defineConfig({
  entry: {
    index: 'src/index.js',
    lenis: 'src/lenis.js',
    styles: 'src/styles.css',
  },
  format: ['esm'],
  target: 'es2022',
  dts: true,
  clean: true,
  sourcemap: true,
  external: ['gsap', 'gsap/ScrollTrigger', 'gsap/SplitText', 'lenis'],
})
