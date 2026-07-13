import { numberAttribute } from '../core/options.js'

const presets = {
  fade: { autoAlpha: 0 },
  up: { autoAlpha: 0, y: '2rem' },
  down: { autoAlpha: 0, y: '-2rem' },
  left: { autoAlpha: 0, x: '2rem' },
  right: { autoAlpha: 0, x: '-2rem' },
  scale: { autoAlpha: 0, scale: 0.94 },
}

export function createReveals({ gsap, root, debug, reduced, revealStart }) {
  return [...root.querySelectorAll('[data-sf-reveal]')].map((element) => {
    if (reduced) {
      gsap.set(element, { clearProps: 'all', autoAlpha: 1 })
      return null
    }

    const preset = presets[element.dataset.sfReveal] ?? presets.up
    const duration = numberAttribute(element, 'data-sf-duration', 0.8)
    const delay = numberAttribute(element, 'data-sf-delay', 0)

    return gsap.from(element, {
      ...preset,
      duration,
      delay,
      ease: element.dataset.sfEase || 'power3.out',
      scrollTrigger: {
        trigger: element,
        start: element.dataset.sfStart || revealStart,
        once: element.dataset.sfOnce !== 'false',
        markers: debug,
      },
    })
  }).filter(Boolean)
}
