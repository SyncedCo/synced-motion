import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js'
import * as z from 'zod/v4'
import { createDefaultMotionService } from './default-service.js'

function response(value, arrayKey = 'items') {
  return {
    content: [{ type: 'text', text: JSON.stringify(value, null, 2) }],
    structuredContent: Array.isArray(value) ? { [arrayKey]: value } : value,
  }
}

export function createMotionToolHandlers(service = createDefaultMotionService()) {
  return Object.freeze({
    catalog: async () => service.catalog(),
    recipe: async ({ id }) => {
      const recipe = service.recipe(id)
      if (!recipe) throw new Error(`Unknown motion recipe "${id}".`)
      return recipe
    },
    suggest: async ({ brief, limit }) => service.suggest(brief, { limit }),
    validate: async ({ recipe } = {}) => service.validate(recipe),
    plan: async ({ ids }) => service.plan(ids),
    scan: async ({ markup }) => service.scanMarkup(markup),
    compose: async ({ brief, markup, limit }) => service.compose(brief, { markup, limit }),
  })
}

export function createMotionMcpServer({ service = createDefaultMotionService() } = {}) {
  const server = new McpServer({ name: 'synced-motion', version: '1.0.0' })
  const handlers = createMotionToolHandlers(service)

  server.registerTool('motion_catalog', {
    description: 'List the machine-readable Synced Motion recipe catalog.',
    inputSchema: {},
  }, async () => response(await handlers.catalog()))

  server.registerTool('motion_recipe', {
    description: 'Get one motion recipe manifest, including slots, parameters, fallbacks, and performance metadata.',
    inputSchema: { id: z.string().min(1) },
  }, async (input) => response(await handlers.recipe(input)))

  server.registerTool('motion_suggest', {
    description: 'Suggest registered motion recipes for a natural-language animation brief.',
    inputSchema: { brief: z.string().min(1), limit: z.number().int().min(1).max(20).optional() },
  }, async (input) => response(await handlers.suggest(input), 'suggestions'))

  server.registerTool('motion_validate', {
    description: 'Validate the active built-in registry or one supplied declarative motion recipe.',
    inputSchema: { recipe: z.record(z.string(), z.unknown()).optional() },
  }, async (input) => response(await handlers.validate(input)))

  server.registerTool('motion_plan', {
    description: 'Create a deterministic integration plan for selected recipe ids.',
    inputSchema: { ids: z.array(z.string().min(1)).min(1) },
  }, async (input) => response(await handlers.plan(input)))

  server.registerTool('motion_scan', {
    description: 'Inspect supplied HTML or template markup for registered recipe roots and missing semantic slots.',
    inputSchema: { markup: z.string().min(1) },
  }, async (input) => response(await handlers.scan(input)))

  server.registerTool('motion_compose', {
    description: 'Compose a constrained motion plan from a natural-language brief and optional existing markup.',
    inputSchema: {
      brief: z.string().min(1),
      markup: z.string().optional(),
      limit: z.number().int().min(1).max(20).optional(),
    },
  }, async (input) => response(await handlers.compose(input)))

  return server
}

export async function startMotionMcpServer({ service, transport = new StdioServerTransport() } = {}) {
  const server = createMotionMcpServer({ service })
  await server.connect(transport)
  return server
}
