# Contributing

Thanks for considering a contribution. By taking part you agree to the
[code of conduct](CODE_OF_CONDUCT.md). For vulnerabilities, follow the
[security policy](SECURITY.md) rather than opening an issue. For questions and
bug reports, see [support](SUPPORT.md).

## Setup

```bash
npm install
npx playwright install chromium   # for browser tests
```

## The gate

```bash
npm run check
```

This is what CI runs. In order:

| Step | What it proves |
| --- | --- |
| `flow:check`, `flow:lint`, `flow:doctor` | The showcase's design system is valid and its generated CSS is current. |
| `units:check` | No stray `px`; fixed dimensions use tokens or `rem`. |
| `test` | Unit and DOM behaviour under jsdom. |
| `build` | The package builds and declarations are copied. |
| `types:check` | A consumer on NodeNext can import every subpath, and every runtime export is declared. |
| `size:check` | No bundle budget regressed. |
| `docs:check` | `docs/RECIPE-REFERENCE.md` matches the registry. |
| `motion:validate`, `motion:doctor` | Every recipe passes the schema; project wiring is intact. |
| `mcp:check` | The MCP server starts and exposes its tools. |

Browser tests are separate because they need a real engine:

```bash
npm run test:browser        # headless
npm run test:browser:ui     # interactive
```

**Run them whenever you change a pattern's DOM, focus or timing behaviour.**
jsdom has no layout, so ScrollTrigger never fires, SplitText never splits, Flip
measures nothing, and an element that is `visibility: hidden` will still accept
focus. Every one of those has hidden a real bug.

## Adding a recipe

1. Write the pattern factory in `src/patterns/`. It takes a context object and
   returns a cleanup function, an object with `destroy()`, or an array of
   either.
2. Add the runtime spec to `src/recipes/specs.js`. Annotate both the
   `spec(...)` call and the nested `setupFactory(...)` call with
   `/* @__PURE__ */` so the recipe stays tree-shakeable.
3. Add the prose to `src/recipes/authoring.js`. Never put prose or fixture
   markup in `specs.js` — it would ship to every visitor.
4. Add it to `builtinMotionSpecs`.
5. `npm run docs:build` to regenerate the reference.
6. Add a unit test, and a browser test if it involves focus, layout or timing.
7. `npm run check && npm run test:browser`.

The validator will reject the recipe if it targets `html`, `body` or `:root`,
animates a layout property without `performance.allowLayout`, omits a declared
reduced-motion strategy, no-JavaScript behaviour or accessibility note, or
lacks a fixture whose markup contains the root and every required slot.

See [the recipe system](docs/RECIPES.md) for the full contract.

## What the project will not accept

- jQuery, or a page-builder runtime dependency.
- A hard dependency on Synced Flow. The package is standalone.
- Optional GSAP plugins imported from the core. They belong in
  `src/plugins.js` and `@syncedco/motion/full`.
- Authoring metadata reachable from the browser runtime.
- Motion that hides content it might fail to reveal.
- Inline colours, spacing or typography. Motion animates transforms, opacity
  and semantic state.
- A recipe with no cleanup path.

## Style

Match the surrounding code: no semicolons, single quotes, two-space indent,
named exports. Comments explain why, not what.

## Commits and releases

Do not commit, push, publish or deploy without approval. Releases are
automated from [Conventional Commits](https://www.conventionalcommits.org/):
`fix:` is a patch and `feat:` is a minor. While the version is below 1.0.0, a
breaking change (`feat!:` or a `BREAKING CHANGE:` footer) is also a minor; from
1.0.0 it is a major. Do not bump `package.json` or edit released
`CHANGELOG.md` entries by hand.

Every push to `main` updates a release pull request with the next version and
changelog. Merging it tags `vX.Y.Z`, creates the GitHub release, runs the full
gate including browser tests, and publishes to npm through trusted publishing.

See [CHANGELOG.md](CHANGELOG.md) for the versioning policy — recipe IDs and the
attribute prefix are public API, and bundle budgets are part of the contract.
