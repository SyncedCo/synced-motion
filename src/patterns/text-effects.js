import { numberAttribute } from '../core/options.js'

function trigger(element, debug) {
  return {
    trigger: element,
    start: element.getAttribute('data-motion-start') || 'top 85%',
    once: true,
    markers: debug,
  }
}

function splitCleanup(split, tween) {
  return () => {
    tween?.scrollTrigger?.kill()
    tween?.revert?.()
    tween?.kill?.()
    split.revert()
  }
}

export function createCharacterShimmers({ gsap, SplitText, root, debug, reduced }) {
  if (reduced) return []
  return [...root.querySelectorAll('[data-motion-chars-shimmer]')].map((element) => {
    const accessibleText = element.getAttribute('aria-label') || element.textContent.trim()
    const split = SplitText.create(element, { type: 'chars', aria: 'auto' })
    if (accessibleText) element.setAttribute('aria-label', accessibleText)
    const tween = gsap.from(split.chars, {
      autoAlpha: 0,
      yPercent: 35,
      duration: numberAttribute(element, 'data-motion-duration', 0.55),
      stagger: { amount: numberAttribute(element, 'data-motion-stagger-amount', 0.45), from: 'start' },
      ease: 'power2.out',
      scrollTrigger: trigger(element, debug),
    })
    return splitCleanup(split, tween)
  })
}

export function createTypewriterAnnouncements({ gsap, SplitText, root, debug, reduced }) {
  if (reduced) return []
  return [...root.querySelectorAll('[data-motion-typewriter]')].map((element) => {
    const accessibleText = element.getAttribute('aria-label') || element.textContent.trim()
    const split = SplitText.create(element, { type: 'chars', aria: 'auto' })
    if (accessibleText) element.setAttribute('aria-label', accessibleText)
    const tween = gsap.from(split.chars, {
      autoAlpha: 0,
      duration: 0.01,
      stagger: numberAttribute(element, 'data-motion-typewriter-speed', 0.035),
      ease: 'none',
      scrollTrigger: element.hasAttribute('data-motion-typewriter-load') ? undefined : trigger(element, debug),
    })
    return splitCleanup(split, tween)
  })
}

export function createTextHighlightSweeps({ gsap, root, debug, reduced }) {
  if (reduced) return []
  return [...root.querySelectorAll('[data-motion-text-highlight]')].map((scene) => {
    const mark = scene.querySelector('[data-motion-text-highlight-mark]')
    if (!mark) return undefined
    return gsap.from(mark, {
      scaleX: 0,
      transformOrigin: scene.getAttribute('data-motion-text-highlight') === 'end' ? 'right center' : 'left center',
      duration: numberAttribute(scene, 'data-motion-duration', 0.7),
      ease: 'power2.inOut',
      clearProps: 'transform',
      scrollTrigger: trigger(scene, debug),
    })
  }).filter(Boolean)
}
