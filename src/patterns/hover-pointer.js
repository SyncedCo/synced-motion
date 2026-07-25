function clearTween(gsap, target) {
  gsap.set(target, { clearProps: 'transform,opacity,visibility' })
}

export function createHoverLifts({ gsap, root, reduced }) {
  if (reduced) return []
  return [...root.querySelectorAll('[data-motion-hover-lift]')].map((item) => {
    const enter = () => gsap.to(item, { y: '-0.5rem', scale: 1.01, duration: 0.25, ease: 'power2.out', overwrite: 'auto' })
    const leave = () => gsap.to(item, { y: 0, scale: 1, duration: 0.3, ease: 'power2.out', overwrite: 'auto' })
    item.addEventListener('pointerenter', enter)
    item.addEventListener('pointerleave', leave)
    item.addEventListener('focusin', enter)
    item.addEventListener('focusout', leave)
    return () => {
      item.removeEventListener('pointerenter', enter)
      item.removeEventListener('pointerleave', leave)
      item.removeEventListener('focusin', enter)
      item.removeEventListener('focusout', leave)
      clearTween(gsap, item)
    }
  })
}

export function createMagneticActions({ gsap, root, reduced }) {
  const view = root.nodeType === 9 ? root.defaultView : root.ownerDocument?.defaultView
  if (reduced || !view?.matchMedia?.('(pointer: fine)').matches) return []
  return [...root.querySelectorAll('[data-motion-magnetic]')].map((scene) => {
    const action = scene.querySelector('[data-motion-magnetic-action]') ?? scene
    const xTo = gsap.quickTo(action, 'x', { duration: 0.35, ease: 'power3.out' })
    const yTo = gsap.quickTo(action, 'y', { duration: 0.35, ease: 'power3.out' })
    const move = (event) => {
      const rect = scene.getBoundingClientRect()
      const strength = Number(scene.getAttribute('data-motion-magnetic-strength') || 0.2)
      xTo((event.clientX - rect.left - rect.width / 2) * strength)
      yTo((event.clientY - rect.top - rect.height / 2) * strength)
    }
    const reset = () => { xTo(0); yTo(0) }
    scene.addEventListener('pointermove', move)
    scene.addEventListener('pointerleave', reset)
    return () => {
      scene.removeEventListener('pointermove', move)
      scene.removeEventListener('pointerleave', reset)
      xTo.tween?.kill?.()
      yTo.tween?.kill?.()
      clearTween(gsap, action)
    }
  })
}

export function createPointerSpotlights({ gsap, root, reduced }) {
  const view = root.nodeType === 9 ? root.defaultView : root.ownerDocument?.defaultView
  if (reduced || !view?.matchMedia?.('(pointer: fine)').matches) return []
  return [...root.querySelectorAll('[data-motion-pointer-spotlight]')].map((scene) => {
    const spotlight = scene.querySelector('[data-motion-spotlight]')
    if (!spotlight) return undefined
    const xTo = gsap.quickTo(spotlight, 'x', { duration: 0.2, ease: 'power2.out' })
    const yTo = gsap.quickTo(spotlight, 'y', { duration: 0.2, ease: 'power2.out' })
    const move = (event) => {
      const rect = scene.getBoundingClientRect()
      xTo(event.clientX - rect.left)
      yTo(event.clientY - rect.top)
    }
    scene.addEventListener('pointermove', move)
    return () => {
      scene.removeEventListener('pointermove', move)
      xTo.tween?.kill?.()
      yTo.tween?.kill?.()
      clearTween(gsap, spotlight)
    }
  }).filter(Boolean)
}
