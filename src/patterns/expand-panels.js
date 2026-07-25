import { setActiveState } from '../core/state.js'

export function createExpandPanels({ root }) {
  return [...root.querySelectorAll('[data-motion-expand-group]')].map((group) => {
    const panels = [...group.querySelectorAll('[data-motion-expand-panel]')]
    const requestedDefault = Number.parseInt(group.dataset.motionExpandDefault || '0', 10)
    const defaultIndex = Math.min(panels.length - 1, Math.max(0, requestedDefault))
    const cleanups = []

    const activate = (index) => {
      setActiveState(panels, index)
      group.style.setProperty('--motion-panel', String(index))
      group.dispatchEvent(new CustomEvent('sfmotion:panel', { detail: { index } }))
    }

    panels.forEach((panel, index) => {
      const enter = () => activate(index)
      panel.addEventListener('pointerenter', enter)
      panel.addEventListener('focusin', enter)
      cleanups.push(() => {
        panel.removeEventListener('pointerenter', enter)
        panel.removeEventListener('focusin', enter)
      })
    })

    activate(defaultIndex)
    return () => cleanups.forEach((cleanup) => cleanup())
  })
}

