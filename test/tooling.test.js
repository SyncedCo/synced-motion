import { describe, expect, it, vi } from 'vitest'
import { mkdtempSync, readFileSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { Client } from '@modelcontextprotocol/sdk/client/index.js'
import { InMemoryTransport } from '@modelcontextprotocol/sdk/inMemory.js'
import { runMotionCli } from '../src/cli.js'
import { createDefaultMotionService } from '../src/default-service.js'
import { createMotionMcpServer, createMotionToolHandlers } from '../src/mcp.js'
import {
  applyMotionProjectSetup,
  doctorMotionProject,
  motionAgentStatus,
  planMotionProjectSetup,
} from '../src/project/setup.js'

function capture() {
  return { log: vi.fn(), error: vi.fn() }
}

describe('built-in catalog', () => {
  it('registers every existing showcase capability once', () => {
    const service = createDefaultMotionService()
    const catalog = service.catalog()
    expect(catalog.count).toBe(60)
    expect(new Set(catalog.recipes.map((recipe) => recipe.id)).size).toBe(60)
    expect(catalog.recipes.map((recipe) => recipe.id)).toEqual(expect.arrayContaining([
      'reveal-rise',
      'split-lines-rise',
      'pinned-steps',
      'media-expand',
      'accessible-menu',
      'marquee',
    ]))
    expect(catalog.recipes.filter((recipe) => recipe.family === 'reveals-entrances')).toHaveLength(5)
    expect(catalog.recipes.filter((recipe) => recipe.family === 'split-text-typography')).toHaveLength(5)
    expect(catalog.recipes.filter((recipe) => recipe.family === 'scroll-parallax')).toHaveLength(5)
    expect(catalog.recipes.filter((recipe) => recipe.family === 'pinned-storytelling')).toHaveLength(5)
    expect(catalog.recipes.filter((recipe) => recipe.family === 'horizontal-galleries')).toHaveLength(5)
    expect(catalog.recipes.filter((recipe) => recipe.family === 'hover-focus-pointer')).toHaveLength(5)
    expect(catalog.recipes.filter((recipe) => recipe.family === 'navigation-overlay')).toHaveLength(5)
    expect(catalog.recipes.filter((recipe) => recipe.family === 'media-mask-clip')).toHaveLength(5)
    expect(catalog.recipes.filter((recipe) => recipe.family === 'loops-progress-ambient')).toHaveLength(5)
    expect(catalog.recipes.filter((recipe) => recipe.family === 'flip-layout')).toHaveLength(5)
    expect(catalog.recipes.filter((recipe) => recipe.family === 'svg-path-morph')).toHaveLength(5)
    expect(catalog.recipes.filter((recipe) => recipe.family === 'page-load-route')).toHaveLength(5)
    expect(new Set(catalog.recipes.map((recipe) => recipe.family))).toHaveLength(12)
  })
})

describe('CLI and MCP parity', () => {
  it('returns the same catalog through both surfaces', async () => {
    const service = createDefaultMotionService()
    const io = capture()
    const cli = await runMotionCli(['catalog', '--json'], io, service)
    const mcp = await createMotionToolHandlers(service).catalog()

    expect(cli.code).toBe(0)
    expect(cli.result).toEqual(mcp)
    expect(JSON.parse(io.log.mock.calls[0][0])).toEqual(mcp)
  })

  it('returns the same deterministic suggestions through both surfaces', async () => {
    const service = createDefaultMotionService()
    const io = capture()
    const cli = await runMotionCli(['suggest', 'pinned scroll story', '--limit', '3', '--json'], io, service)
    const mcp = await createMotionToolHandlers(service).suggest({ brief: 'pinned scroll story', limit: 3 })

    expect(cli.result).toEqual(mcp)
    expect(cli.result.length).toBeGreaterThan(0)
  })

  it('reports invalid commands and unknown recipes without throwing', async () => {
    const io = capture()
    expect((await runMotionCli(['recipe', 'missing'], io)).code).toBe(1)
    expect(io.error).toHaveBeenCalledWith('Unknown motion recipe "missing".')
  })

  it('produces matching plans through CLI and MCP', async () => {
    const service = createDefaultMotionService()
    const io = capture()
    const ids = ['reveal-rise', 'marquee']
    const cli = await runMotionCli(['plan', ...ids, '--json'], io, service)
    const mcp = await createMotionToolHandlers(service).plan({ ids })
    expect(cli.result).toEqual(mcp)
  })

  it('keeps recipe lookup and validation identical across CLI and MCP', async () => {
    const service = createDefaultMotionService()
    for (const [args, handler, input] of [
      [['recipe', 'svg-path-morph', '--json'], 'recipe', { id: 'svg-path-morph' }],
      [['validate', '--json'], 'validate', undefined],
    ]) {
      const cli = await runMotionCli(args, capture(), service)
      const mcp = await createMotionToolHandlers(service)[handler](input)
      expect(cli.result).toEqual(mcp)
    }
  })

  it('keeps markup scan and composition identical across CLI and MCP', async () => {
    const service = createDefaultMotionService()
    const cwd = mkdtempSync(join(tmpdir(), 'synced-motion-'))
    const file = join(cwd, 'page.html')
    const markup = '<section data-motion-page-load-hero><div data-motion-page-load-item></div></section>'
    writeFileSync(file, markup)

    const scanCli = await runMotionCli(['scan', '--file', file, '--json'], capture(), service)
    const scanMcp = await createMotionToolHandlers(service).scan({ markup })
    expect(scanCli.result).toEqual(scanMcp)

    const composeCli = await runMotionCli(['compose', 'page load hero', '--file', file, '--limit', '2', '--json'], capture(), service)
    const composeMcp = await createMotionToolHandlers(service).compose({ brief: 'page load hero', markup, limit: 2 })
    expect(composeCli.result).toEqual(composeMcp)
  })

  it('validates a custom declarative recipe through CLI and MCP', async () => {
    const service = createDefaultMotionService()
    const cwd = mkdtempSync(join(tmpdir(), 'synced-motion-'))
    const file = join(cwd, 'recipe.json')
    const custom = {
      schemaVersion: '1', id: 'custom-fade', version: '1.0.0', title: 'Custom fade',
      description: 'Fade a local item.', intent: 'Introduce one item.', family: 'custom', tags: ['fade'],
      root: { selector: '[data-custom-fade]' }, slots: [{ name: 'root' }, { name: 'item', selector: '[data-custom-item]' }],
      parameters: {}, triggers: [{ type: 'load' }], timeline: { steps: [{ action: 'from', target: 'item', vars: { opacity: 0 } }] },
      reducedMotion: { strategy: 'final' }, noJs: { behavior: 'Content remains visible.' }, accessibility: { notes: 'Reading order is unchanged.' },
      performance: { class: 'low' }, dependencies: ['gsap'], preview: { fixture: 'default' },
      fixtures: [{ id: 'default', label: 'Default', markup: '<section data-custom-fade><p data-custom-item>Item</p></section>', parameters: {} }],
    }
    writeFileSync(file, JSON.stringify(custom))
    const cli = await runMotionCli(['validate', '--file', file, '--json'], capture(), service)
    const mcp = await createMotionToolHandlers(service).validate({ recipe: custom })
    expect(cli.result).toEqual(mcp)
    expect(mcp.ok).toBe(true)
  })

  it('reports unreadable project files without an unhandled exception', async () => {
    const io = capture()
    const result = await runMotionCli(['scan', '--file', '/definitely/missing.html'], io)
    expect(result.code).toBe(1)
    expect(io.error).toHaveBeenCalledWith(expect.stringContaining('Unable to read'))
  })

  it('scans semantic hooks and composes a constrained plan', async () => {
    const service = createDefaultMotionService()
    const markup = '<section data-motion-scroll-steps><div data-motion-pin-target></div><button data-motion-step-link></button></section><article data-motion-step-panel></article>'
    const scan = service.scanMarkup(markup)
    expect(scan.recipes).toEqual([
      expect.objectContaining({ id: 'pinned-steps', ready: false, missingSlots: ['panels'] }),
    ])
    const composition = await createMotionToolHandlers(service).compose({ brief: 'pinned scroll story', markup, limit: 2 })
    expect(composition.suggestions).toHaveLength(2)
    expect(composition.scan).toEqual(scan)
    expect(composition.warnings).toContain('pinned-steps is missing required slots: panels')
  })
})

describe('MCP protocol server', () => {
  it('advertises and executes the catalog tools over an MCP transport', async () => {
    const [clientTransport, serverTransport] = InMemoryTransport.createLinkedPair()
    const server = createMotionMcpServer()
    const client = new Client({ name: 'synced-motion-test', version: '1.0.0' })
    await Promise.all([server.connect(serverTransport), client.connect(clientTransport)])

    const tools = await client.listTools()
    expect(tools.tools.map((tool) => tool.name)).toEqual(expect.arrayContaining([
      'motion_catalog',
      'motion_recipe',
      'motion_suggest',
      'motion_validate',
      'motion_plan',
      'motion_scan',
      'motion_compose',
    ]))

    const result = await client.callTool({ name: 'motion_catalog', arguments: {} })
    expect(result.isError).not.toBe(true)
    expect(result.structuredContent).toEqual(expect.objectContaining({ count: 60 }))

    const suggestions = await client.callTool({
      name: 'motion_suggest',
      arguments: { brief: 'pinned scroll story', limit: 2 },
    })
    expect(suggestions.isError).not.toBe(true)
    expect(suggestions.structuredContent).toEqual({
      suggestions: expect.arrayContaining([expect.objectContaining({ id: 'pinned-steps' })]),
    })

    await client.close()
    await server.close()
  })
})

describe('project setup and agent guidance', () => {
  it('plans safely, preserves existing guidance, and installs managed project files', () => {
    const cwd = mkdtempSync(join(tmpdir(), 'synced-motion-'))
    writeFileSync(join(cwd, 'package.json'), '{"name":"fixture","scripts":{"test":"test"}}\n')
    writeFileSync(join(cwd, 'AGENTS.md'), '# Existing project rules\n')

    const plan = planMotionProjectSetup({ cwd, agents: true })
    expect(plan.writes.map((write) => write.kind)).toEqual(expect.arrayContaining(['config', 'package', 'agents']))
    expect(readFileSync(join(cwd, 'AGENTS.md'), 'utf8')).toBe('# Existing project rules\n')

    applyMotionProjectSetup(plan)
    expect(readFileSync(join(cwd, 'AGENTS.md'), 'utf8')).toContain('# Existing project rules')
    expect(readFileSync(join(cwd, 'AGENTS.md'), 'utf8')).toContain('synced-motion:agent-guidance:start')
    expect(JSON.parse(readFileSync(join(cwd, 'package.json'), 'utf8')).scripts).toEqual(expect.objectContaining({
      test: 'test',
      'motion:validate': 'synced-motion validate',
      'motion:doctor': 'synced-motion doctor',
      'motion:mcp': 'synced-motion mcp',
    }))
    expect(motionAgentStatus({ cwd }).installed).toBe(true)
    expect(doctorMotionProject({ cwd, service: createDefaultMotionService() }).ok).toBe(true)
  })

  it('supports a dry run without touching the project', () => {
    const cwd = mkdtempSync(join(tmpdir(), 'synced-motion-'))
    writeFileSync(join(cwd, 'package.json'), '{"name":"fixture"}\n')
    const plan = planMotionProjectSetup({ cwd, agents: true })
    const result = applyMotionProjectSetup(plan, { dryRun: true })
    expect(result.changed).toBe(true)
    expect(() => readFileSync(join(cwd, 'synced-motion.config.mjs'))).toThrow()
  })
})
