import { numberAttribute } from '../core/options.js'

const directions = {
  left: { xPercent: -8, yPercent: 0 },
  right: { xPercent: 8, yPercent: 0 },
  down: { xPercent: 0, yPercent: -12 },
  up: { xPercent: 0, yPercent: 12 },
}

function viewportConfig(element, debug) {
  return {
    trigger: element,
    start: element.getAttribute('data-motion-start') || 'top 85%',
    once: true,
    markers: debug,
  }
}

export function createDirectionalReveals({ gsap, root, debug, reduced }) {
  if (reduced) return []
  return [...root.querySelectorAll('[data-motion-reveal-directional]')].map((element) => {
    const direction = directions[element.getAttribute('data-motion-reveal-directional')] ?? directions.up
    return gsap.from(element, {
      autoAlpha: 0,
      ...direction,
      duration: numberAttribute(element, 'data-motion-duration', 0.7),
      ease: 'power2.out',
      clearProps: 'transform,opacity,visibility',
      scrollTrigger: viewportConfig(element, debug),
    })
  })
}

export function createScaleReveals({ gsap, root, debug, reduced }) {
  if (reduced) return []
  return [...root.querySelectorAll('[data-motion-reveal-scale]')].map((element) => gsap.from(element, {
    autoAlpha: 0,
    scale: numberAttribute(element, 'data-motion-reveal-scale', 0.94),
    transformOrigin: element.getAttribute('data-motion-origin') || '50% 50%',
    duration: numberAttribute(element, 'data-motion-duration', 0.75),
    ease: 'power2.out',
    clearProps: 'transform,opacity,visibility',
    scrollTrigger: viewportConfig(element, debug),
  }))
}

export function createClipWipeReveals({ gsap, root, debug, reduced }) {
  if (reduced) return []
  return [...root.querySelectorAll('[data-motion-reveal-clip]')].map((scene) => {
    const content = scene.querySelector('[data-motion-reveal-clip-content]') ?? scene
    const direction = scene.getAttribute('data-motion-reveal-clip') || 'start'
    const clipPath = direction === 'end' ? 'inset(0 0 0 100%)' : 'inset(0 100% 0 0)'
    return gsap.from(content, {
      clipPath,
      duration: numberAttribute(scene, 'data-motion-duration', 0.9),
      ease: 'power3.inOut',
      clearProps: 'clipPath',
      scrollTrigger: viewportConfig(scene, debug),
    })
  })
}
