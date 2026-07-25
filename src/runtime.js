import { mergeOptions } from './core/options.js'
import { createDefaultMotionRuntime } from './default-runtime.js'
import { createLenisAdapter } from './lenis.js'

export function createSyncedMotion(options = {}) {
  if (typeof document === 'undefined') throw new Error('Synced Motion requires a browser document.')

  const settings = mergeOptions(options)
  const root = settings.root || document
  const ownerDocument = root.nodeType === 9 ? root : root.ownerDocument
  const view = ownerDocument.defaultView
  const parameterOverrides = {
    'reveal-rise': { start: settings.revealStart },
    'reveal-stagger-cascade': { start: settings.revealStart },
    'split-lines-rise': { start: settings.revealStart },
    'split-words-cascade': { start: settings.revealStart },
    ...settings.parameterOverrides,
  }
  const runtime = createDefaultMotionRuntime({
    root,
    debug: settings.debug,
    reducedMotionQuery: settings.reducedMotionQuery,
    reducedMotion: settings.reducedMotion,
    parameterOverrides,
    dependencies: settings.dependencies,
    strict: settings.strict,
  })

  const systemReduced = Boolean(view?.matchMedia?.(settings.reducedMotionQuery).matches)
  const smoothScroll = settings.smoothScroll && settings.reducedMotion !== 'reduce' && !systemReduced
    ? createLenisAdapter({
      gsap: runtime.gsap,
      ScrollTrigger: runtime.ScrollTrigger,
      options: typeof settings.smoothScroll === 'object' ? settings.smoothScroll : {},
    })
    : undefined

  let destroyed = false
  // Guarded so a font-loading or load event that resolves after teardown
  // cannot refresh a destroyed runtime.
  const refresh = () => {
    if (destroyed) return
    runtime.refresh()
  }
  if (ownerDocument.fonts?.ready) ownerDocument.fonts.ready.then(refresh)
  view?.addEventListener('load', refresh, { once: true })

  return Object.freeze({
    gsap: runtime.gsap,
    ScrollTrigger: runtime.ScrollTrigger,
    registry: runtime.registry,
    smoothScroll,
    inspect: runtime.inspect,
    mountRecipe: runtime.mountRecipe,
    refresh,
    destroy() {
      destroyed = true
      view?.removeEventListener('load', refresh)
      smoothScroll?.destroy()
      runtime.destroy()
      ownerDocument.documentElement.removeAttribute('data-sf-scroll-locked')
    },
  })
}
