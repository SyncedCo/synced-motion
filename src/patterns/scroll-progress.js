export function createScrollProgressMeters({ gsap, root, debug, reduced }) {
  if (reduced) return []
  return [...root.querySelectorAll('[data-sf-scroll-progress]')].map((scene) => {
    const meter = scene.querySelector('[data-sf-scroll-progress-meter]')
    const label = scene.querySelector('[data-sf-scroll-progress-label]')
    if (!meter) return undefined
    return gsap.fromTo(meter, { scaleX: 0 }, {
      scaleX: 1,
      transformOrigin: 'left center',
      ease: 'none',
      scrollTrigger: {
        trigger: scene,
        start: scene.getAttribute('data-sf-start') || 'top bottom',
        end: scene.getAttribute('data-sf-end') || 'bottom top',
        scrub: true,
        markers: debug,
        onUpdate(self) {
          if (label) label.textContent = `${Math.round(self.progress * 100)}%`
        },
      },
    })
  }).filter(Boolean)
}

export function createScrollDepthStacks({ gsap, root, debug, reduced }) {
  if (reduced) return []
  return [...root.querySelectorAll('[data-sf-scroll-depth-stack]')].map((scene) => {
    const cards = [...scene.querySelectorAll('[data-sf-depth-card]')]
    if (!cards.length) return undefined
    return gsap.from(cards, {
      autoAlpha: 0,
      yPercent: 12,
      scale: 0.96,
      stagger: 0.08,
      duration: 0.7,
      ease: 'power2.out',
      scrollTrigger: { trigger: scene, start: 'top 85%', once: true, markers: debug },
    })
  }).filter(Boolean)
}
