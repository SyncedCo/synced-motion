import { nextTick, onMounted, onUnmounted, shallowRef, unref } from 'vue'
import { createMotionController } from './shared.js'

export function useSyncedMotion(rootRef, options = {}) {
  const runtime = shallowRef()
  let controller

  const mount = async () => {
    await nextTick()
    const root = unref(rootRef)
    if (!root) return undefined
    controller?.destroy()
    controller = createMotionController(root, options)
    runtime.value = controller.mount()
    return runtime.value
  }
  const refresh = () => controller?.refresh()
  const destroy = () => {
    controller?.destroy()
    controller = undefined
    runtime.value = undefined
  }

  onMounted(mount)
  onUnmounted(destroy)
  return { runtime, mount, refresh, destroy }
}
