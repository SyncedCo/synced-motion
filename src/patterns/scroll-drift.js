import { numberAttribute } from '../core/options.js'

export function createScrollDrifts({ gsap, root, debug, reduced }) {
  if (reduced) return []

  return [...root.querySelectorAll('[data-motion-scroll-drift]')].map((scene) => {
    const layer = scene.querySelector('[data-motion-drift-layer]')
    if (!layer) return null

    return gsap.fromTo(
      layer,
      { autoAlpha: 0, xPercent: numberAttribute(scene, 'data-motion-drift-from', 10) },
      {
        autoAlpha: numberAttribute(scene, 'data-motion-drift-opacity', 0.1),
        xPercent: 0,
        duration: 0.5,
        ease: 'none',
        scrollTrigger: {
          trigger: scene,
          start: 'clamp(top bottom)',
          end: 'clamp(bottom top)',
          scrub: numberAttribute(scene, 'data-motion-scrub', 0.8),
          markers: debug,
        },
      },
    )
  }).filter(Boolean)
}
