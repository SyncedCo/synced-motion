import { createDefaultMotionService } from './default-service.js'
import { readFileSync } from 'node:fs'
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

function help() {
  return `Synced Motion

Commands:
  synced-motion catalog [--json]
  synced-motion recipe <id> [--json]
  synced-motion suggest "<brief>" [--limit <number>] [--json]
  synced-motion plan <id...> [--json]
  synced-motion scan --file <path> [--json]
  synced-motion compose "<brief>" [--file <path>] [--json]
  synced-motion validate [--file <recipe.json>] [--json]
  synced-motion doctor [--json]
  synced-motion init [--agents] [--dry-run] [--json]
  synced-motion agents install|status [--dry-run] [--json]
  synced-motion mcp
`
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
    io.log(help())
    return { code: 0 }
  }
  const readFile = (path) => {
    try { return readFileSync(String(path), 'utf8') }
    catch (error) {
      io.error(`Unable to read "${path}": ${error.message}`)
      return undefined
    }
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
