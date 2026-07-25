import { clampIndex } from '../core/options.js'
import { setActiveState } from '../core/state.js'

function createPinnedSequences({ ScrollTrigger, root, debug, reduced, selector, itemSelector, visualSelector }) {
  if (reduced) return []
  return [...root.querySelectorAll(selector)].map((scene) => {
    const pin = scene.querySelector('[data-sf-pin-target]')
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
      end: scene.getAttribute('data-sf-end') || 'bottom bottom',
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
    selector: '[data-sf-pinned-chapters]',
    itemSelector: '[data-sf-pinned-chapter]',
    visualSelector: '[data-sf-pinned-visual]',
  })
}

export function createPinnedProductExplainers(context) {
  return createPinnedSequences({
    ...context,
    selector: '[data-sf-product-explainer]',
    itemSelector: '[data-sf-product-step]',
    visualSelector: '[data-sf-product-media]',
  })
}
