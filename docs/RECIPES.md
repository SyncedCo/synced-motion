# Motion recipe system

Motion recipes are the shared interface used by the DOM runtime, CLI, MCP
server, gallery, inspector, and framework adapters.
They make an effect discoverable and testable without limiting a project-owned
recipe to a fixed list of visual ideas.

## Contract

Create recipes with `defineMotionRecipe()`. A recipe declares:

- a stable kebab-case id, semantic intent, family, and tags;
- a root selector and root-scoped semantic slots;
- bounded parameters and supported triggers;
- reduced-motion, no-JavaScript, and accessibility behavior;
- performance cost and plugin dependencies;
- preview and fixture metadata; and
- either a declarative timeline or typed `setup(context)` implementation.

The validator rejects document-global roots such as `body`, incomplete numeric
parameters, missing fallbacks, and declarative layout animation that has not
explicitly opted into the high-cost path.

## Runtime specs and authoring metadata

A recipe manifest serves two audiences with very different needs. The browser
reads the root selector, slots, parameters, triggers, reduced-motion strategy,
performance class, dependencies and `setup`. Humans and agents read the title,
description, intent, family, tags, accessibility notes, no-JavaScript
behaviour, preview settings and fixture markup.

The second group is roughly sixty percent of the payload and none of it is used
while animating, so the two are stored separately:

| Module | Contents | Imported by |
| --- | --- | --- |
| `src/recipes/specs.js` | Lean runtime specs, one named export per recipe | The browser runtime |
| `src/recipes/authoring.js` | Prose, preview data, fixture markup | CLI, MCP server, gallery, inspector, docs |
| `src/recipes/builtins.js` | The two merged into complete manifests | Tooling |
| `src/recipes/runtime-registry.js` | A registry over the lean specs | `createSyncedMotion` |

This is why the registry has a mode:

```js
createMotionRegistry(recipes)                      // 'complete' -- the default
createMotionRegistry(specs, { mode: 'runtime' })   // lean specs
```

`complete` requires the full manifest and is what `defineMotionRecipe` uses by
default, so a recipe you write yourself must still declare its fallbacks and
fixtures. `runtime` validates only what the browser reads.

Because each spec is a separate named export annotated `/* @__PURE__ */`, a page
that imports three recipes bundles three recipes. When adding a recipe, annotate
both the `spec(...)` call and the nested `setupFactory(...)` call, or bundlers
will retain all sixty; `npm run size:check` will fail if you forget.

After changing any recipe, regenerate the reference:

```bash
npm run docs:build
```

## Registry and service seam

`createMotionRegistry(recipes)` owns registration, id resolution, validation,
and the serializable public catalog. `createMotionService(registry)` exposes
catalog, recipe lookup, deterministic suggestion, validation, and motion-plan
data without performing file or process side effects. The CLI and MCP server
must use this service rather than reimplementing catalog logic.

The built-in registry contains sixty stable recipe IDs across twelve families:
reveals/entrances, split-text/typography, scroll/parallax, pinned storytelling,
horizontal galleries, hover/focus/pointer, navigation/overlay, media/mask/clip,
loops/progress/ambient, FLIP/layout, SVG/path/morph, and page-load/route.
Every family contains five implemented recipes.

## Preview fixtures

Every recipe owns at least one serializable fixture. `preview.fixture` must
resolve to a unique fixture ID. A fixture declares a label, semantic markup,
and optional bounded parameter values. Its markup must contain exactly one
recipe root and every required slot inside that root. This contract lets the
gallery and agents render previews without maintaining a second ID map.

```js
preview: { fixture: 'default', viewport: 'standard', activation: 'auto' },
fixtures: [{
  id: 'default',
  label: 'Default',
  markup: '<section data-motion-example><p data-motion-item>Readable content</p></section>',
  parameters: {},
}]
```

## Runtime lifecycle

`createMotionRuntime()` resolves matching recipe roots, verifies required slots,
and mounts recipes inside those roots. It exposes:

- `mount()` and `mountRecipe()`;
- `refresh()` for layout-dependent trigger recalculation;
- `inspect()` for registered, mounted, skipped, and failed recipes; and
- `destroy()` for deterministic teardown.

The runtime uses `gsap.matchMedia()` so responsive and reduced-motion contexts
are reverted together. A missing slot skips animation but does not hide or
remove authored content. `createSyncedMotion()` remains supported while the
existing attribute patterns are migrated onto recipe manifests.

## Ownership

Recipes orchestrate motion and semantic state. They do not own typography,
spacing, colour, layout, or final component presentation. Those remain Synced
Flow and consuming-project responsibilities.
