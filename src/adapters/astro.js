import { createMotionController, resolveMotionRoot } from './shared.js'

export function createAstroMotion(options = {}) {
  const ownerDocument = options.document ?? globalThis.document
  if (!ownerDocument) return { runtime: undefined, mount() {}, refresh() {}, destroy() {} }
  const controller = createMotionController()
  let destroyed = false

  const resolveRoot = () => {
    const requested = typeof options.root === 'function' ? options.root() : options.root
    if (typeof requested === 'string') return ownerDocument.querySelector(requested)
    return resolveMotionRoot(requested) ?? ownerDocument
  }
  const mount = () => {
    if (destroyed) return undefined
    const { document: _document, root: _root, ...runtimeOptions } = options
    return controller.mount(resolveRoot(), runtimeOptions)
  }
  const beforeSwap = () => controller.destroy()
  ownerDocument.addEventListener('astro:before-swap', beforeSwap)
  ownerDocument.addEventListener('astro:page-load', mount)
  if (ownerDocument.readyState === 'loading') ownerDocument.addEventListener('DOMContentLoaded', mount, { once: true })
  else mount()

  return {
    get runtime() { return controller.runtime },
    mount,
    refresh: () => controller.refresh(),
    destroy() {
      destroyed = true
      ownerDocument.removeEventListener('DOMContentLoaded', mount)
      ownerDocument.removeEventListener('astro:before-swap', beforeSwap)
      ownerDocument.removeEventListener('astro:page-load', mount)
      controller.destroy()
    },
  }
}
