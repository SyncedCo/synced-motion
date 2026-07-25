function disposeAll(animations) {
  animations.splice(0).forEach((animation) => {
    animation?.scrollTrigger?.kill?.()
    animation?.revert?.()
    animation?.kill?.()
  })
}

export function createPageLoadHeroes({ gsap, root, reduced }) {
  if (reduced) return []
  return [...root.querySelectorAll('[data-motion-page-load-hero]')].map((scene) => {
    const items = [...scene.querySelectorAll('[data-motion-page-load-item]')]
    if (!items.length) return undefined
    return gsap.from(items, { autoAlpha: 0, y: '1.5rem', duration: 0.7, stagger: 0.09, ease: 'power3.out', clearProps: 'transform,opacity,visibility' })
  }).filter(Boolean)
}

export function createPageLoadBrandMarks({ gsap, root, reduced }) {
  if (reduced) return []
  return [...root.querySelectorAll('[data-motion-page-load-brand]')].map((scene) => {
    const mark = scene.querySelector('[data-motion-brand-mark]') ?? scene
    return gsap.from(mark, { autoAlpha: 0, scale: 0.92, rotate: -4, transformOrigin: 'center', duration: 0.8, ease: 'power3.out', clearProps: 'transform,opacity,visibility' })
  })
}

export function createRouteFades({ gsap, root, reduced }) {
  return [...root.querySelectorAll('[data-motion-route-fade]')].map((scene) => {
    const animations = []
    const transition = (event) => {
      const outgoing = event.detail?.outgoing ?? scene.querySelector('[data-motion-route-outgoing]')
      const incoming = event.detail?.incoming ?? scene.querySelector('[data-motion-route-incoming]')
      const complete = typeof event.detail?.complete === 'function' ? event.detail.complete : () => {}
      if (reduced) {
        complete()
        return
      }
      const timeline = gsap.timeline({ onComplete: complete })
      if (outgoing) timeline.to(outgoing, { autoAlpha: 0, duration: 0.2 })
      if (incoming) timeline.fromTo(incoming, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.3 })
      animations.push(timeline)
    }
    scene.addEventListener('motion:route', transition)
    return () => {
      scene.removeEventListener('motion:route', transition)
      disposeAll(animations)
    }
  })
}

export function createRouteSharedMedia({ Flip, root, reduced }) {
  return [...root.querySelectorAll('[data-motion-route-shared-media]')].map((scene) => {
    const animations = []
    const transition = (event) => {
      const media = [...scene.querySelectorAll('[data-motion-shared-media]')]
      if (!media.length || typeof event.detail?.mutate !== 'function') return
      const state = Flip.getState(media)
      event.detail.mutate(scene, media)
      if (!reduced) animations.push(Flip.from(state, { duration: 0.65, ease: 'power2.inOut', absolute: true }))
    }
    scene.addEventListener('motion:route-shared', transition)
    return () => {
      scene.removeEventListener('motion:route-shared', transition)
      disposeAll(animations)
    }
  })
}

export function createRouteScrollRestores({ ScrollTrigger, root }) {
  return [...root.querySelectorAll('[data-motion-route-scroll-restore]')].map((scene) => {
    const view = scene.ownerDocument.defaultView
    const restore = (event) => {
      const top = Number.isFinite(event.detail?.top) ? event.detail.top : 0
      view?.scrollTo?.({ top, left: 0, behavior: 'auto' })
      ScrollTrigger.refresh()
    }
    scene.addEventListener('motion:route-complete', restore)
    return () => scene.removeEventListener('motion:route-complete', restore)
  })
}
