import { createDefaultMotionService } from './default-service.js'
import { readFileSync } from 'node:fs'
import { packageVersion } from './version.js'
import {
  applyMotionProjectSetup,
  doctorMotionProject,
  motionAgentStatus,
  planMotionProjectSetup,
} from './project/setup.js'

function parseArguments(args) {
  const positional = []
  const options = {}
  for (let index = 0; index < args.length; index += 1) {
    const value = args[index]
    if (!value.startsWith('--')) {
      positional.push(value)
      continue
    }
    const key = value.slice(2)
    const next = args[index + 1]
    if (next && !next.startsWith('--')) {
      options[key] = next
      index += 1
    } else options[key] = true
  }
  return { positional, options }
}

const COMMANDS = {
  add: {
    usage: 'synced-motion add <id...> [--json]',
    summary: 'Print ready-to-paste markup for one or more recipes.',
    detail: `Emits the semantic markup a recipe needs, including every required
slot, using the documented data-motion-* attributes.

  synced-motion add reveal-rise
  synced-motion add pinned-steps marquee > partials/motion.html`,
  },
  catalog: {
    usage: 'synced-motion catalog [--json]',
    summary: 'List every registered recipe.',
  },
  recipe: {
    usage: 'synced-motion recipe <id> [--json]',
    summary: 'Show one recipe manifest: slots, parameters, fallbacks, performance.',
  },
  suggest: {
    usage: 'synced-motion suggest "<brief>" [--limit <number>] [--json]',
    summary: 'Rank recipes against a natural-language brief.',
  },
  plan: {
    usage: 'synced-motion plan <id...> [--json]',
    summary: 'Produce a deterministic integration plan for chosen recipes.',
  },
  scan: {
    usage: 'synced-motion scan --file <path> [--json]',
    summary: 'Find recipe roots in existing markup and report missing slots.',
  },
  compose: {
    usage: 'synced-motion compose "<brief>" [--file <path>] [--json]',
    summary: 'Combine suggest, plan and scan into one constrained proposal.',
  },
  validate: {
    usage: 'synced-motion validate [--file <recipe.json>] [--json]',
    summary: 'Validate the built-in registry or one custom recipe.',
  },
  doctor: {
    usage: 'synced-motion doctor [--json]',
    summary: 'Check project wiring and agent guidance.',
  },
  init: {
    usage: 'synced-motion init [--agents] [--dry-run] [--json]',
    summary: 'Set up Synced Motion in the current project.',
  },
  agents: {
    usage: 'synced-motion agents install|status [--dry-run] [--json]',
    summary: 'Install or inspect agent guidance in AGENTS.md.',
  },
  mcp: {
    usage: 'synced-motion mcp',
    summary: 'Start the local stdio MCP server.',
  },
}

function help(command) {
  const entry = COMMANDS[command]
  if (entry) {
    return `${entry.summary}\n\nUsage:\n  ${entry.usage}\n${entry.detail ? `\n${entry.detail}\n` : ''}`
  }

  const width = Math.max(...Object.keys(COMMANDS).map((name) => name.length))
  const lines = Object.entries(COMMANDS)
    .map(([name, meta]) => `  ${name.padEnd(width)}  ${meta.summary}`)
    .join('\n')
  return `Synced Motion ${packageVersion}

Usage:
  synced-motion <command> [options]

Commands:
${lines}

Options:
  --json        Machine-readable output.
  --help, -h    Show help. Follows a command for detailed help.
  --version, -v Print the package version.

Run "synced-motion <command> --help" for details on a single command.
`
}

