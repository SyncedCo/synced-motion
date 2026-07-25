import { numberAttribute } from '../core/options.js'

export function createFounderScenes({ gsap, ScrollTrigger, SplitText, root, debug, reduced }) {
  if (reduced) return []

  return [...root.querySelectorAll('[data-sf-founder-scene]')].map((scene) => {
    const content = scene.querySelector('[data-sf-founder-content]')
    const heading = scene.querySelector('[data-sf-founder-heading]')
    const statementBackground = scene.querySelector('[data-sf-founder-statement-bg]')
    const metricsBackground = scene.querySelector('[data-sf-founder-metrics-bg]')
    const metrics = scene.querySelector('[data-sf-founder-metrics]')
    const stat = scene.querySelector('[data-sf-founder-stat]')
    const statLabel = scene.querySelector('[data-sf-founder-stat-label]')
    const details = [...scene.querySelectorAll('[data-sf-founder-detail]')]
    if (!content || !heading || !statementBackground || !metricsBackground || !metrics || !stat || !statLabel) return null

    const split = new SplitText(heading, { type: 'words', aria: 'auto' })
    const wordStagger = split.words.length > 1 ? 0.2 / (split.words.length - 1) : 0
    gsap.set(content, { autoAlpha: 0 })
    gsap.set(split.words, { autoAlpha: 0, yPercent: 100 })
    gsap.set(metricsBackground, { scale: 1.2 })
    gsap.set(metrics, { autoAlpha: 0 })
    gsap.set(stat, { autoAlpha: 0, scale: 0.5 })
    gsap.set(statLabel, { autoAlpha: 0, scale: 0.8, yPercent: 100 })
    gsap.set(details, { autoAlpha: 0, yPercent: 30 })

    const timeline = gsap.timeline({
      scrollTrigger: {
        trigger: scene,
        start: 'clamp(top top)',
        end: 'clamp(bottom bottom)',
        scrub: numberAttribute(scene, 'data-sf-scrub', 0.8),
        markers: debug,
      },
    })

    timeline
      .to(metricsBackground, { scale: 1, autoAlpha: 1, duration: 1.96, ease: 'none' }, 0.09)
      .to(content, { autoAlpha: 1, duration: 0.17, ease: 'power2.in' }, 0.25)
      .to(split.words, { autoAlpha: 1, yPercent: 0, duration: 0.16, ease: 'none', stagger: wordStagger }, 0.25)
      .to(content, { autoAlpha: 0, yPercent: 5, duration: 0.17, ease: 'power2.in' }, 0.59)
      .to(statementBackground, { autoAlpha: 0, duration: 1.2, ease: 'none' }, 0.76)
      .to(metrics, { autoAlpha: 1, duration: 0.1, ease: 'none' }, 0.89)
      .to(stat, { autoAlpha: 1, scale: 1, duration: 0.21, ease: 'none' }, 0.89)
      .to(statLabel, { autoAlpha: 1, scale: 1, yPercent: 0, duration: 0.21, ease: 'none' }, 1.02)
      .to(details, { autoAlpha: 1, yPercent: 0, duration: 0.5, ease: 'none', stagger: 0.1 }, 1.1)

    return () => {
      timeline.scrollTrigger?.kill()
      timeline.revert?.()
      timeline.kill()
      gsap.set([content, ...split.words, statementBackground, metricsBackground, metrics, stat, statLabel, ...details], {
        clearProps: 'transform,opacity,visibility',
      })
      split.revert()
    }
  }).filter(Boolean)
}
