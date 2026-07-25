import { clampIndex } from '../core/options.js'
import { setActiveState } from '../core/state.js'

function createPinnedSequences({ ScrollTrigger, root, debug, reduced, selector, itemSelector, visualSelector }) {
  if (reduced) return []
  return [...root.querySelectorAll(selector)].map((scene) => {
    const pin = scene.querySelector('[data-motion-pin-target]')
    const items = [...scene.querySelectorAll(itemSelector)]
    const visuals = [...scene.querySelectorAll(visualSelector)]
    if (!pin || !items.length) return undefined

    const activate = (index) => {
      setActiveState(items, index, { ariaCurrent: true })
      if (visuals.length) setActiveState(visuals, Math.min(index, visuals.length - 1))
    }
    activate(0)
    const instance = ScrollTrigger.create({
      trigger: scene,
      start: 'top top',
      end: scene.getAttribute('data-motion-end') || 'bottom bottom',
      pin,
      markers: debug,
      onUpdate(self) { activate(clampIndex(self.progress, items.length)) },
    })
    return () => {
      instance.kill()
      items.forEach((item) => { item.removeAttribute('data-active'); item.removeAttribute('aria-current') })
      visuals.forEach((visual) => visual.removeAttribute('data-active'))
    }
  }).filter(Boolean)
}

export function createPinnedChapterCrossfades(context) {
  return createPinnedSequences({
    ...context,
    selector: '[data-motion-pinned-chapters]',
    itemSelector: '[data-motion-pinned-chapter]',
    visualSelector: '[data-motion-pinned-visual]',
  })
}

export function createPinnedProductExplainers(context) {
  return createPinnedSequences({
    ...context,
    selector: '[data-motion-product-explainer]',
    itemSelector: '[data-motion-product-step]',
    visualSelector: '[data-motion-product-media]',
  })
}
