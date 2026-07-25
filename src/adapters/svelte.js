import { createMotionController } from './shared.js'

export function syncedMotion(node, options = {}) {
  const controller = createMotionController(node, options)
  controller.mount()
  return {
    get runtime() { return controller.runtime },
    update(nextOptions = {}) { controller.mount(node, nextOptions) },
    refresh() { controller.refresh() },
    destroy() { controller.destroy() },
  }
}
