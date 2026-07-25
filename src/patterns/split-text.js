export function createSplitText({ gsap, SplitText, root, debug, reduced, revealStart }) {
  if (reduced) return []

  return [...root.querySelectorAll('[data-motion-split]')].map((element) => {
    const type = element.dataset.motionSplit || 'lines'
    const targetKey = type.includes('chars') ? 'chars' : type.includes('words') ? 'words' : 'lines'
    const accessibleText = element.getAttribute('aria-label') || element.textContent.trim()

    return SplitText.create(element, {
      type,
      autoSplit: type.includes('lines'),
      mask: element.dataset.motionSplitMask === 'true' ? targetKey : undefined,
      aria: 'auto',
      onSplit(instance) {
        if (accessibleText) element.setAttribute('aria-label', accessibleText)
        return gsap.from(instance[targetKey], {
          autoAlpha: 0,
          yPercent: targetKey === 'chars' ? 55 : 105,
          rotationX: targetKey === 'chars' ? -22 : 0,
          transformOrigin: '50% 100%',
          duration: Number.parseFloat(element.dataset.motionDuration || '0.9'),
          stagger: Number.parseFloat(element.dataset.motionStagger || (targetKey === 'chars' ? '0.018' : '0.08')),
          ease: element.dataset.motionEase || 'power3.out',
          scrollTrigger: {
            trigger: element,
            start: element.dataset.motionStart || revealStart,
            once: element.dataset.motionOnce !== 'false',
            markers: debug,
          },
        })
      },
    })
  })
}
