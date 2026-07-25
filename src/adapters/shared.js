import { createDefaultMotionRuntime } from '../default-runtime.js'

export function resolveMotionRoot(value) {
  return value?.current ?? value?.value ?? value
}

export function createMotionController(initialRoot, initialOptions = {}) {
  let runtime
  let root = initialRoot
  let options = initialOptions

  const controller = {
    get runtime() { return runtime },
    mount(nextRoot = root, nextOptions = options) {
      controller.destroy()
      root = resolveMotionRoot(nextRoot)
      options = nextOptions ?? {}
      if (!root?.ownerDocument && root?.nodeType !== 9) return undefined
      runtime = createDefaultMotionRuntime({ ...options, root })
      return runtime
    },
    refresh() { runtime?.refresh() },
    destroy() {
      runtime?.destroy()
      runtime = undefined
    },
  }
  return controller
}
