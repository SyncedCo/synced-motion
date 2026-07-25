import { clampIndex } from '../core/options.js'
import { setActiveState } from '../core/state.js'

export function createScrollSteps({ ScrollTrigger, root, debug, reduced }) {
  return [...root.querySelectorAll('[data-motion-scroll-steps]')].map((scene) => {
    const links = [...scene.querySelectorAll('[data-motion-step-link]')]
    const panels = [...scene.querySelectorAll('[data-motion-step-panel]')]
    const pin = scene.querySelector('[data-motion-pin-target]')

    const activate = (index) => {
      setActiveState(links, index, { ariaCurrent: true })
      setActiveState(panels, index)
      scene.style.setProperty('--motion-step', String(index))
      scene.dispatchEvent(new CustomEvent('sfmotion:step', { detail: { index } }))
    }

    activate(0)
    if (reduced) return { kill() {} }

    return ScrollTrigger.create({
      trigger: scene,
      start: scene.dataset.motionStart || 'top top',
      end: scene.dataset.motionEnd || 'bottom bottom',
      pin: pin || false,
      pinSpacing: scene.dataset.motionPinSpacing !== 'false',
      scrub: true,
      markers: debug,
      onUpdate(self) {
        activate(clampIndex(self.progress, Math.max(links.length, panels.length)))
      },
    })
  })
}

