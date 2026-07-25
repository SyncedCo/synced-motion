import { createMotionRegistry } from './registry.js'
import { builtinMotionSpecs } from './specs.js'

/**
 * The registry the browser runtime mounts.
 *
 * It registers the same sixty recipe IDs as `createBuiltinMotionRegistry()`
 * but from lean specs: no titles, descriptions, intents, tags, accessibility
 * prose or fixture markup. Those exist for humans and agents reading the
 * catalog, and are dead weight in a page bundle.
 *
 * To ship only the recipes a page uses, import them individually instead:
 *
 * ```js
 * import { createMotionRuntime, createMotionRegistry } from '@syncedco/motion'
 * import { revealRise, marquee } from '@syncedco/motion/recipes'
 *
 * createMotionRuntime({ registry: createMotionRegistry([revealRise, marquee], { mode: 'runtime' }) })
 * ```
 */
export function createRuntimeMotionRegistry(specs = builtinMotionSpecs) {
  return createMotionRegistry(specs, { mode: 'runtime' })
}
