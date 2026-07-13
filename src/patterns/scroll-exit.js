export function createScrollExits({ gsap, root, debug, reduced }) {
  if (reduced) return []

  return [...root.querySelectorAll('[data-sf-scroll-exit]')].map((element) => {
    const direction = element.dataset.sfScrollExit || 'down'
    const distance = element.dataset.sfExitDistance || '8rem'
    const movement = direction === 'up' ? `-${distance}` : distance
    const scene = element.closest('[data-sf-scroll-exit-scene]') || element

    return gsap.to(element, {
      autoAlpha: 0,
      y: movement,
      ease: 'none',
      scrollTrigger: {
        trigger: scene,
        start: element.dataset.sfExitStart || 'top top',
        end: element.dataset.sfExitEnd || 'bottom 35%',
        scrub: Number.parseFloat(element.dataset.sfScrub || '0.45'),
        markers: debug,
      },
    })
  })
}

