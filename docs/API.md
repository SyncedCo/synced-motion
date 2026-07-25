# JavaScript API

The attribute vocabulary is in [the attribute API](ATTRIBUTE-API.md); every
recipe is listed in [the recipe reference](RECIPE-REFERENCE.md). This page
covers the JavaScript surface.

## `createSyncedMotion(options?)`

The high-level entry point. Mounts every built-in recipe found in the root,
wires optional smooth scrolling, and refreshes triggers once fonts have loaded.

```js
import { createSyncedMotion } from '@syncedco/motion'

const motion = createSyncedMotion({ smoothScroll: true })
```

| Option | Type | Default | Notes |
| --- | --- | --- | --- |
| `root` | `Document \| Element` | `document` | Scopes every selector. |
| `smoothScroll` | `boolean \| object` | `false` | `true` enables Lenis; an object is passed to Lenis. Ignored under reduced motion. |
| `revealStart` | `string` | `'top 84%'` | ScrollTrigger start for the reveal and split families. |
| `reducedMotion` | `'system' \| 'reduce'` | `'system'` | Force reduced motion regardless of the media query. |
| `reducedMotionQuery` | `string` | `'(prefers-reduced-motion: reduce)'` | Override for testing. |
| `parameterOverrides` | `Record<string, Record<string, unknown>>` | `{}` | Per-recipe parameter values, keyed by recipe ID. |
| `dependencies` | `object` | `{}` | Supply GSAP or optional plugins. See [performance](PERFORMANCE.md#optional-gsap-plugins). |
| `debug` | `boolean` | `false` | Show ScrollTrigger markers. |
| `strict` | `boolean` | `true` | Rethrow mount errors. Set `false` to collect them in `inspect().errors` instead. |

### Returned instance

| Member | Description |
| --- | --- |
| `gsap`, `ScrollTrigger` | The instances in use. |
| `registry` | The active registry. |
| `smoothScroll` | The Lenis adapter, or `undefined`. |
| `mountRecipe(id, root?, parameters?)` | Mount one recipe, optionally into markup added after load. Returns mount keys. |
| `refresh()` | Recalculate trigger positions after a layout change. |
| `inspect()` | Current diagnostics. See below. |
| `destroy()` | Tear everything down and restore the authored DOM. |

Call `destroy()` on route change and on hot reload.

## `inspect()`

```js
{
  active: true,
  reduced: false,
  registered: ['reveal-rise', ...],
  mounted: [{ id, root: { selector, tag, id }, slots, performance }],
  skipped: [{ id, root, reason, slots?, dependencies?, fix? }],
  errors: [{ id, phase, message }],
}
```

`reason` is one of:

| Reason | Meaning |
| --- | --- |
| `missing-slots` | The root matched but a required slot was absent. `slots` lists them. |
| `missing-dependency` | An optional GSAP plugin was not supplied. `dependencies` and `fix` explain it. |
| `no-op` | The recipe ran but produced no active behaviour, typically under reduced motion. |

A skipped recipe never hides content.

## `createMotionRuntime(options?)`

The lower-level runtime, for when you want to choose the recipes yourself.

```js
import { createMotionRuntime, createMotionRegistry } from '@syncedco/motion'
import { revealRise } from '@syncedco/motion/recipes'

const runtime = createMotionRuntime({
  registry: createMotionRegistry([revealRise], { mode: 'runtime' }),
})
```

Accepts everything `createSyncedMotion` does except `smoothScroll` and
`revealStart`, plus:

| Option | Type | Notes |
| --- | --- | --- |
| `registry` | `MotionRegistry` | The registry to mount. |
| `recipes` | `MotionRecipe[]` | Shorthand: builds a registry from these. |
| `autoMount` | `boolean` | Defaults to `true`. Set `false` to call `mount()` yourself. |

It returns the same surface as `createSyncedMotion`, plus `mount()`.

## Registries

```js
createMotionRegistry(recipes?, { mode })   // build your own
createBuiltinMotionRegistry()              // all sixty, complete manifests
createRuntimeMotionRegistry(specs?)        // all sixty, lean specs
```

`mode` is `'complete'` (default) or `'runtime'`. Complete requires the full
manifest including prose, preview and fixture metadata; runtime accepts lean
specs. See [the recipe system](RECIPES.md#runtime-specs-and-authoring-metadata).

| Method | Description |
| --- | --- |
| `register(recipe)` | Add one recipe. Throws on a duplicate ID. |
| `has(id)` / `get(id)` | Look up by ID. |
| `list()` | Every registered recipe. |
| `resolve(ids?)` | Recipes for the given IDs. Throws on an unknown ID. |
| `catalog()` | Serialisable catalog: `{ schemaVersion, count, recipes }`. |
| `validate()` | Validate everything registered. |
| `mode` | The registry's validation mode. |

## Defining a recipe

```js
defineMotionRecipe(recipe, { mode })      // validates, freezes, returns it
validateMotionRecipe(recipe, { mode })    // { ok, issues }
compileMotionRecipe(recipe)               // selectors plus a setup function
```

`defineMotionRecipe` throws `MotionRecipeValidationError` (with an `issues`
array and `recipeId`) when validation fails. Full contract in
[the recipe system](RECIPES.md).

### `setup(context)`

```js
setup({ gsap, ScrollTrigger, root, scope, slots, parameters, reduced, debug, recipe }) {
  if (reduced) return
  const tween = gsap.from(slots.items, { autoAlpha: 0, y: '1rem' })
  return () => tween.revert()
}
```

| Field | Description |
| --- | --- |
| `gsap`, `ScrollTrigger` | Always present. |
| `SplitText`, `Flip`, `DrawSVGPlugin`, `MorphSVGPlugin`, `MotionPathPlugin` | Present only when supplied via `dependencies`. Declare them in the recipe's `dependencies` array and the runtime will skip the recipe rather than hand you `undefined`. |
| `root` / `scope` | The matched root element. |
| `slots` | `Record<string, Element[]>`, keyed by slot name. |
| `parameters` | Resolved, validated, within declared bounds. |
| `reduced` | Whether reduced motion is active. |
| `recipe` | The manifest. |

Return a cleanup function, an object with `destroy()`, or `false` to record the
mount as a no-op. Anything you create must be reverted by that cleanup.

## Service, inspector and Lenis

`createMotionService(registry)` is the side-effect-free query layer shared by
the CLI, MCP server and gallery: `catalog()`, `recipe(id)`, `suggest(brief)`,
`plan(ids)`, `scanMarkup(markup)`, `compose(brief, options)` and `validate()`.
It touches no files or processes. `createDefaultMotionService()` builds one over
the built-in catalog.

`createMotionInspector({ registry, runtime })` backs the gallery: select a
recipe and fixture, coerce parameters within their bounds, subscribe to
snapshots. `createLenisAdapter({ gsap, ScrollTrigger, options })` returns
`{ lenis, start, stop, scrollTo, destroy }` and drives Lenis from the GSAP
ticker.

## Framework adapters

See [framework and CMS integrations](INTEGRATIONS.md).

## TypeScript

Declarations ship for every subpath. `npm run types:check` verifies both that a
consumer on NodeNext can import them and that every runtime export of every
entry point is declared.

Exported types include `MotionRecipe`, `MotionRuntimeRecipe`, `MotionRegistry`,
`MotionRegistryMode`, `MotionRuntime`, `MotionRuntimeOptions`,
`SyncedMotionOptions`, `SyncedMotionInstance`, `MotionRecipeContext`,
`MotionRecipeSlot`, `MotionRecipeParameter`, `MotionTriggerType` and
`MotionPerformanceClass`.
