# Security Policy

## Supported Versions

Security fixes target the latest published version and the current `main`
branch.

## Reporting A Vulnerability

Please do not open a public GitHub issue for suspected vulnerabilities.

Report security concerns to SyncedCo through [syncedco.com](https://syncedco.com)
and include:

- affected package version or commit
- affected command, entry point, recipe, or integration
- reproduction steps
- expected and actual impact
- any relevant logs or runtime diagnostics from `motion.inspect()`

We will review the report, confirm whether the issue is valid, and coordinate a
fix before public disclosure where appropriate.

## Scope

Security reports may include issues in the CLI, the local MCP server, package
distribution, the framework and CMS adapters, recipe `setup` execution, or the
examples and gallery.

Note that recipe `setup` functions are executable code. Registering a recipe
from an untrusted source runs that code with the privileges of the page, in the
same way importing any third-party module does. Treat recipe manifests from
outside your project as untrusted input.

General support questions, animation behaviour, and feature requests should use
[GitHub issues](https://github.com/SyncedCo/synced-motion/issues).
