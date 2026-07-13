import { numberAttribute } from '../core/options.js'

export function createParallax({ gsap, root, debug, reduced }) {
  if (reduced) return []

  return [...root.querySelectorAll('[data-sf-parallax]')].map((element) => {
    const distance = numberAttribute(element, 'data-sf-parallax', 12)

    return gsap.fromTo(
      element,
      { yPercent: -distance },
      {
        yPercent: distance,
        ease: 'none',
        scrollTrigger: {
          trigger: element.closest('[data-sf-parallax-scene]') || element,
          start: 'top bottom',
          end: 'bottom top',
          scrub: numberAttribute(element, 'data-sf-scrub', 0.6),
          markers: debug,
        },
      },
    )
  })
}

