export function createSplitText({ gsap, SplitText, root, debug, reduced, revealStart }) {
  if (reduced) return []

  return [...root.querySelectorAll('[data-sf-split]')].map((element) => {
    const type = element.dataset.sfSplit || 'lines'
    const targetKey = type.includes('chars') ? 'chars' : type.includes('words') ? 'words' : 'lines'

    return SplitText.create(element, {
      type,
      autoSplit: type.includes('lines'),
      mask: element.dataset.sfSplitMask === 'true' ? targetKey : undefined,
      aria: 'auto',
      onSplit(instance) {
        return gsap.from(instance[targetKey], {
          autoAlpha: 0,
          yPercent: targetKey === 'chars' ? 55 : 105,
          rotationX: targetKey === 'chars' ? -22 : 0,
          transformOrigin: '50% 100%',
          duration: Number.parseFloat(element.dataset.sfDuration || '0.9'),
          stagger: Number.parseFloat(element.dataset.sfStagger || (targetKey === 'chars' ? '0.018' : '0.08')),
          ease: element.dataset.sfEase || 'power3.out',
          scrollTrigger: {
            trigger: element,
            start: element.dataset.sfStart || revealStart,
            once: element.dataset.sfOnce !== 'false',
            markers: debug,
          },
        })
      },
    })
  })
}
