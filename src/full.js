import { createSyncedMotion as createCoreSyncedMotion } from './runtime.js'
import { createDefaultMotionRuntime as createCoreDefaultMotionRuntime } from './default-runtime.js'
import { motionPlugins } from './plugins.js'

/**
 * Batteries-included entry point.
 *
 * `@syncedco/motion` ships gsap and ScrollTrigger only, so the forty-three
 * recipes that need nothing else stay cheap. Swap the import specifier to
 * `@syncedco/motion/full` to enable all sixty, at the cost of bundling
 * SplitText, Flip, DrawSVG, MorphSVG and MotionPath.
 */
export function createSyncedMotion(options = {}) {
  return createCoreSyncedMotion({
    ...options,
    dependencies: { ...motionPlugins, ...options.dependencies },
  })
}

export function createDefaultMotionRuntime(options = {}) {
  return createCoreDefaultMotionRuntime({
    ...options,
    dependencies: { ...motionPlugins, ...options.dependencies },
  })
}

export { motionPlugins } from './plugins.js'
export * from './index.js'
