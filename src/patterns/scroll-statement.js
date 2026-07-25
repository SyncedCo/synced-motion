import { numberAttribute } from '../core/options.js'

export function createScrollStatements({ gsap, ScrollTrigger, root, reduced }) {
  if (reduced) return []

  return [...root.querySelectorAll('[data-sf-scroll-statement]')].map((scene) => {
    const pin = scene.querySelector('[data-sf-statement-pin]')
    const heading = scene.querySelector('[data-sf-statement-heading]')
    const lead = scene.querySelector('[data-sf-statement-lead]')
    const heroAccent = scene.querySelector('[data-sf-statement-hero-accent]')
    const inlineAccent = scene.querySelector('[data-sf-statement-inline-accent]')
    const details = scene.querySelector('[data-sf-statement-details]')
    const detailItems = [...scene.querySelectorAll('[data-sf-statement-detail]')]
    const label = scene.querySelector('[data-sf-statement-label]')

    if (!pin || !heading || !lead || !heroAccent || !inlineAccent || !details) return null

    gsap.set(heroAccent, { autoAlpha: 1, scale: 9 })
    gsap.set(heading, { xPercent: -50 })
    gsap.set(lead, { opacity: 0 })
    gsap.set(inlineAccent, { opacity: 0, xPercent: 50 })
    gsap.set(details, { height: 0 })
    gsap.set(detailItems, { autoAlpha: 0, yPercent: 50 })
    gsap.set(label, { autoAlpha: 0 })

    const timeline = gsap.timeline({
      scrollTrigger: {
        trigger: scene,
        start: 'clamp(top top)',
        end: 'clamp(bottom bottom)',
        scrub: numberAttribute(scene, 'data-sf-scrub', 0.8),
        invalidateOnRefresh: true,
      },
    })

    timeline
      .to(heroAccent, { scale: 1, duration: 0.2, ease: 'none' }, 0)
      .to(inlineAccent, { opacity: 1, duration: 0.07, ease: 'none' }, 0.18)
      .to(heroAccent, { autoAlpha: 0, duration: 0.05, ease: 'none' }, 0.2)
      .to(heading, { xPercent: 0, duration: 0.08, ease: 'none' }, 0.26)
      .to(inlineAccent, { xPercent: 0, duration: 0.08, ease: 'none' }, 0.26)
      .to(lead, { opacity: 1, duration: 0.06, ease: 'none' }, 0.28)
      .to(details, { height: 'auto', duration: 0.1, ease: 'none' }, 0.34)
      .to(detailItems, { autoAlpha: 1, yPercent: 0, duration: 0.1, ease: 'none', stagger: 0.1 }, 0.4)
      .to(label, { autoAlpha: 1, duration: 0.31, ease: 'none' }, 0.5)

    return () => {
      timeline.scrollTrigger?.kill()
      timeline.revert?.()
      timeline.kill()
      gsap.set([heroAccent, heading, lead, inlineAccent, details, ...detailItems, label].filter(Boolean), {
        clearProps: 'transform,opacity,visibility,height',
      })
    }
  }).filter(Boolean)
}
