import { defineConfig } from 'tsup'

export default defineConfig({
  entry: {
    index: 'src/index.js',
    cli: 'src/cli.js',
    lenis: 'src/lenis.js',
    mcp: 'src/mcp.js',
    react: 'src/adapters/react.js',
    vue: 'src/adapters/vue.js',
    svelte: 'src/adapters/svelte.js',
    astro: 'src/adapters/astro.js',
    wordpress: 'src/adapters/wordpress.js',
    styles: 'src/styles.css',
  },
  format: ['esm'],
  target: 'es2022',
  dts: false,
  clean: true,
  sourcemap: true,
  external: [
    'gsap',
    'gsap/ScrollTrigger',
    'gsap/SplitText',
    'gsap/Flip',
    'gsap/DrawSVGPlugin',
    'gsap/MorphSVGPlugin',
    'gsap/MotionPathPlugin',
    'lenis',
    '@gsap/react',
    'react',
    'vue',
  ],
})
