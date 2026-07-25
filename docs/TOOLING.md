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
  including every required slot, using the documented `data-motion-`
  attributes. Pass `--legacy-prefix` to emit `data-sf-` instead. The command
  writes nothing; redirect it where you want it.

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
- `agents install|status` manages only the marked Synced Motion guidance block.
- `mcp` starts the project-local stdio MCP server.

The 1.0 catalog contains sixty implemented and verified recipes: five recipes
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
