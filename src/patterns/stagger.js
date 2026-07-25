import { numberAttribute } from '../core/options.js'

export function createStaggers({ gsap, root, debug, reduced, revealStart }) {
  return [...root.querySelectorAll('[data-motion-stagger]')].map((container) => {
    const selector = container.dataset.motionStaggerTarget || ':scope > *'
    const targets = [...container.querySelectorAll(selector)]
    if (targets.length === 0) return null

    if (reduced) {
      gsap.set(targets, { clearProps: 'all', autoAlpha: 1 })
      return null
    }

    return gsap.from(targets, {
      autoAlpha: 0,
      y: container.dataset.motionDistance || '1.5rem',
      duration: numberAttribute(container, 'data-motion-duration', 0.7),
      stagger: numberAttribute(container, 'data-motion-stagger', 0.09),
      ease: container.dataset.motionEase || 'power3.out',
      scrollTrigger: {
        trigger: container,
        start: container.dataset.motionStart || revealStart,
        once: container.dataset.motionOnce !== 'false',
        markers: debug,
      },
    })
  }).filter(Boolean)
}
