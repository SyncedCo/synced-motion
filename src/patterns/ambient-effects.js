import { numberAttribute } from '../core/options.js'

function restoreText(element, value) {
  if (element) element.textContent = value
}

export function createValueCounters({ gsap, root, reduced }) {
  return [...root.querySelectorAll('[data-sf-counter]')].map((scene) => {
    const output = scene.querySelector('[data-sf-counter-value]') ?? scene
    const original = output.textContent
    const from = numberAttribute(scene, 'data-sf-counter-from', 0)
    const to = numberAttribute(scene, 'data-sf-counter-to', Number.parseFloat(original) || 0)
    const decimals = Math.max(0, Math.min(6, numberAttribute(scene, 'data-sf-counter-decimals', 0)))
    const format = (value) => Number(value).toFixed(decimals)

    if (reduced) {
      output.textContent = format(to)
      return () => restoreText(output, original)
    }

    const state = { value: from }
    output.textContent = format(from)
    const tween = gsap.to(state, {
      value: to,
      duration: Math.max(0.1, numberAttribute(scene, 'data-sf-counter-duration', 1.2)),
      ease: 'power2.out',
      onUpdate: () => { output.textContent = format(state.value) },
      scrollTrigger: { trigger: scene, start: 'top 85%', once: true },
    })
    return () => {
      tween.scrollTrigger?.kill?.()
      tween.revert?.()
      tween.kill?.()
      restoreText(output, original)
    }
  })
}

export function createProgressRings({ gsap, root, reduced }) {
  return [...root.querySelectorAll('[data-sf-progress-ring]')].map((scene) => {
    const ring = scene.querySelector('[data-sf-progress-ring-value]')
    const label = scene.querySelector('[data-sf-progress-ring-label]')
    if (!ring) return undefined
    const progress = Math.max(0, Math.min(100, numberAttribute(scene, 'data-sf-progress', 100)))
    const originalLabel = label?.textContent
    if (label) label.textContent = `${Math.round(progress)}%`

    const tween = reduced
      ? gsap.set(ring, { drawSVG: `${progress}%` })
      : gsap.fromTo(ring, { drawSVG: '0%' }, {
        drawSVG: `${progress}%`,
        duration: Math.max(0.1, numberAttribute(scene, 'data-sf-progress-duration', 1)),
        ease: 'power2.out',
        scrollTrigger: { trigger: scene, start: 'top 85%', once: true },
      })

    return () => {
      tween.scrollTrigger?.kill?.()
      tween.revert?.()
      tween.kill?.()
      gsap.set(ring, { clearProps: 'strokeDasharray,strokeDashoffset' })
      restoreText(label, originalLabel)
    }
  }).filter(Boolean)
}

export function createAmbientFloats({ gsap, ScrollTrigger, root, reduced }) {
  if (reduced) return []
  return [...root.querySelectorAll('[data-sf-ambient-float]')].map((element) => {
    const tween = gsap.to(element, {
      y: element.getAttribute('data-sf-float-distance') || '-0.75rem',
      duration: Math.max(0.5, numberAttribute(element, 'data-sf-float-duration', 3)),
      ease: 'sine.inOut',
      repeat: -1,
      yoyo: true,
      paused: true,
    })
    const trigger = ScrollTrigger.create({
      trigger: element,
      start: 'top bottom',
      end: 'bottom top',
      onEnter: () => tween.play(),
      onEnterBack: () => tween.play(),
      onLeave: () => tween.pause(),
      onLeaveBack: () => tween.pause(),
    })
    return () => {
      trigger.kill()
      tween.revert?.()
      tween.kill?.()
    }
  })
}

export function createLoopingLogoBelts({ gsap, root, reduced }) {
  if (reduced) return []
  return [...root.querySelectorAll('[data-sf-logo-belt]')].map((scene) => {
    const track = scene.querySelector('[data-sf-logo-belt-track]')
    if (!track) return undefined
    const direction = scene.getAttribute('data-sf-logo-belt-direction') === 'right' ? 1 : -1
    const tween = gsap.fromTo(track, { xPercent: direction > 0 ? -50 : 0 }, {
      xPercent: direction > 0 ? 0 : -50,
      duration: Math.max(1, numberAttribute(scene, 'data-sf-logo-belt-duration', 24)),
      ease: 'none',
      repeat: -1,
    })
    const Observer = scene.ownerDocument.defaultView?.IntersectionObserver
    const observer = Observer ? new Observer(([entry]) => tween.paused(!entry.isIntersecting)) : undefined
    observer?.observe(scene)
    return () => {
      observer?.disconnect()
      tween.revert?.()
      tween.kill?.()
    }
  }).filter(Boolean)
}
