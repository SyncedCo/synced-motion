# Changelog

All notable changes to this project are documented here.

The format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## Versioning policy

- **Recipe IDs are public API.** Removing or renaming one is a major change.
- **Recipe behaviour** carries its own `version` field in the manifest. A
  visual change to an existing recipe is a minor bump; a change to its root
  selector, required slots or parameter bounds is a major one.
- **The attribute prefix is `data-motion-`.** Renaming it is a major change.
- **Bundle budgets** in `scripts/check-size.mjs` are part of the contract. They
  are raised deliberately, never quietly.

## [Unreleased]

### Added

- `@syncedco/motion/recipes` exports all sixty recipes individually, so a page
  can bundle only the ones it uses.
- `@syncedco/motion/full` registers every optional GSAP plugin in one import,
  preserving the previous batteries-included behaviour.
- `@syncedco/motion/plugins` exposes the optional plugin set for selective use.
- `data-motion-*` is the attribute vocabulary throughout. The runtime marks
  state with `data-motion-runtime`, `data-motion-reduced`,
  `data-motion-scroll-locked` and `data-motion-recipe`, and the package's own
  custom properties are `--motion-*`.
- `synced-motion add <id...>` prints ready-to-paste markup with every required
  slot, and warns when a recipe needs an optional plugin.
- `synced-motion --version` and per-command `--help`.
- Playwright browser tests covering one recipe per family: clean mount,
  perceivable content, teardown and reduced motion, plus menu focus behaviour.
- `npm run size:check` enforces per-scenario gzip budgets against the built
  package as a consumer installs it.
- `docs/RECIPE-REFERENCE.md`, generated from the registry and verified in CI.
- Continuous integration across Node 20, 22 and 24, a browser-test job, a
  tag-driven publish workflow and a GitHub Pages build for the gallery.

### Changed

- **Authoring metadata no longer reaches the browser.** Recipes are split into
  lean runtime specs and separate authoring metadata; prose, preview data and
  fixture markup stay in the tooling path.
- **Optional GSAP plugins are opt-in.** The core imports gsap and ScrollTrigger
  only. The forty-three recipes needing nothing else are unaffected; the other
  seventeen are skipped with an actionable diagnostic until their plugin is
  supplied.
- `createMotionRegistry` and `validateMotionRecipe` accept a `mode` option. The
  default (`complete`) is unchanged.
- The menu moves focus when its entrance completes rather than on a fixed
  timer.

### Fixed

- The menu no longer fails to move focus into its panel. Focus was being set
  180 ms after opening, while the items were still `visibility: hidden` from
  their entrance tween, so the call silently did nothing.
- Destroying the runtime no longer leaves an expanded menu panel visible; the
  authored `hidden`, `aria-hidden` and `aria-expanded` state is restored.
- The menu closes on an outside click, and only returns focus to its trigger
  when focus was inside the panel.
- A font-loading or window `load` event resolving after `destroy()` no longer
  refreshes a torn-down runtime.
- Thirteen exports (`createMenus`, `createReveals`, `createSplitText` and
  others) shipped without type declarations. Declaration coverage is now
  verified against the real runtime exports of every entry point.
- The MCP server reports the real package version instead of a hard-coded one.

### Payload

| Scenario | Before | After |
| --- | --- | --- |
| Three recipes | 16.2 kB gzip | 5.8 kB gzip |
| All sixty recipes | 25.4 kB gzip | 16.9 kB gzip |
| GSAP plugins forced on consumers | 6 | 1 (ScrollTrigger) |

## [1.0.0]

Initial release: the recipe schema, compiler, registry and runtime; sixty
recipes across twelve families; the CLI and local MCP server; React, Vue,
Svelte, Astro and WordPress adapters; and the recipe gallery.
