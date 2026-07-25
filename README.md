# Synced Motion

Accessible scroll and interaction animation for the web, in two attributes.

Sixty production recipes built on GSAP, where reduced motion, keyboard
behaviour, no-JavaScript fallbacks and deterministic cleanup are part of the
contract instead of something you remember to add later.

Framework-neutral. No jQuery, no page builder runtime, no generated class
names. Works in plain HTML, React, Vue, Svelte, Astro and WordPress.

```bash
npm install @syncedco/motion gsap
```

## Five minutes

```js
import { createSyncedMotion } from '@syncedco/motion'
import '@syncedco/motion/styles.css'

const motion = createSyncedMotion()
```

```html
<h1 data-motion-reveal="up">Engaging experiences without framework debt.</h1>

<ul data-motion-stagger>
  <li data-motion-stagger-item>Discover</li>
  <li data-motion-stagger-item>Compose</li>
  <li data-motion-stagger-item>Ship</li>
</ul>
```

That is the whole integration. The heading rises in as it enters the viewport,
the list cascades, and both stay exactly where you authored them if JavaScript
never runs or the visitor prefers reduced motion.

Call `motion.destroy()` on route change or hot reload.

Don't know the attribute you need? Ask for it:

```bash
npx synced-motion add reveal-rise
```

## What makes it different

Most animation libraries hand you a tween and leave the hard parts to you.
Here every recipe must declare, and is tested against, four things:

| | |
| --- | --- |
| **Reduced motion** | What happens under `prefers-reduced-motion`. Never "nothing moves and the content is now invisible". |
| **Without JavaScript** | The authored state stays readable. Motion never hides content it might fail to reveal. |
| **Accessibility** | Reading order, focus order and native semantics are unchanged. |
| **Cleanup** | `destroy()` returns the DOM to how you wrote it. Verified in a real browser. |

The validator enforces this: it will not let a recipe target `body`, animate
layout properties without explicitly opting in, or ship without a declared
fallback.

## Pay for what you use

The core imports GSAP and ScrollTrigger. Nothing else.

```js
// All sixty recipes, ScrollTrigger only.        16.9 kB gzip
import { createSyncedMotion } from '@syncedco/motion'

// Only what this page uses.                      5.8 kB gzip
import { createMotionRuntime, createMotionRegistry } from '@syncedco/motion'
import { revealRise, marquee } from '@syncedco/motion/recipes'

createMotionRuntime({
  registry: createMotionRegistry([revealRise, marquee], { mode: 'runtime' }),
})
```

Seventeen recipes need an optional GSAP plugin (SplitText, Flip, DrawSVG,
MorphSVG or MotionPath). Rather than putting all five in your bundle, the core
skips those recipes and tells you exactly what is missing:

```js
motion.inspect().skipped
// [{ id: 'split-lines-rise', reason: 'missing-dependency',
//    dependencies: ['SplitText'],
//    fix: 'Pass { dependencies: { SplitText } } or import from "@syncedco/motion/full".' }]
```

Two ways to resolve it:

```js
// Everything, one import.
import { createSyncedMotion } from '@syncedco/motion/full'

// Or just the plugin you actually need.
import { SplitText } from 'gsap/SplitText'
createSyncedMotion({ dependencies: { SplitText } })
```

These numbers are enforced by `npm run size:check`, measured against the built
package as a consumer installs it.

## Browse the recipes

```bash
npm run gallery
```

Search all sixty, inspect their slots and fallbacks, tune bounded parameters,
simulate reduced motion, and copy the markup. Or read
[the generated reference](docs/RECIPE-REFERENCE.md), which is produced from the
registry so it cannot drift from the code.

## Command line and agents

The CLI and the local MCP server share one side-effect-free service, so an
agent and a human get identical answers.

```bash
npx synced-motion add reveal-rise           # ready-to-paste markup
npx synced-motion suggest "cinematic pinned story"
npx synced-motion catalog --json
npx synced-motion scan --file src/page.html # find roots, report missing slots
npx synced-motion compose "restrained but cinematic" --file src/page.html
npx synced-motion doctor
npx synced-motion mcp                       # local stdio MCP server
```

The MCP server is local and provider-agnostic. It uploads nothing and needs no
account. See [CLI and MCP tools](docs/TOOLING.md).

