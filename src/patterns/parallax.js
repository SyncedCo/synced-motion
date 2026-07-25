import { numberAttribute } from '../core/options.js'

export function createParallax({ gsap, root, debug, reduced }) {
  if (reduced) return []

  return [...root.querySelectorAll('[data-motion-parallax]')].map((element) => {
    const distance = numberAttribute(element, 'data-motion-parallax', 12)

    return gsap.fromTo(
      element,
      { yPercent: -distance },
      {
        yPercent: distance,
        ease: 'none',
        scrollTrigger: {
          trigger: element.closest('[data-motion-parallax-scene]') || element,
          start: 'top bottom',
          end: 'bottom top',
          scrub: numberAttribute(element, 'data-motion-scrub', 0.6),
          markers: debug,
        },
      },
    )
  })
}

