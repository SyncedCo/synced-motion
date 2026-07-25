import { describeBuiltinSpecs } from './authoring.js'
import { createMotionRegistry } from './registry.js'

/**
 * Complete, documentation-grade manifests for the sixty built-in recipes.
 *
 * These carry prose, preview and fixture metadata and are what the CLI, MCP
 * server, gallery and inspector consume. Browser bundles should import
 * `createRuntimeMotionRegistry` from './runtime-registry.js' instead, which
 * omits roughly sixty percent of this payload.
 */
export const builtinMotionRecipes = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ describeBuiltinSpecs())

export function createBuiltinMotionRegistry() {
  return createMotionRegistry(builtinMotionRecipes)
}