/** Indent-aware markup emitter for `synced-motion add`. */
function markupForRecipe(recipe) {
  const attribute = (selector) => selector.replace(/^\[/, '').replace(/\]$/, '')
  const slots = recipe.slots.filter((slot) => slot.name !== 'root')
  const children = slots.flatMap((slot) => {
    const count = slot.multiple ? 2 : 1
    return Array.from({ length: count }, (_, index) => {
      const label = slot.multiple ? `${slot.name} ${index + 1}` : slot.name
      const optional = slot.required === false ? '  <!-- optional -->' : ''
      return `  <div ${attribute(slot.selector)}>${label}</div>${optional}`
    })
  })

  const header = [
    `<!-- ${recipe.id}: ${recipe.intent} -->`,
    `<!-- reduced motion: ${recipe.reducedMotion.strategy} | without JavaScript: ${recipe.noJs.behavior} -->`,
  ]
  const open = `<section ${attribute(recipe.root.selector)}>`
  // A recipe with no child slots animates its root, so give it readable content
  // rather than emitting an empty element the author has to guess at.
  const body = children.length ? children : ['  Replace this with the content you want to animate.']
  return [...header, open, ...body, '</section>'].join('\n')
}

function formatText(command, result) {
  if (command === 'catalog') return `Synced Motion catalog\n${result.recipes.map((recipe) => `- ${recipe.id}: ${recipe.intent}`).join('\n')}`
  if (command === 'recipe') return result ? `${result.id}: ${result.title}\n${result.intent}` : 'Recipe not found.'
  if (command === 'suggest') return result.length ? result.map((entry) => `- ${entry.id}: ${entry.intent}`).join('\n') : 'No matching recipes found.'
  if (command === 'plan') return `Motion plan\n${result.recipes.map((recipe) => `- ${recipe.id}`).join('\n')}`
  if (command === 'scan') return result.recipes.length ? result.recipes.map((recipe) => `- ${recipe.id}: ${recipe.ready ? 'ready' : `missing ${recipe.missingSlots.join(', ')}`}`).join('\n') : 'No registered recipe hooks found.'
  if (command === 'compose') return `Motion composition\n${result.suggestions.map((entry) => `- ${entry.id}: ${entry.intent}`).join('\n')}${result.warnings.length ? `\nWarnings:\n${result.warnings.map((warning) => `- ${warning}`).join('\n')}` : ''}`
  if (command === 'validate') return result.ok ? 'pass recipe registry is valid.' : `fail ${JSON.stringify(result.issues)}`
  if (command === 'doctor') return result.checks.map((check) => `${check.ok ? 'pass' : 'warn'} ${check.id}${check.fix ? `: ${check.fix}` : ''}`).join('\n')
  return String(result)
}

