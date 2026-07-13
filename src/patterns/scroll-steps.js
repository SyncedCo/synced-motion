import { clampIndex } from '../core/options.js'
import { setActiveState } from '../core/state.js'

export function createScrollSteps({ ScrollTrigger, root, debug, reduced }) {
  return [...root.querySelectorAll('[data-sf-scroll-steps]')].map((scene) => {
    const links = [...scene.querySelectorAll('[data-sf-step-link]')]
    const panels = [...scene.querySelectorAll('[data-sf-step-panel]')]
    const pin = scene.querySelector('[data-sf-pin-target]')

    const activate = (index) => {
      setActiveState(links, index, { ariaCurrent: true })
      setActiveState(panels, index)
      scene.style.setProperty('--sf-motion-step', String(index))
      scene.dispatchEvent(new CustomEvent('sfmotion:step', { detail: { index } }))
    }

    activate(0)
    if (reduced) return { kill() {} }

    return ScrollTrigger.create({
      trigger: scene,
      start: scene.dataset.sfStart || 'top top',
      end: scene.dataset.sfEnd || 'bottom bottom',
      pin: pin || false,
      pinSpacing: scene.dataset.sfPinSpacing !== 'false',
      scrub: true,
      markers: debug,
      onUpdate(self) {
        activate(clampIndex(self.progress, Math.max(links.length, panels.length)))
      },
    })
  })
}

