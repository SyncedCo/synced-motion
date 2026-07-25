import { clampIndex } from '../core/options.js'
import { setActiveState } from '../core/state.js'

function distance(track, viewport) {
  return Math.max(0, track.scrollWidth - viewport.clientWidth)
}

function horizontalTween({ gsap, scene, track, viewport, pin, debug, snap, onUpdate }) {
  return gsap.to(track, {
    x: () => -distance(track, viewport),
    ease: 'none',
    scrollTrigger: {
      trigger: scene,
      start: 'top top',
      end: () => `+=${Math.max(1, distance(track, viewport))}`,
      pin,
      scrub: 1,
      invalidateOnRefresh: true,
      markers: debug,
      onUpdate,
      ...(snap ? { snap } : {}),
    },
  })
}

function createHorizontalGalleries({ gsap, root, debug, reduced, selector, withSnap = false }) {
  if (reduced) return []
  return [...root.querySelectorAll(selector)].map((scene) => {
    const viewport = scene.querySelector('[data-motion-horizontal-viewport]') ?? scene
    const pin = scene.querySelector('[data-motion-horizontal-pin]') ?? viewport
    const track = scene.querySelector('[data-motion-horizontal-track]')
    const cards = [...scene.querySelectorAll('[data-motion-horizontal-card]')]
    if (!track || !cards.length) return undefined
    const snap = withSnap && cards.length > 1 ? { snapTo: 1 / (cards.length - 1), duration: 0.25, ease: 'power1.inOut' } : undefined
    return horizontalTween({ gsap, scene, track, viewport, pin, debug, snap })
  }).filter(Boolean)
}

export function createHorizontalGalleryScrubs(context) {
  return createHorizontalGalleries({ ...context, selector: '[data-motion-horizontal-gallery]' })
}

export function createHorizontalGallerySnaps(context) {
  return createHorizontalGalleries({ ...context, selector: '[data-motion-horizontal-snap]', withSnap: true })
}

export function createHorizontalFeatureRails({ gsap, root, debug, reduced }) {
  if (reduced) return []
  return [...root.querySelectorAll('[data-motion-horizontal-feature-rail]')].map((scene) => {
    const viewport = scene.querySelector('[data-motion-horizontal-viewport]') ?? scene
    const pin = scene.querySelector('[data-motion-horizontal-pin]') ?? viewport
    const track = scene.querySelector('[data-motion-horizontal-track]')
    const cards = [...scene.querySelectorAll('[data-motion-horizontal-card]')]
    const labels = [...scene.querySelectorAll('[data-motion-horizontal-label]')]
    if (!track || !cards.length) return undefined
    return horizontalTween({
      gsap, scene, track, viewport, pin, debug,
      onUpdate(self) {
        const index = clampIndex(self.progress, cards.length)
        setActiveState(cards, index)
        if (labels.length) setActiveState(labels, Math.min(index, labels.length - 1), { ariaCurrent: true })
      },
    })
  }).filter(Boolean)
}

export function createHorizontalLogoReels({ gsap, root, debug, reduced }) {
  if (reduced) return []
  return [...root.querySelectorAll('[data-motion-horizontal-logo-reel]')].map((scene) => {
    const viewport = scene.querySelector('[data-motion-horizontal-viewport]') ?? scene
    const track = scene.querySelector('[data-motion-horizontal-track]')
    if (!track) return undefined
    return gsap.to(track, {
      x: () => -distance(track, viewport),
      ease: 'none',
      scrollTrigger: { trigger: scene, start: 'top bottom', end: 'bottom top', scrub: 1, invalidateOnRefresh: true, markers: debug },
    })
  }).filter(Boolean)
}

export function createHorizontalComparisonSliders({ root }) {
  return [...root.querySelectorAll('[data-motion-comparison]')].map((scene) => {
    const range = scene.querySelector('[data-motion-comparison-range]')
    const after = scene.querySelector('[data-motion-comparison-after]')
    if (!range || !after) return undefined
    const previous = after.style.clipPath
    const update = () => {
      const value = Math.max(0, Math.min(100, Number(range.value)))
      after.style.clipPath = `inset(0 ${100 - value}% 0 0)`
      scene.setAttribute('data-motion-comparison-value', String(value))
    }
    range.addEventListener('input', update)
    update()
    return () => {
      range.removeEventListener('input', update)
      after.style.clipPath = previous
      scene.removeAttribute('data-motion-comparison-value')
    }
  }).filter(Boolean)
}