## Frameworks and CMSs

```js
import { useSyncedMotion } from '@syncedco/motion/react'
import { useSyncedMotion } from '@syncedco/motion/vue'
import { syncedMotion } from '@syncedco/motion/svelte'
import { createAstroMotion } from '@syncedco/motion/astro'
import { createWordPressMotion } from '@syncedco/motion/wordpress'
```

React and Vue are optional peer dependencies. Svelte, Astro and WordPress use
small lifecycle adapters that keep their runtimes out of the core bundle. See
[Framework and CMS integrations](docs/INTEGRATIONS.md).

## Pairs well with Synced Flow

Synced Motion works with any CSS — Tailwind, vanilla, CSS modules, your own
design system. It has no dependency on Synced Flow and never will.

That said, the two were built to the same rule, and it shows when you use them
together: **Flow decides what things look like, Motion decides how they
arrive.** Nothing in this package writes a colour, a spacing value or a font
size, so a theme change in Flow can never be undermined by a stale value baked
into an animation. There is no overlap to reconcile and no fight over
specificity.

```bash
npm install @syncedco/flow @syncedco/motion gsap
```

```html
<!-- sf-* owns the look. data-motion-* owns the arrival. -->
<section class="sf-section">
  <div class="sf-container sf-stack">
    <p class="sf-kicker" data-motion-reveal="fade">A motion system</p>
    <h1 class="sf-text-display" data-motion-split="lines">
      Engaging experiences without framework debt.
    </h1>
  </div>
</section>
```

The two vocabularies stay legible side by side: you can read that markup and
know exactly which package is responsible for what. Motion toggles semantic
state — `data-active`, `aria-current`, `aria-expanded` — and your CSS decides
how that state looks, which is the same seam whether or not the CSS is Flow's.

Keep brand tokens in `synced-flow.config.mjs`. This repository's showcase is a
worked example of the pairing; run `npm run dev` to see it.

## Writing your own recipe

The built-ins are not a fixed menu. A custom recipe is the same contract:

```js
import { createMotionRegistry, createMotionRuntime, defineMotionRecipe } from '@syncedco/motion'

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
    const tween = gsap.from(slots.items, {
      autoAlpha: 0, y: '1.5rem', duration: parameters.duration, stagger: 0.08,
    })
    return () => tween.revert()
  },
})

createMotionRuntime({ registry: createMotionRegistry([reveal]) })
```

Your recipe appears in the gallery, the CLI and the MCP server automatically.
See [the recipe system](docs/RECIPES.md).

## Principles

- reduced motion by default;
- usable content when JavaScript fails;
- semantic state over inline visual values;
- transforms and opacity before layout animation;
- deterministic cleanup;
- framework-neutral browser APIs;
- no jQuery, no page builder runtime.

## Documentation

[Full index](docs/README.md).

- [Recipe reference](docs/RECIPE-REFERENCE.md) — all sixty, generated
- [Declarative attribute API](docs/ATTRIBUTE-API.md)
- [JavaScript API](docs/API.md)
- [Bundle size and performance](docs/PERFORMANCE.md)
- [Motion recipe system](docs/RECIPES.md)
- [CLI and MCP tools](docs/TOOLING.md)
- [Framework and CMS integrations](docs/INTEGRATIONS.md)
- [Capability blueprint](docs/CAPABILITIES.md)
- [Webflow migration workflow](docs/WEBFLOW-MIGRATION.md)
- [Changelog](CHANGELOG.md)

## Contributing

```bash
npm install
npm run check          # design system, units, tests, build, types, budgets, docs
npm run test:browser   # Playwright; run npx playwright install chromium first
```

`npm run check` is the same gate CI runs. See [CONTRIBUTING.md](CONTRIBUTING.md)
and the [code of conduct](CODE_OF_CONDUCT.md).

- [Support](SUPPORT.md) — where to ask, and what to include
- [Security policy](SECURITY.md) — please don't file vulnerabilities publicly
- [Trademarks](TRADEMARKS.md) — the licence covers the code, not the branding

## Scope

This recreates the published-page capabilities an expressive marketing site
needs. It is not a hosted visual editor, a CMS, or a hosting product.

## Licence

MIT © SyncedCo Limited. Maintained by [SyncedCo](https://syncedco.com).
