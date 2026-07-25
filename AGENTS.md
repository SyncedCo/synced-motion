# Synced Motion contributor instructions

- Do not commit, push, publish, or deploy without explicit approval from Scott.
- Keep the package framework-neutral and free of jQuery or Webflow runtime dependencies.
- Synced Flow owns styling, tokens, layout, and final component states. Synced Motion owns animation orchestration only.
- Prefer semantic state attributes and classes over inline colors, spacing, or typography.
- Animate transforms and opacity where possible. Avoid layout thrashing.
- Every pattern must support cleanup and `prefers-reduced-motion`.
- Preserve usable content when JavaScript fails or motion is disabled.
- Keep public APIs documented and covered by tests.
- Use Synced Flow tokens and primitives before authored CSS. Use `rem` for fixed dimensions when no token fits.
- Do not use `px` except intentional `1px` borders or one-device-pixel decorative hairlines.
- Run `npm run units:check` with the other project checks.

<!-- synced-flow:Synced Flow:start -->
## Synced Flow

Read the Synced Flow skill before generating UI:
- Packaged skill: node_modules/@syncedco/flow/skills/synced-flow/SKILL.md
- Prefer sf-* primitives, recipes, and patterns before custom CSS.
- Do not use Tailwind utilities as the design system surface.
- Keep class names complete in source; do not build dynamic fragments such as sf-${...} or text-${...}.
- Run synced-flow catalog --json before choosing recipes or classes.
- Use synced-flow pattern --list and synced-flow pattern <id> --markup for interaction markup.
- Run synced-flow lint --json and synced-flow doctor before finishing.
- Put brand tokens in synced-flow.config.mjs, not scattered --sf-* overrides.
<!-- synced-flow:Synced Flow:end -->

<!-- synced-motion:agent-guidance:start -->
## Synced Motion

- Run `synced-motion catalog --json` before choosing motion recipes.
- Use `synced-motion suggest "<brief>" --json` and `synced-motion plan <id...> --json` before writing animation code.
- Prefer registered recipes and root-scoped semantic hooks over global selectors.
- Synced Motion owns animation orchestration; the active design system owns layout, styling, tokens, and final states.
- Preserve readable no-JavaScript content, keyboard semantics, deterministic cleanup, and explicit reduced-motion behavior.
- Prefer transform properties and opacity. Typed custom recipes are the escape hatch for effects the catalog cannot express.
- Run `synced-motion validate` and `synced-motion doctor` before handoff.
<!-- synced-motion:agent-guidance:end -->
