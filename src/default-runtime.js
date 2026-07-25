import { createMotionRuntime } from './recipe-runtime.js'
import { createRuntimeMotionRegistry } from './recipes/runtime-registry.js'

export function createDefaultMotionRuntime(options = {}) {
  return createMotionRuntime({
    ...options,
    // Lean specs only: authoring prose and fixture markup never reach a page.
    registry: options.registry ?? createRuntimeMotionRegistry(),
  })
}
