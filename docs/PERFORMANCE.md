# Bundle size and performance

Animation code runs on every page view, so what you ship matters. This page
explains what each entry point costs, how to ship less, and how the numbers are
kept honest.

## Measured cost

| Scenario | gzip | GSAP plugins pulled in |
| --- | --- | --- |
| `createSyncedMotion()` — all sixty recipes | 16.9 kB | ScrollTrigger |
| `@syncedco/motion/full` — all sixty plus every plugin | 17.0 kB | ScrollTrigger, SplitText, Flip, DrawSVG, MorphSVG, MotionPath |
| Three individually imported recipes | 5.8 kB | ScrollTrigger |

GSAP itself is a peer dependency and is excluded from these figures — you
already ship it. The plugin column matters: those modules come out of the
`gsap` package and land in your bundle, and they are considerably larger than
this package.

Run the numbers yourself:

```bash
npm run size:check
```

## Entry points

| Import | Use it when |
| --- | --- |
| `@syncedco/motion` | The default. Every recipe, GSAP and ScrollTrigger only. |
| `@syncedco/motion/full` | You want the seventeen plugin-backed recipes and don't want to think about it. |
| `@syncedco/motion/recipes` | You want to ship only the recipes this page uses. |
| `@syncedco/motion/plugins` | You want the plugin set to pass through `dependencies`. |

## Shipping only what you use

Every recipe is an individually importable, side-effect-free export. Import the
ones you need and build a registry from them:

```js
import { createMotionRuntime, createMotionRegistry } from '@syncedco/motion'
import { revealRise, revealStaggerCascade, marquee } from '@syncedco/motion/recipes'

const motion = createMotionRuntime({
  registry: createMotionRegistry(
    [revealRise, revealStaggerCascade, marquee],
    { mode: 'runtime' },
  ),
})
```

`mode: 'runtime'` tells the registry to accept lean specs. See
[the recipe system](RECIPES.md#runtime-specs-and-authoring-metadata) for why
those are separate.

Recipe export names are the camelCase form of the recipe ID: `reveal-rise`
becomes `revealRise`, `pinned-steps` becomes `pinnedSteps`. The full list is in
[the recipe reference](RECIPE-REFERENCE.md).

## Optional GSAP plugins

Forty-three of the sixty recipes need nothing beyond GSAP and ScrollTrigger.
The other seventeen need one of SplitText, Flip, DrawSVG, MorphSVG or
MotionPath. Importing all five in the core would put roughly sixty kilobytes of
GSAP into every consumer's bundle to serve a minority of recipes, so the core
does not import them.

If a page contains markup for a recipe whose plugin is missing, that recipe is
skipped and says why:

```js
motion.inspect().skipped
// [{
//   id: 'split-lines-rise',
//   reason: 'missing-dependency',
//   dependencies: ['SplitText'],
//   fix: 'Pass { dependencies: { SplitText } } or import from "@syncedco/motion/full".'
// }]
```

Nothing is hidden and no content disappears — the markup stays in its authored
state, which is the same thing that happens when JavaScript fails entirely.

Two ways to resolve it:

```js
// Everything, one import.
import { createSyncedMotion } from '@syncedco/motion/full'

// Or only the plugin you actually need.
import { SplitText } from 'gsap/SplitText'
createSyncedMotion({ dependencies: { SplitText } })
```

The diagnostic is reported per matched root, so you only hear about a missing
plugin when the page really uses that recipe.

Which recipes need what:

| Plugin | Recipes |
| --- | --- |
| SplitText | 5 |
| Flip | 6 |
| DrawSVGPlugin | 3 |
| MorphSVGPlugin | 2 |
| MotionPathPlugin | 1 |

[The recipe reference](RECIPE-REFERENCE.md) flags each one.

## Runtime cost

- **Transforms and opacity first.** The compiler rejects declarative recipes
  that animate `width`, `height`, `top`, `left`, `margin` or `padding` unless
  they set `performance.allowLayout`.
- **Every recipe declares a performance class** of `low`, `medium` or `high`.
  `synced-motion compose` warns when a plan contains more than two high-cost
  recipes.
- **Mounting is scoped.** Each recipe queries within its own root; nothing
  scans the document repeatedly at runtime.
- **Off-screen loops pause.** Marquees and belts observe intersection and stop
  when they are not visible.
- **Reduced motion is resolved through `gsap.matchMedia()`**, so switching the
  preference reverts and remounts cleanly instead of leaving orphaned tweens.

Inspect what mounted, what was skipped and what failed at any time:

```js
motion.inspect()
// { active, reduced, registered, mounted, skipped, errors }
```

## Budgets

`scripts/check-size.mjs` links the built package into a throwaway
`node_modules`, bundles each scenario with esbuild, and fails if a gzip budget
regresses. It measures the published package rather than `./src` deliberately:
bundlers only honour the `sideEffects` field for packages inside
`node_modules`, so measuring source would overstate how well tree-shaking
works.

Budgets are part of the contract. Raise them deliberately, in a commit that
says why.

## Keeping recipes tree-shakeable

Recipe specs are annotated `/* @__PURE__ */` so a bundler may drop the ones you
never reference. Both the spec call and the nested `setupFactory(...)` call need
the annotation — without it on the inner call, esbuild cannot prove the
initialiser is side-effect free and retains all sixty. `npm run size:check`
catches this.
