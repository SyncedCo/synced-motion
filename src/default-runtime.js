import { createMotionRuntime } from './recipe-runtime.js'
import { createBuiltinMotionRegistry } from './recipes/builtins.js'

export function createDefaultMotionRuntime(options = {}) {
  return createMotionRuntime({
    ...options,
    registry: options.registry ?? createBuiltinMotionRegistry(),
  })
}
