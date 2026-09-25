# CLI and MCP tools

Synced Motion ships a local `synced-motion` executable. Human-facing text is
the default; pass `--json` when an agent or build tool needs stable structured
data.

```bash
npx synced-motion --help            # every command
npx synced-motion <command> --help  # one command in detail
npx synced-motion --version
```

## Commands

- `add <id...>` prints ready-to-paste markup for one or more recipes,
  including every required slot. The command writes nothing; redirect it
  where you want it.

  ```bash
  npx synced-motion add reveal-rise
  npx synced-motion add pinned-steps marquee > partials/motion.html
  ```

  When a recipe needs an optional GSAP plugin, `add` says so on stderr, so the
  markup can still be piped cleanly.
- `catalog` lists registered recipe manifests.
- `recipe <id>` returns one manifest.
- `suggest "<brief>"` ranks recipes using deterministic catalog metadata.
- `plan <id...>` returns roots, slots, defaults, reduced-motion behavior, and
  performance metadata for an integration.
- `scan --file <path>` finds registered hooks and missing required slots.
- `compose "<brief>" --file <path>` combines deterministic suggestions, a
  recipe plan, markup diagnostics, and performance warnings.
- `validate` validates the active registry; pass `--file <recipe.json>` to validate a custom declarative recipe.
- `doctor` checks that the registry and service are usable.
- `init --agents` installs project config, scripts, and managed AI guidance.
- `agents install|status [--target <name>]` manages only the marked Synced
  Motion guidance block, plus the agent skill where the target supports one.
  Targets are `universal` (`AGENTS.md`, the default), `claude` (`CLAUDE.md`
  and `.claude/skills/synced-motion/SKILL.md`) and `all`.
- `skill` prints where the packaged agent skill lives and the core agent
  commands.
- `mcp` starts the project-local stdio MCP server.

## Agent skill

The package ships an agent skill at
`node_modules/@syncedco/motion/skills/synced-motion/SKILL.md`. It tells an AI
agent how to choose recipes, which commands to run, and the rules every recipe
follows: reduced motion, no-JavaScript fallbacks, accessibility and cleanup.

```bash
npx synced-motion agents install                 # AGENTS.md guidance
npx synced-motion agents install --target claude # Claude Code skill + CLAUDE.md
npx synced-motion agents install --target all
```

The guidance block is marked, so running the command again updates it in place
and leaves the rest of the file alone. It follows the same layout as Synced
Flow's `synced-flow agents install`, so a project using both gets one section
for each.

The catalog contains sixty implemented and verified recipes: five recipes
in each of twelve families. Placeholder or no-op entries are rejected from the
launch catalog. The CLI, MCP server, public service, gallery, and inspector all
read the same source registry.

## MCP server

Start the server with:

```bash
npx synced-motion mcp
```

It exposes:

- `motion_catalog`
- `motion_recipe`
- `motion_suggest`
- `motion_validate`
- `motion_plan`
- `motion_scan`
- `motion_compose`

These tools call the same service module as the CLI. Protocol tests connect an
MCP client over an in-memory transport and execute the real server tool surface.
The server runs locally over stdio and does not require a hosted AI provider.
