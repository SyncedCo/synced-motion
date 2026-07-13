import { setActiveState } from '../core/state.js'

export function createHoverMedia({ root }) {
  return [...root.querySelectorAll('[data-sf-hover-group]')].map((group) => {
    const triggers = [...group.querySelectorAll('[data-sf-hover-key]')]
    const media = [...group.querySelectorAll('[data-sf-hover-media]')]
    const cleanups = []

    const activate = (key) => {
      setActiveState(triggers, triggers.findIndex((item) => item.dataset.sfHoverKey === key))
      setActiveState(media, media.findIndex((item) => item.dataset.sfHoverMedia === key))
    }

    triggers.forEach((trigger) => {
      const enter = () => activate(trigger.dataset.sfHoverKey)
      trigger.addEventListener('pointerenter', enter)
      trigger.addEventListener('focus', enter)
      cleanups.push(() => {
        trigger.removeEventListener('pointerenter', enter)
        trigger.removeEventListener('focus', enter)
      })
    })

    if (triggers[0]) activate(triggers[0].dataset.sfHoverKey)
    return () => cleanups.forEach((cleanup) => cleanup())
  })
}

