# Framework and CMS integrations

All adapters mount the production built-in registry after their DOM root is
available, scope recipe selectors to that root, expose refresh access, and
destroy every timeline, trigger, listener, and temporary state on disposal.
They do not own component styling or layout.

## React

Install the optional peers `react` and `@gsap/react`, then pass a component
root ref. The returned ref points to the active motion controller after mount.

```jsx
import { useRef } from 'react'
import { useSyncedMotion } from '@syncedco/motion/react'

export function Page() {
  const root = useRef(null)
  const motion = useSyncedMotion(root)
  return <main ref={root}>{/* semantic recipe markup */}</main>
}
```

The hook uses `useGSAP()` with the supplied scope and reverts the controller on
unmount or watched dependency changes. Pass a third array argument to remount
after application state changes that replace recipe markup.

## Vue 3

Install the optional `vue` peer and pass a template ref. The composable mounts
after `nextTick()` and destroys during `onUnmounted()`.

```vue
<script setup>
import { ref } from 'vue'
import { useSyncedMotion } from '@syncedco/motion/vue'

const root = ref()
const motion = useSyncedMotion(root)
</script>

<template><main ref="root"><!-- semantic recipe markup --></main></template>
```

## Svelte

The Svelte entry is an action and does not import the Svelte runtime.

```svelte
<script>
  import { syncedMotion } from '@syncedco/motion/svelte'
</script>

<main use:syncedMotion>{/* semantic recipe markup */}</main>
```

Updating the action options destroys the prior controller before mounting the
next one. Component destruction performs the final cleanup.

## Astro

Call the adapter from a client script. It mounts at DOM ready, destroys before
an Astro view-transition swap, and remounts on `astro:page-load`.

```js
import { createAstroMotion } from '@syncedco/motion/astro'

const motion = createAstroMotion({ root: '#page' })
```

## WordPress

The WordPress adapter requires no jQuery and no WordPress JavaScript global.
It mounts at DOM ready and supports block or navigation replacements through
semantic document events.

```js
import { createWordPressMotion } from '@syncedco/motion/wordpress'

const motion = createWordPressMotion({ root: '#page' })

// After replacing a dynamic block or page fragment:
document.dispatchEvent(new CustomEvent('motion:mount', {
  detail: { root: document.querySelector('#updated-region') },
}))

// After layout-only changes:
document.dispatchEvent(new Event('motion:refresh'))
```

Calling `motion.destroy()` removes these event listeners and destroys the
active scoped runtime.

## Plain HTML, Webflow and no-build sites

No bundler is needed. An import map tells the browser where `gsap`, its
plugins and `lenis` live, and the package loads straight from a CDN. This
works in a Webflow custom-code embed, a WordPress theme `<head>`, or a static
HTML page.

The core covers every recipe that needs only ScrollTrigger:

<!-- x-release-please-start-version -->
```html
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@syncedco/motion@0.2.0/dist/styles.css">
<script type="importmap">
  {
    "imports": {
      "@syncedco/motion": "https://cdn.jsdelivr.net/npm/@syncedco/motion@0.2.0/dist/index.js",
      "gsap": "https://cdn.jsdelivr.net/npm/gsap@3/index.js",
      "gsap/ScrollTrigger": "https://cdn.jsdelivr.net/npm/gsap@3/ScrollTrigger.js",
      "lenis": "https://cdn.jsdelivr.net/npm/lenis@1/dist/lenis.mjs"
    }
  }
</script>
<script type="module">
  import { createSyncedMotion } from '@syncedco/motion'
  createSyncedMotion()
</script>
```
<!-- x-release-please-end -->

For all sixty recipes, including split text, FLIP and SVG, use the `full`
entry and map the optional GSAP plugins as well:

<!-- x-release-please-start-version -->
```html
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@syncedco/motion@0.2.0/dist/styles.css">
<script type="importmap">
  {
    "imports": {
      "@syncedco/motion/full": "https://cdn.jsdelivr.net/npm/@syncedco/motion@0.2.0/dist/full.js",
      "gsap": "https://cdn.jsdelivr.net/npm/gsap@3/index.js",
      "gsap/ScrollTrigger": "https://cdn.jsdelivr.net/npm/gsap@3/ScrollTrigger.js",
      "gsap/SplitText": "https://cdn.jsdelivr.net/npm/gsap@3/SplitText.js",
      "gsap/Flip": "https://cdn.jsdelivr.net/npm/gsap@3/Flip.js",
      "gsap/DrawSVGPlugin": "https://cdn.jsdelivr.net/npm/gsap@3/DrawSVGPlugin.js",
      "gsap/MorphSVGPlugin": "https://cdn.jsdelivr.net/npm/gsap@3/MorphSVGPlugin.js",
      "gsap/MotionPathPlugin": "https://cdn.jsdelivr.net/npm/gsap@3/MotionPathPlugin.js",
      "lenis": "https://cdn.jsdelivr.net/npm/lenis@1/dist/lenis.mjs"
    }
  }
</script>
<script type="module">
  import { createSyncedMotion } from '@syncedco/motion/full'
  createSyncedMotion()
</script>
```
<!-- x-release-please-end -->

Module scripts run after the document is parsed, so the snippet can sit in the
`<head>`. A page may have only one import map, and it must come before the
first module script. Keep an exact version in production URLs so an upgrade
is always a deliberate change.

Using Synced Flow too? Add its stylesheet before the Synced Motion one, then
use `sf-*` classes and `data-motion-*` attributes on the same elements:

```html
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@syncedco/flow/styles.css">
```
