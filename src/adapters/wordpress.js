import { createMotionController, resolveMotionRoot } from './shared.js'

export function createWordPressMotion(options = {}) {
  const ownerDocument = options.document ?? globalThis.document
  if (!ownerDocument) return { runtime: undefined, mount() {}, refresh() {}, destroy() {} }
  const controller = createMotionController()
  let destroyed = false

  const mount = (nextRoot) => {
    if (destroyed) return undefined
    const requested = nextRoot?.nodeType ? nextRoot : (typeof options.root === 'function' ? options.root() : options.root)
    const root = typeof requested === 'string' ? ownerDocument.querySelector(requested) : resolveMotionRoot(requested) ?? ownerDocument
    const { document: _document, root: _root, ...runtimeOptions } = options
    return controller.mount(root, runtimeOptions)
  }
  const onMount = (event) => mount(event.detail?.root)
  const onRefresh = () => controller.refresh()
  ownerDocument.addEventListener('sf:motion:mount', onMount)
  ownerDocument.addEventListener('sf:motion:refresh', onRefresh)
  if (ownerDocument.readyState === 'loading') ownerDocument.addEventListener('DOMContentLoaded', mount, { once: true })
  else mount()

  return {
    get runtime() { return controller.runtime },
    mount,
    refresh: onRefresh,
    destroy() {
      destroyed = true
      ownerDocument.removeEventListener('DOMContentLoaded', mount)
      ownerDocument.removeEventListener('sf:motion:mount', onMount)
      ownerDocument.removeEventListener('sf:motion:refresh', onRefresh)
      controller.destroy()
    },
  }
}
