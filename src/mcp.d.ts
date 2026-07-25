import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
import type { Transport } from '@modelcontextprotocol/sdk/shared/transport.js'

export interface MotionToolHandlers {
  catalog(): Promise<unknown>
  recipe(input: { id: string }): Promise<unknown>
  suggest(input: { brief: string; limit?: number }): Promise<unknown>
  validate(input?: { recipe?: Record<string, unknown> }): Promise<unknown>
  plan(input: { ids: string[] }): Promise<unknown>
  scan(input: { markup: string }): Promise<unknown>
  compose(input: { brief: string; markup?: string; limit?: number }): Promise<unknown>
}

export declare function createMotionToolHandlers(service?: Record<string, (...args: any[]) => any>): Readonly<MotionToolHandlers>
export declare function createMotionMcpServer(options?: { service?: Record<string, (...args: any[]) => any> }): McpServer
export declare function startMotionMcpServer(options?: { service?: Record<string, (...args: any[]) => any>; transport?: Transport }): Promise<McpServer>
