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
