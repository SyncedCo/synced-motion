import { numberAttribute } from '../core/options.js'

export function createScrollDrifts({ gsap, root, debug, reduced }) {
  if (reduced) return []

  return [...root.querySelectorAll('[data-sf-scroll-drift]')].map((scene) => {
    const layer = scene.querySelector('[data-sf-drift-layer]')
    if (!layer) return null

    return gsap.fromTo(
      layer,
      { autoAlpha: 0, xPercent: numberAttribute(scene, 'data-sf-drift-from', 10) },
      {
        autoAlpha: numberAttribute(scene, 'data-sf-drift-opacity', 0.1),
        xPercent: 0,
        duration: 0.5,
        ease: 'none',
        scrollTrigger: {
          trigger: scene,
          start: 'clamp(top bottom)',
          end: 'clamp(bottom top)',
          scrub: numberAttribute(scene, 'data-sf-scrub', 0.8),
          markers: debug,
        },
      },
    )
  }).filter(Boolean)
}
