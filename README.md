# Synced Motion

A production-ready, prompt-native GSAP motion system with sixty validated recipes, optional Lenis smooth scrolling, local AI tooling, and framework adapters.

Synced Flow owns the visual system. Synced Motion turns readable `data-sf-*` attributes into polished, accessible animation without jQuery, Webflow runtime code, or opaque generated identifiers.

## Install

```bash
npm install @syncedco/motion gsap
```

## Start

```js
import { createSyncedMotion } from '@syncedco/motion'
import '@syncedco/motion/styles.css'

const motion = createSyncedMotion({
  smoothScroll: true,
})

// On route disposal or hot reload:
motion.destroy()
```

`createSyncedMotion()` mounts the same versioned sixty-recipe registry used by
the CLI, MCP server, gallery, and framework adapters. Existing documented
`data-sf-*` attributes remain compatible; newer recipes use the same semantic
root-and-slot contract.

`createSyncedMotion()` remains the compatibility entry point for the documented
attribute patterns. New authored and generated integrations use the versioned
recipe runtime:

```js
import {
  createMotionRegistry,
  createMotionRuntime,
  defineMotionRecipe,
} from '@syncedco/motion'

const reveal = defineMotionRecipe({
  schemaVersion: '1',
  id: 'project-reveal',
  version: '1.0.0',
  title: 'Project reveal',
  description: 'Reveals project cards in their local section.',
  intent: 'Introduce project cards when the section enters the viewport.',
  family: 'reveals',
  tags: ['reveal', 'cards'],
  root: { selector: '[data-motion-projects]' },
  slots: [{ name: 'root' }, { name: 'items', selector: '[data-motion-project]', multiple: true }],
  parameters: { duration: { type: 'number', default: 0.6, min: 0, max: 2 } },
  triggers: [{ type: 'viewport' }],
  reducedMotion: { strategy: 'final' },
  noJs: { behavior: 'Cards remain visible in their authored final state.' },
  accessibility: { notes: 'Reading and focus order never change.' },
  performance: { class: 'low' },
  dependencies: ['gsap'],
  preview: { fixture: 'default', viewport: 'standard', activation: 'auto' },
  fixtures: [{
    id: 'default',
    label: 'Default',
    markup: '<section data-motion-projects><article data-motion-project>Project</article></section>',
    parameters: {},
  }],
  setup({ gsap, slots, parameters, reduced }) {
    if (reduced) return
    const tween = gsap.from(slots.items, { autoAlpha: 0, y: '1.5rem', duration: parameters.duration, stagger: 0.08 })
    return () => tween.revert()
  },
})

const registry = createMotionRegistry([reveal])
const motion = createMotionRuntime({ registry })
```

## Agent and CLI tooling

The CLI and local MCP server use the same side-effect-free motion service:

```bash
npx synced-motion catalog --json
npx synced-motion suggest "cinematic pinned story" --json
npx synced-motion recipe pinned-steps --json
npx synced-motion plan reveal-rise marquee --json
npx synced-motion scan --file src/page.html --json
npx synced-motion compose "cinematic but restrained" --file src/page.html --json
npx synced-motion validate --json
npx synced-motion doctor
npx synced-motion init --agents --dry-run
npx synced-motion mcp
```

The stdio MCP server is local and provider-agnostic. It exposes catalog,
recipe, suggestion, validation, and deterministic planning tools without
uploading project source or requiring a Synced account.

## Local gallery and inspector

```bash
npm run gallery
```

Open `/gallery/` to search all sixty recipes, inspect their semantic slots and
fallbacks, tune bounded parameters, simulate reduced motion, replay an isolated
fixture, and copy integration markup. The gallery consumes the public registry;
it does not maintain a second recipe list.

## Framework and CMS adapters

Optional subpath exports keep the core framework-neutral:

```js
import { useSyncedMotion } from '@syncedco/motion/react'
import { useSyncedMotion } from '@syncedco/motion/vue'
import { syncedMotion } from '@syncedco/motion/svelte'
import { createAstroMotion } from '@syncedco/motion/astro'
import { createWordPressMotion } from '@syncedco/motion/wordpress'
```

React and Vue are optional peer dependencies. Svelte, Astro, and WordPress use
small lifecycle adapters without requiring their runtimes in the core bundle.
See [Framework and CMS integrations](docs/INTEGRATIONS.md).

## Synced Flow project contract

The showcase is a complete Synced Flow project, with its theme in `synced-flow.config.mjs`, source-scanned generated CSS, strict fluid mode, and project-level agent guidance.

- Use Synced Flow primitives and semantic tokens first.
- Use `rem` when a fixed value has no matching token.
- Use `px` only for intentional one-device-pixel borders or decorative hairlines.
- Run `npm run check` before handoff; it includes Synced Flow validation and the unit-policy guard.

## Example

```html
<section class="sf-section">
  <div class="sf-container sf-stack">
    <p class="sf-kicker" data-sf-reveal="fade">A motion system</p>
    <h1 class="sf-text-display" data-sf-reveal="up">
      Engaging experiences without framework debt.
    </h1>
  </div>
</section>
```

## Principles

- no jQuery;
- no Webflow runtime dependency;
- framework-neutral browser APIs;
- semantic state over inline visual values;
- transforms and opacity before layout animation;
- reduced motion by default;
- deterministic cleanup;
- Synced Flow semantic tokens for visual states;
- usable content when JavaScript fails.

## Documentation

- [Capability blueprint](docs/CAPABILITIES.md)
- [Declarative attribute API](docs/ATTRIBUTE-API.md)
- [Motion recipe system](docs/RECIPES.md)
- [CLI and MCP tools](docs/TOOLING.md)
- [Framework and CMS integrations](docs/INTEGRATIONS.md)
- [Webflow migration workflow](docs/WEBFLOW-MIGRATION.md)

The showcase is intentionally a package consumer. Every demonstrated timeline and interaction controller is available through `createSyncedMotion`, its documented `data-sf-*` API, and an exported standalone pattern factory. Project CSS only supplies Synced Flow layout, theme presentation, and state transitions.

## Scope

The package recreates the published-page capabilities needed for expressive marketing sites. It does not attempt to recreate Webflow's hosted visual editor, collaboration platform, CMS, hosting, or billing product.
