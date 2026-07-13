import { numberAttribute } from '../core/options.js'

export function createStaggers({ gsap, root, debug, reduced, revealStart }) {
  return [...root.querySelectorAll('[data-sf-stagger]')].map((container) => {
    const selector = container.dataset.sfStaggerTarget || ':scope > *'
    const targets = [...container.querySelectorAll(selector)]
    if (targets.length === 0) return null

    if (reduced) {
      gsap.set(targets, { clearProps: 'all', autoAlpha: 1 })
      return null
    }

    return gsap.from(targets, {
      autoAlpha: 0,
      y: container.dataset.sfDistance || '1.5rem',
      duration: numberAttribute(container, 'data-sf-duration', 0.7),
      stagger: numberAttribute(container, 'data-sf-stagger', 0.09),
      ease: container.dataset.sfEase || 'power3.out',
      scrollTrigger: {
        trigger: container,
        start: container.dataset.sfStart || revealStart,
        once: container.dataset.sfOnce !== 'false',
        markers: debug,
      },
    })
  }).filter(Boolean)
}
