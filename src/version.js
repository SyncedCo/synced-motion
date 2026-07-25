import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'

/**
 * The package version, read from package.json at startup.
 *
 * Kept in one place so the CLI, the MCP server handshake and the doctor report
 * can never drift from what was actually published.
 */
function readPackageVersion() {
  // Resolves from both ./src (development) and ./dist (published).
  for (const candidate of ['../package.json', '../../package.json']) {
    try {
      const path = fileURLToPath(new URL(candidate, import.meta.url))
      const parsed = JSON.parse(readFileSync(path, 'utf8'))
      if (parsed.name === '@syncedco/motion' && typeof parsed.version === 'string') return parsed.version
    } catch {
      // Try the next candidate.
    }
  }
  return '0.0.0-unknown'
}

export const packageVersion = readPackageVersion()
