import { Client } from '@modelcontextprotocol/sdk/client/index.js'
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js'

const transport = new StdioClientTransport({
  command: process.execPath,
  args: ['./bin/synced-motion.mjs', 'mcp'],
  cwd: process.cwd(),
  stderr: 'pipe',
})
const client = new Client({ name: 'synced-motion-stdio-check', version: '1.0.0' })

try {
  await client.connect(transport)
  const tools = await client.listTools()
  const required = ['motion_catalog', 'motion_recipe', 'motion_suggest', 'motion_validate', 'motion_plan', 'motion_scan', 'motion_compose']
  const names = new Set(tools.tools.map((tool) => tool.name))
  for (const name of required) if (!names.has(name)) throw new Error(`Missing MCP tool: ${name}`)
  const result = await client.callTool({ name: 'motion_catalog', arguments: {} })
  if (result.isError || result.structuredContent?.count !== 60) throw new Error('MCP catalog did not return the production 60-recipe catalog.')
  console.log('pass local stdio MCP exposes 7 tools and 60 recipes.')
} finally {
  await client.close()
}
