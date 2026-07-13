# Synced Motion

A semantic GSAP and Lenis motion toolkit designed to complement Synced Flow.

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
- [Webflow migration workflow](docs/WEBFLOW-MIGRATION.md)

The showcase is intentionally a package consumer. Every demonstrated timeline and interaction controller is available through `createSyncedMotion`, its documented `data-sf-*` API, and an exported standalone pattern factory. Project CSS only supplies Synced Flow layout, theme presentation, and state transitions.

## Scope

The package recreates the published-page capabilities needed for expressive marketing sites. It does not attempt to recreate Webflow's hosted visual editor, collaboration platform, CMS, hosting, or billing product.
