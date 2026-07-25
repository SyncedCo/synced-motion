import { existsSync, readFileSync, writeFileSync } from 'node:fs'
import { resolve } from 'node:path'

const AGENT_START = '<!-- synced-motion:agent-guidance:start -->'
const AGENT_END = '<!-- synced-motion:agent-guidance:end -->'

export const motionConfigTemplate = `export default {
  scan: ['src', 'app', 'pages', 'components', 'templates', 'parts'],
  recipes: [],
  reducedMotion: 'final',
  smoothScroll: false,
  budgets: {
    maxHighCostPerPage: 2,
    allowLayoutAnimation: false,
  },
}
`

export const motionAgentGuidance = `${AGENT_START}
## Synced Motion

- Run \`synced-motion catalog --json\` before choosing motion recipes.
- Use \`synced-motion suggest "<brief>" --json\` and \`synced-motion plan <id...> --json\` before writing animation code.
- Prefer registered recipes and root-scoped semantic hooks over global selectors.
- Synced Motion owns animation orchestration; the active design system owns layout, styling, tokens, and final states.
- Preserve readable no-JavaScript content, keyboard semantics, deterministic cleanup, and explicit reduced-motion behavior.
- Prefer transform properties and opacity. Typed custom recipes are the escape hatch for effects the catalog cannot express.
- Run \`synced-motion validate\` and \`synced-motion doctor\` before handoff.
${AGENT_END}`

function updateManagedSection(existing, section) {
  const start = existing.indexOf(AGENT_START)
  const end = existing.indexOf(AGENT_END)
  if (start >= 0 && end >= start) {
    return `${existing.slice(0, start)}${section}${existing.slice(end + AGENT_END.length)}`
  }
  return `${existing.trimEnd()}${existing.trim() ? '\n\n' : ''}${section}\n`
}

function packageUpdate(existing) {
  const pkg = JSON.parse(existing)
  pkg.scripts ??= {}
  pkg.scripts['motion:validate'] ??= 'synced-motion validate'
  pkg.scripts['motion:doctor'] ??= 'synced-motion doctor'
  pkg.scripts['motion:mcp'] ??= 'synced-motion mcp'
  return `${JSON.stringify(pkg, null, 2)}\n`
}

export function planMotionProjectSetup({ cwd = process.cwd(), agents = false } = {}) {
  const writes = []
  const configPath = resolve(cwd, 'synced-motion.config.mjs')
  if (!existsSync(configPath)) writes.push({ path: configPath, content: motionConfigTemplate, kind: 'config' })

  const packagePath = resolve(cwd, 'package.json')
  if (existsSync(packagePath)) {
    const current = readFileSync(packagePath, 'utf8')
    const content = packageUpdate(current)
    if (content !== current) writes.push({ path: packagePath, content, kind: 'package' })
  }

  if (agents) {
    const agentsPath = resolve(cwd, 'AGENTS.md')
    const current = existsSync(agentsPath) ? readFileSync(agentsPath, 'utf8') : ''
    const content = updateManagedSection(current, motionAgentGuidance)
    if (content !== current) writes.push({ path: agentsPath, content, kind: 'agents' })
  }

  return { cwd, writes }
}

export function applyMotionProjectSetup(plan, { dryRun = false } = {}) {
  if (!dryRun) for (const write of plan.writes) writeFileSync(write.path, write.content)
  return { ...plan, dryRun, changed: plan.writes.length > 0 }
}

export function motionAgentStatus({ cwd = process.cwd() } = {}) {
  const path = resolve(cwd, 'AGENTS.md')
  const installed = existsSync(path) && readFileSync(path, 'utf8').includes(AGENT_START)
  return { installed, path }
}

export function doctorMotionProject({ cwd = process.cwd(), service } = {}) {
  const checks = []
  const add = (id, ok, fix) => checks.push({ id, ok, ...(ok ? {} : { fix }) })
  const packagePath = resolve(cwd, 'package.json')
  const configPath = resolve(cwd, 'synced-motion.config.mjs')
  add('package-json', existsSync(packagePath), 'Run inside a Node project with package.json.')
  add('motion-config', existsSync(configPath), 'Run synced-motion init.')
  add('agent-guidance', motionAgentStatus({ cwd }).installed, 'Run synced-motion agents install.')
  const validation = service?.validate?.() ?? { ok: true }
  add('recipe-registry', validation.ok, 'Fix invalid recipe manifests reported by synced-motion validate --json.')
  return { ok: checks.every((check) => check.ok), cwd, checks }
}
