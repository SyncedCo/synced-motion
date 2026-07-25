import { describe, expect, it, vi } from 'vitest'
import { createAstroMotion } from '../src/adapters/astro.js'
import { syncedMotion } from '../src/adapters/svelte.js'
import { createWordPressMotion } from '../src/adapters/wordpress.js'
import { useSyncedMotion as useReactSyncedMotion } from '../src/adapters/react.js'
import { useSyncedMotion as useVueSyncedMotion } from '../src/adapters/vue.js'

function dependencies() {
  let cleanup
  const media = {
    add: vi.fn((_conditions, callback) => { cleanup = callback({ conditions: { reduce: false, motion: true } }) }),
    revert: vi.fn(() => cleanup?.()),
  }
  return {
    gsap: { matchMedia: vi.fn(() => media) },
    ScrollTrigger: { refresh: vi.fn() },
  }
}

describe('framework adapters', () => {
  it('ships loadable React and Vue lifecycle hooks as optional entry points', () => {
    expect(useReactSyncedMotion).toBeTypeOf('function')
    expect(useVueSyncedMotion).toBeTypeOf('function')
  })

  it('mounts, updates, refreshes, and destroys through the Svelte action contract', () => {
    const node = document.createElement('section')
    document.body.append(node)
    const first = dependencies()
    const action = syncedMotion(node, { dependencies: first })
    expect(action.runtime.inspect().active).toBe(true)
    action.refresh()
    expect(first.ScrollTrigger.refresh).toHaveBeenCalledOnce()

    const second = dependencies()
    action.update({ dependencies: second })
    expect(first.gsap.matchMedia.mock.results[0].value.revert).toHaveBeenCalledOnce()
    action.destroy()
    expect(second.gsap.matchMedia.mock.results[0].value.revert).toHaveBeenCalledOnce()
  })

  it('remounts around Astro view-transition lifecycle events and removes listeners', () => {
    const deps = dependencies()
    const adapter = createAstroMotion({ document, dependencies: deps })
    document.dispatchEvent(new Event('DOMContentLoaded'))
    expect(adapter.runtime?.inspect().active).toBe(true)
    document.dispatchEvent(new Event('astro:before-swap'))
    expect(adapter.runtime).toBeUndefined()
    document.dispatchEvent(new Event('astro:page-load'))
    expect(adapter.runtime?.inspect().active).toBe(true)
    adapter.destroy()
    expect(adapter.runtime).toBeUndefined()
  })

  it('supports WordPress DOM-ready and dynamic-root remount events without globals', () => {
    const deps = dependencies()
    const adapter = createWordPressMotion({ document, dependencies: deps })
    document.dispatchEvent(new Event('DOMContentLoaded'))
    expect(adapter.runtime?.inspect().active).toBe(true)
    const root = document.createElement('main')
    document.body.append(root)
    document.dispatchEvent(new CustomEvent('sf:motion:mount', { detail: { root } }))
    expect(adapter.runtime?.inspect().active).toBe(true)
    document.dispatchEvent(new Event('sf:motion:refresh'))
    expect(deps.ScrollTrigger.refresh).toHaveBeenCalledOnce()
    adapter.destroy()
    expect(adapter.runtime).toBeUndefined()
  })
})
