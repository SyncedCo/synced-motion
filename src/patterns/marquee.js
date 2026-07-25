import { numberAttribute } from '../core/options.js'

export function createMarquees({ gsap, root, reduced }) {
  if (reduced) return []

  return [...root.querySelectorAll('[data-motion-marquee]')].map((marquee) => {
    const track = [...marquee.children].find((child) => child.hasAttribute('data-motion-marquee-track'))
    if (!track) return null

    const direction = marquee.getAttribute('data-motion-marquee-direction') === 'right' ? 1 : -1
    const duration = Math.max(0.1, numberAttribute(marquee, 'data-motion-marquee-duration', 28))
    const start = direction === 1 ? -50 : 0
    const end = direction === 1 ? 0 : -50
    const tween = gsap.fromTo(
      track,
      { xPercent: start },
      {
        xPercent: end,
        duration,
        ease: 'none',
        repeat: -1,
      },
    )

    const IntersectionObserver = marquee.ownerDocument.defaultView?.IntersectionObserver
    const observer = IntersectionObserver
      ? new IntersectionObserver(([entry]) => tween.paused(!entry.isIntersecting))
      : null

    observer?.observe(marquee)

    return () => {
      observer?.disconnect()
      tween.revert()
    }
  }).filter(Boolean)
}
