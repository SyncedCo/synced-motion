export function createScrollExits({ gsap, root, debug, reduced }) {
  if (reduced) return []

  return [...root.querySelectorAll('[data-motion-scroll-exit]')].map((element) => {
    const direction = element.dataset.motionScrollExit || 'down'
    const distance = element.dataset.motionExitDistance || '8rem'
    const movement = direction === 'up' ? `-${distance}` : distance
    const scene = element.closest('[data-motion-scroll-exit-scene]') || element

    return gsap.to(element, {
      autoAlpha: 0,
      y: movement,
      ease: 'none',
      scrollTrigger: {
        trigger: scene,
        start: element.dataset.motionExitStart || 'top top',
        end: element.dataset.motionExitEnd || 'bottom 35%',
        scrub: Number.parseFloat(element.dataset.motionScrub || '0.45'),
        markers: debug,
      },
    })
  })
}

