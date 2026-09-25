import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const AGENT_START = '<!-- synced-motion:agent-guidance:start -->'
const AGENT_END = '<!-- synced-motion:agent-guidance:end -->'

/** Where each agent target keeps its guidance, relative to the project. */
export const MOTION_AGENT_TARGETS = {
  universal: { guidance: 'AGENTS.md' },
  claude: { guidance: 'CLAUDE.md', skill: '.claude/skills/synced-motion/SKILL.md' },
}

/** Expands `all` and comma-separated lists; returns unknown names separately. */
export function resolveMotionAgentTargets(value = 'universal') {
  const requested = String(value).split(',').map((entry) => entry.trim()).filter(Boolean)
  const expanded = requested.flatMap((entry) => (entry === 'all' ? Object.keys(MOTION_AGENT_TARGETS) : [entry]))
  const unique = [...new Set(expanded)]
  return {
    targets: unique.filter((entry) => entry in MOTION_AGENT_TARGETS),
    unknown: unique.filter((entry) => !(entry in MOTION_AGENT_TARGETS)),
  }
}

/** The agent skill shipped in the package, or undefined when it is missing. */
export function packagedMotionSkillPath() {
  // Resolves from both ./src/project (development) and ./dist (published).
  for (const candidate of ['../skills/synced-motion/SKILL.md', '../../skills/synced-motion/SKILL.md']) {
    const path = fileURLToPath(new URL(candidate, import.meta.url))
    if (existsSync(path)) return path
  }
  return undefined
}

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

- Read the packaged skill first: node_modules/@syncedco/motion/skills/synced-motion/SKILL.md
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

export function planMotionProjectSetup({ cwd = process.cwd(), agents = false, targets = ['universal'] } = {}) {
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
    for (const target of targets) {
      const { guidance, skill } = MOTION_AGENT_TARGETS[target]
      const guidancePath = resolve(cwd, guidance)
      const current = existsSync(guidancePath) ? readFileSync(guidancePath, 'utf8') : ''
      const content = updateManagedSection(current, motionAgentGuidance)
      if (content !== current) writes.push({ path: guidancePath, content, kind: 'agents' })

      const source = skill && packagedMotionSkillPath()
      if (source) {
        const skillPath = resolve(cwd, skill)
        const skillContent = readFileSync(source, 'utf8')
        const existing = existsSync(skillPath) ? readFileSync(skillPath, 'utf8') : undefined
        if (skillContent !== existing) writes.push({ path: skillPath, content: skillContent, kind: 'skill' })
      }
    }
  }

  return { cwd, writes }
}

export function applyMotionProjectSetup(plan, { dryRun = false } = {}) {
  if (!dryRun) {
    for (const write of plan.writes) {
      mkdirSync(dirname(write.path), { recursive: true })
      writeFileSync(write.path, write.content)
    }
  }
  return { ...plan, dryRun, changed: plan.writes.length > 0 }
}

export function motionAgentStatus({ cwd = process.cwd() } = {}) {
  const hasGuidance = (file) => {
    const path = resolve(cwd, file)
    return existsSync(path) && readFileSync(path, 'utf8').includes(AGENT_START)
  }
  const targets = Object.fromEntries(Object.entries(MOTION_AGENT_TARGETS).map(([name, { guidance, skill }]) => [
    name,
    hasGuidance(guidance) && (!skill || existsSync(resolve(cwd, skill))),
  ]))
  return {
    installed: Object.values(targets).some(Boolean),
    path: resolve(cwd, 'AGENTS.md'),
    targets,
    skill: packagedMotionSkillPath(),
  }
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
