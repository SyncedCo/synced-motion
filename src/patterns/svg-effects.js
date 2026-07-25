function dispose(animation) {
  animation?.scrollTrigger?.kill?.()
  animation?.revert?.()
  animation?.kill?.()
}

export function createSvgLineDraws({ gsap, root, reduced, debug }) {
  if (reduced) return []
  return [...root.querySelectorAll('[data-sf-svg-line-draw]')].map((scene) => {
    const paths = [...scene.querySelectorAll('[data-sf-svg-path], path, line, polyline')]
    if (!paths.length) return undefined
    return gsap.from(paths, {
      drawSVG: '0%',
      duration: 1,
      stagger: 0.08,
      ease: 'power2.inOut',
      scrollTrigger: { trigger: scene, start: 'top 85%', once: true, markers: debug },
    })
  }).filter(Boolean)
}

function createMorphControllers({ gsap, root, reduced, selector, sourceSelector, targetSelector }) {
  return [...root.querySelectorAll(selector)].map((scene) => {
    const source = scene.querySelector(sourceSelector)
    const target = scene.querySelector(targetSelector)
    const trigger = scene.querySelector('[data-sf-svg-trigger]') ?? scene.querySelector('button')
    if (!source || !target || !trigger) return undefined
    const original = source.getAttribute('d')
    let active = false
    let tween
    const toggle = () => {
      active = !active
      trigger.setAttribute('aria-pressed', String(active))
      const destination = active ? target : original
      if (reduced) source.setAttribute('d', active ? target.getAttribute('d') : original)
      else tween = gsap.to(source, { morphSVG: destination, duration: 0.55, ease: 'power2.inOut', overwrite: true })
    }
    trigger.addEventListener('click', toggle)
    return () => {
      trigger.removeEventListener('click', toggle)
      trigger.setAttribute('aria-pressed', 'false')
      dispose(tween)
      if (original === null) source.removeAttribute('d')
      else source.setAttribute('d', original)
    }
  }).filter(Boolean)
}

export function createSvgPathMorphs(context) {
  return createMorphControllers({
    ...context,
    selector: '[data-sf-svg-morph]',
    sourceSelector: '[data-sf-svg-morph-source]',
    targetSelector: '[data-sf-svg-morph-target]',
  })
}

export function createSvgIconStates(context) {
  return createMorphControllers({
    ...context,
    selector: '[data-sf-svg-icon-state]',
    sourceSelector: '[data-sf-svg-icon-source]',
    targetSelector: '[data-sf-svg-icon-target]',
  })
}

export function createSvgOrbits({ gsap, root, reduced, debug }) {
  if (reduced) return []
  return [...root.querySelectorAll('[data-sf-svg-orbit]')].map((scene) => {
    const subject = scene.querySelector('[data-sf-svg-orbit-subject]')
    const path = scene.querySelector('[data-sf-svg-orbit-path]')
    if (!subject || !path) return undefined
    return gsap.to(subject, {
      motionPath: { path, align: path, alignOrigin: [0.5, 0.5], autoRotate: true },
      ease: 'none',
      scrollTrigger: { trigger: scene, start: 'top bottom', end: 'bottom top', scrub: 1, markers: debug },
    })
  }).filter(Boolean)
}

export function createSvgSignatureReveals({ gsap, root, reduced, debug }) {
  if (reduced) return []
  return [...root.querySelectorAll('[data-sf-svg-signature]')].map((scene) => {
    const paths = [...scene.querySelectorAll('path')]
    if (!paths.length) return undefined
    return gsap.from(paths, {
      drawSVG: '0%',
      duration: 0.8,
      stagger: 0.12,
      ease: 'power1.inOut',
      scrollTrigger: { trigger: scene, start: 'top 85%', once: true, markers: debug },
    })
  }).filter(Boolean)
}
