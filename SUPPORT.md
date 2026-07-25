# Support

Synced Motion is maintained by SyncedCo.

- Website: [syncedco.com](https://syncedco.com)
- GitHub: [github.com/SyncedCo/synced-motion](https://github.com/SyncedCo/synced-motion)
- Issues: [github.com/SyncedCo/synced-motion/issues](https://github.com/SyncedCo/synced-motion/issues)
- Security: [SECURITY.md](SECURITY.md)
- Contributing: [CONTRIBUTING.md](CONTRIBUTING.md)

## Community Support

Use GitHub issues for reproducible bugs, documentation problems, CLI issues,
and focused feature requests for the open-source core.

Before opening an issue, please include:

- the package version and the GSAP version
- the framework or environment
- the recipe ID, or the markup that should have animated
- the output of `motion.inspect()`, which reports what mounted, what was
  skipped and why, and any errors
- the expected and actual behaviour

If a recipe did nothing, check `inspect().skipped` first: a
`missing-dependency` entry means an optional GSAP plugin was not supplied, and
`missing-slots` means the markup was missing a required element. Both include
the fix.

## Commercial And Team Support

For paid implementation, motion-system audits, accessibility review, migration
from Webflow interactions, training, workshops, or team support, contact
SyncedCo through [syncedco.com](https://syncedco.com).

Commercial services are optional support around the open-source core. Premium
templates, hosted tools, and paid starter kits are not included in this package
unless explicitly released separately.
