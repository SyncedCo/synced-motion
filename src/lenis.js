import Lenis from 'lenis'

export function createLenisAdapter({ gsap, ScrollTrigger, options = {} }) {
  const lenis = new Lenis({
    autoRaf: false,
    lerp: 0.1,
    smoothWheel: true,
    ...options,
  })

  const update = () => ScrollTrigger.update()
  const tick = (time) => lenis.raf(time * 1000)

  lenis.on('scroll', update)
  gsap.ticker.add(tick)
  gsap.ticker.lagSmoothing(0)

  return {
    lenis,
    start: () => lenis.start(),
    stop: () => lenis.stop(),
    scrollTo: (...args) => lenis.scrollTo(...args),
    destroy() {
      gsap.ticker.remove(tick)
      lenis.off('scroll', update)
      lenis.destroy()
    },
  }
}

