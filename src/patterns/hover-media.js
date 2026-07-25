import { setActiveState } from '../core/state.js'

export function createHoverMedia({ root }) {
  return [...root.querySelectorAll('[data-motion-hover-group]')].map((group) => {
    const triggers = [...group.querySelectorAll('[data-motion-hover-key]')]
    const media = [...group.querySelectorAll('[data-motion-hover-media]')]
    const cleanups = []

    const activate = (key) => {
      setActiveState(triggers, triggers.findIndex((item) => item.dataset.motionHoverKey === key))
      setActiveState(media, media.findIndex((item) => item.dataset.motionHoverMedia === key))
    }

    triggers.forEach((trigger) => {
      const enter = () => activate(trigger.dataset.motionHoverKey)
      trigger.addEventListener('pointerenter', enter)
      trigger.addEventListener('focus', enter)
      cleanups.push(() => {
        trigger.removeEventListener('pointerenter', enter)
        trigger.removeEventListener('focus', enter)
      })
    })

    if (triggers[0]) activate(triggers[0].dataset.motionHoverKey)
    return () => cleanups.forEach((cleanup) => cleanup())
  })
}

