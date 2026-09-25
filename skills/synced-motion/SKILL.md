---
name: synced-motion
description: Use Synced Motion to add accessible scroll, reveal, pinned, hover, navigation and page-load animation with validated GSAP recipes, data-motion-* attributes, the synced-motion CLI and its local MCP server. Pairs with Synced Flow for styling but works with any CSS.
---

# Synced Motion

Use this skill when a project uses, evaluates, installs or generates animation
with Synced Motion (`@syncedco/motion`), or when a brief asks for scroll
animation, reveals, pinned storytelling, marquees, split text or similar motion
on a website.

Synced Motion is a catalog of sixty validated GSAP recipes driven by
`data-motion-*` attributes. Every recipe declares and is tested against its
reduced-motion behaviour, its no-JavaScript fallback, its accessibility notes
and its cleanup. Pick a recipe before writing any animation code.

## First moves

1. Check whether `@syncedco/motion` and `gsap` are installed.
2. Check for `synced-motion.config.mjs`. If it is missing, run
   `synced-motion init --agents`.
3. Run `synced-motion catalog --json` before choosing recipes.
4. Run `synced-motion suggest "<brief>" --json` to rank recipes against the
   brief, then `synced-motion plan <id...> --json` for the chosen ones.
5. Run `synced-motion add <id...>` for ready-to-paste markup with every
   required slot.
6. For existing markup, run `synced-motion scan --file <path> --json` to find
   recipe roots and missing slots, or `synced-motion compose "<brief>" --file
   <path> --json` for one combined proposal.
7. Run `synced-motion validate` and `synced-motion doctor` before handoff.

The same answers are available over MCP: `synced-motion mcp` starts a local
stdio server with `motion_catalog`, `motion_recipe`, `motion_suggest`,
`motion_plan`, `motion_scan`, `motion_compose` and `motion_validate`. It needs
no account and uploads nothing.

## Setup

```bash
npm install @syncedco/motion gsap
```

```js
import { createSyncedMotion } from '@syncedco/motion'
import '@syncedco/motion/styles.css'

const motion = createSyncedMotion()
// Call motion.destroy() on route change or hot reload.
```

```html
<h1 data-motion-reveal="up">Heading</h1>
<ul data-motion-stagger>
  <li data-motion-stagger-item>One</li>
  <li data-motion-stagger-item>Two</li>
</ul>
```

- Seventeen recipes need an optional GSAP plugin (SplitText, Flip, DrawSVG,
  MorphSVG or MotionPath). Import from `@syncedco/motion/full`, or pass only the
  plugin needed: `createSyncedMotion({ dependencies: { SplitText } })`.
  `motion.inspect().skipped` lists any recipe skipped for a missing plugin.
- For the smallest bundle, import single recipes from
  `@syncedco/motion/recipes` and pass them to `createMotionRegistry`.
- Framework adapters: `@syncedco/motion/react`, `/vue`, `/svelte`, `/astro`
  and `/wordpress`. Never import GSAP plugins from the core entry.
- No build step (Webflow, WordPress themes, plain HTML): use the import-map
  snippet in the package README.

## Recipe families

Twelve families, five recipes each: reveals and entrances, split text and
typography, scroll and parallax, pinned storytelling, horizontal galleries,
media mask and clip, hover focus and pointer, navigation and overlay, loops and
progress, FLIP layout, SVG path and morph, page load and route. Use
`synced-motion catalog --json` for the ids, and
`synced-motion recipe <id> --json` for slots, parameters, fallbacks and
performance cost.

## Rules

- Use the `data-motion-*` vocabulary only. There is no other prefix.
- Prefer registered recipes and root-scoped hooks over global selectors. Never
  target `body` or `html`.
- Synced Motion owns animation orchestration only. The design system owns
  layout, colour, spacing, typography, tokens and final states. Do not put
  inline colours, spacing or font sizes into motion code.
- Toggle semantic state (`data-active`, `aria-current`, `aria-expanded`) and let
  CSS style it.
- Animate transforms and opacity. Layout animation needs an explicit opt-in.
- Keep content readable when JavaScript fails and when the visitor prefers
  reduced motion. Never hide content that motion might fail to reveal.
- Keep keyboard behaviour, focus order and reading order unchanged.
- Every custom animation must clean up on `destroy()`.
- Keep high-cost recipes to a few per page. The config `budgets` sets the
  limit.
- When the catalog cannot express an effect, write a typed custom recipe with
  `defineMotionRecipe`. It must declare `reducedMotion`, `noJs`,
  `accessibility`, `performance` and a cleanup function, and it must pass
  `synced-motion validate --file <recipe.json>`.

## With Synced Flow

Synced Motion has no dependency on Synced Flow, but the two are designed to be
used together: Flow decides what things look like, Motion decides how they
arrive.

- Use `sf-*` classes for layout and styling, and `data-motion-*` attributes for
  animation, on the same elements.
- Run `synced-flow` commands for layout and styling, and `synced-motion`
  commands for animation.
- Keep brand tokens in `synced-flow.config.mjs`, never in motion code.
- Run `synced-flow lint --json` and `synced-flow doctor` as well as the Motion
  checks before handoff.

```html
<section class="sf-section">
  <div class="sf-container sf-stack">
    <p class="sf-kicker" data-motion-reveal="fade">A motion system</p>
    <h1 class="sf-text-display" data-motion-split="lines">Heading</h1>
  </div>
</section>
```

## Reference

Inside `node_modules/@syncedco/motion/docs/`:

- `RECIPE-REFERENCE.md`: all sixty recipes, generated from the registry
- `ATTRIBUTE-API.md`: the declarative attribute API
- `API.md`: the JavaScript API
- `INTEGRATIONS.md`: frameworks, CMSs and no-build sites
- `TOOLING.md`: the CLI and MCP server

Live gallery: https://syncedco.github.io/synced-motion/gallery/