export async function runMotionCli(args = process.argv.slice(2), io = console, service = createDefaultMotionService()) {
  const [command = 'help', ...rest] = args
  const { positional, options } = parseArguments(rest)
  let result

  if (command === 'help' || command === '--help' || command === '-h') {
    io.log(help(positional[0]))
    return { code: 0 }
  }
  if (command === '--version' || command === '-v' || command === 'version') {
    io.log(packageVersion)
    return { code: 0 }
  }
  if (options.help === true || options.h === true) {
    io.log(help(command))
    return { code: 0 }
  }
  const readFile = (path) => {
    try { return readFileSync(String(path), 'utf8') }
    catch (error) {
      io.error(`Unable to read "${path}": ${error.message}`)
      return undefined
    }
  }

  if (command === 'add') {
    if (!positional.length) {
      io.error('Pass one or more recipe ids, for example: synced-motion add reveal-rise')
      return { code: 1 }
    }
    const recipes = []
    for (const id of positional) {
      const recipe = service.recipe(id)
      if (!recipe) {
        io.error(`Unknown motion recipe "${id}". Run "synced-motion catalog" to list every id.`)
        return { code: 1 }
      }
      recipes.push(recipe)
    }
    const blocks = recipes.map((recipe) => ({
      id: recipe.id,
      dependencies: recipe.dependencies,
      markup: markupForRecipe(recipe),
    }))
    if (options.json) {
      io.log(JSON.stringify({ schemaVersion: '1', recipes: blocks }, null, 2))
    } else {
      io.log(blocks.map((block) => block.markup).join('\n\n'))
      const plugins = [...new Set(blocks.flatMap((block) => block.dependencies))]
        .filter((name) => name !== 'gsap' && name !== 'ScrollTrigger')
      if (plugins.length) {
        io.error(`\nNeeds optional GSAP plugins: ${plugins.join(', ')}.`)
        io.error('Import from "@syncedco/motion/full", or pass them via { dependencies }.')
      }
    }
    return { code: 0 }
  }

  if (command === 'catalog') result = service.catalog()
  else if (command === 'recipe') {
    result = service.recipe(positional[0])
    if (!result) {
      io.error(`Unknown motion recipe "${positional[0] ?? ''}".`)
      return { code: 1 }
    }
  } else if (command === 'suggest') {
    const brief = positional.join(' ')
    if (!brief) {
      io.error('Pass a motion brief, for example: synced-motion suggest "subtle scroll reveal"')
      return { code: 1 }
    }
    const limit = options.limit === undefined ? undefined : Number(options.limit)
    if (limit !== undefined && (!Number.isInteger(limit) || limit < 1)) {
      io.error('--limit must be a positive integer.')
      return { code: 1 }
    }
    result = service.suggest(brief, { limit })
  } else if (command === 'plan') {
    try {
      result = service.plan(positional.length ? positional : undefined)
    } catch (error) {
      io.error(error.message)
      return { code: 1 }
    }
  } else if (command === 'scan') {
    if (!options.file) {
      io.error('Pass --file <path> to scan project markup.')
      return { code: 1 }
    }
    const markup = readFile(options.file)
    if (markup === undefined) return { code: 1 }
    result = service.scanMarkup(markup)
  } else if (command === 'compose') {
    const brief = positional.join(' ')
    if (!brief) {
      io.error('Pass a motion brief to compose.')
      return { code: 1 }
    }
    const markup = options.file ? readFile(options.file) : undefined
    if (options.file && markup === undefined) return { code: 1 }
    const limit = options.limit === undefined ? undefined : Number(options.limit)
    if (limit !== undefined && (!Number.isInteger(limit) || limit < 1)) {
      io.error('--limit must be a positive integer.')
      return { code: 1 }
    }
    result = service.compose(brief, { markup, limit })
  } else if (command === 'validate') {
    if (!options.file) result = service.validate()
    else {
      const source = readFile(options.file)
      if (source === undefined) return { code: 1 }
      try { result = service.validate(JSON.parse(source)) }
      catch (error) {
        io.error(`Unable to parse "${options.file}" as JSON: ${error.message}`)
        return { code: 1 }
      }
    }
  } else if (command === 'doctor') {
    result = doctorMotionProject({ cwd: process.cwd(), service })
  } else if (command === 'init') {
    result = applyMotionProjectSetup(planMotionProjectSetup({ cwd: process.cwd(), agents: Boolean(options.agents) }), { dryRun: Boolean(options['dry-run']) })
  } else if (command === 'agents') {
    const action = positional[0] ?? 'status'
    if (action === 'status') result = motionAgentStatus({ cwd: process.cwd() })
    else if (action === 'install') {
      result = applyMotionProjectSetup(planMotionProjectSetup({ cwd: process.cwd(), agents: true }), { dryRun: Boolean(options['dry-run']) })
    } else {
      io.error(`Unknown agents action "${action}". Use install or status.`)
      return { code: 1 }
    }
  } else if (command === 'mcp') {
    const { startMotionMcpServer } = await import('./mcp.js')
    await startMotionMcpServer({ service })
    return { code: 0 }
  } else {
    io.error(`Unknown command "${command}".\n\n${help()}`)
    return { code: 1 }
  }

  io.log(options.json ? JSON.stringify(result, null, 2) : (command === 'init' || command === 'agents')
    ? `${result.changed === false ? 'pass no changes required.' : `${result.dryRun ? 'planned' : 'updated'} ${result.writes?.length ?? 0} project files.`}`
    : formatText(command, result))
  return { code: result?.ok === false ? 1 : 0, result }
}
