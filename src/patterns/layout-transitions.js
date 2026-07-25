function animationCleanup(animations) {
  return () => animations.splice(0).forEach((animation) => {
    animation?.revert?.()
    animation?.kill?.()
  })
}

function flipFrom(Flip, state, reduced, animations, options = {}) {
  if (!reduced) animations.push(Flip.from(state, { duration: 0.55, ease: 'power2.inOut', absolute: true, ...options }))
}

export function createFlipListReorders({ Flip, root, reduced }) {
  return [...root.querySelectorAll('[data-motion-flip-list]')].map((list) => {
    const animations = []
    const onReorder = (event) => {
      if (typeof event.detail?.mutate !== 'function') return
      const items = [...list.querySelectorAll('[data-motion-flip-item]')]
      const state = Flip.getState(items)
      event.detail.mutate(list, items)
      flipFrom(Flip, state, reduced, animations, { stagger: 0.03 })
    }
    list.addEventListener('sf:motion:reorder', onReorder)
    return () => {
      list.removeEventListener('sf:motion:reorder', onReorder)
      animationCleanup(animations)()
    }
  })
}

export function createFlipCardDetails({ Flip, root, reduced }) {
  return [...root.querySelectorAll('[data-motion-flip-card]')].map((card) => {
    const trigger = card.querySelector('[data-motion-flip-card-trigger]')
    const detail = card.querySelector('[data-motion-flip-card-detail]')
    if (!trigger || !detail) return undefined
    const animations = []
    const initialExpanded = card.hasAttribute('data-expanded')
    const toggle = () => {
      const state = Flip.getState([card, detail])
      const expanded = !card.hasAttribute('data-expanded')
      card.toggleAttribute('data-expanded', expanded)
      trigger.setAttribute('aria-expanded', String(expanded))
      detail.toggleAttribute('hidden', !expanded)
      flipFrom(Flip, state, reduced, animations)
    }
    trigger.addEventListener('click', toggle)
    trigger.setAttribute('aria-expanded', String(initialExpanded))
    detail.toggleAttribute('hidden', !initialExpanded)
    return () => {
      trigger.removeEventListener('click', toggle)
      animationCleanup(animations)()
      card.toggleAttribute('data-expanded', initialExpanded)
      trigger.setAttribute('aria-expanded', String(initialExpanded))
      detail.toggleAttribute('hidden', !initialExpanded)
    }
  }).filter(Boolean)
}

export function createFlipFilterGrids({ Flip, gsap, root, reduced }) {
  return [...root.querySelectorAll('[data-motion-flip-filter]')].map((scene) => {
    const controls = [...scene.querySelectorAll('[data-motion-filter-control]')]
    const items = [...scene.querySelectorAll('[data-motion-filter-item]')]
    if (!controls.length || !items.length) return undefined
    const animations = []
    const apply = (control) => {
      const value = control.getAttribute('data-motion-filter-control') || 'all'
      const state = Flip.getState(items)
      controls.forEach((entry) => entry.setAttribute('aria-pressed', String(entry === control)))
      items.forEach((item) => {
        const values = (item.getAttribute('data-motion-filter-item') || '').split(/\s+/)
        item.toggleAttribute('hidden', value !== 'all' && !values.includes(value))
      })
      flipFrom(Flip, state, reduced, animations, {
        onEnter: (elements) => animations.push(gsap.fromTo(elements, { opacity: 0 }, { opacity: 1, duration: 0.3 })),
      })
    }
    const listeners = controls.map((control) => {
      const handler = () => apply(control)
      control.addEventListener('click', handler)
      return [control, handler]
    })
    return () => {
      listeners.forEach(([control, handler]) => control.removeEventListener('click', handler))
      animationCleanup(animations)()
      controls.forEach((control) => control.removeAttribute('aria-pressed'))
      items.forEach((item) => item.removeAttribute('hidden'))
    }
  }).filter(Boolean)
}

export function createFlipNavIndicators({ Flip, root, reduced }) {
  return [...root.querySelectorAll('[data-motion-flip-nav]')].map((nav) => {
    const items = [...nav.querySelectorAll('[data-motion-flip-nav-item]')]
    const indicator = nav.querySelector('[data-motion-flip-nav-indicator]')
    if (!items.length || !indicator) return undefined
    const animations = []
    const originalParent = indicator.parentNode
    const originalNext = indicator.nextSibling
    const activate = (item) => {
      const state = Flip.getState(indicator)
      item.append(indicator)
      items.forEach((entry) => entry.toggleAttribute('data-active', entry === item))
      flipFrom(Flip, state, reduced, animations, { absolute: false })
    }
    const listeners = items.map((item) => {
      const handler = () => activate(item)
      item.addEventListener('click', handler)
      item.addEventListener('focus', handler)
      return [item, handler]
    })
    activate(items.find((item) => item.getAttribute('aria-current') === 'page') ?? items[0])
    return () => {
      listeners.forEach(([item, handler]) => {
        item.removeEventListener('click', handler)
        item.removeEventListener('focus', handler)
        item.removeAttribute('data-active')
      })
      animationCleanup(animations)()
      originalParent?.insertBefore(indicator, originalNext)
    }
  }).filter(Boolean)
}

export function createLayoutAccordionGrids({ Flip, root, reduced }) {
  return [...root.querySelectorAll('[data-motion-layout-accordion-grid]')].map((grid) => {
    const items = [...grid.querySelectorAll('[data-motion-layout-item]')]
    const animations = []
    const listeners = items.flatMap((item) => {
      const trigger = item.querySelector('[data-motion-layout-trigger]')
      if (!trigger) return []
      const handler = () => {
        const state = Flip.getState(items)
        const expanded = !item.hasAttribute('data-expanded')
        items.forEach((entry) => {
          const active = entry === item && expanded
          entry.toggleAttribute('data-expanded', active)
          entry.querySelector('[data-motion-layout-trigger]')?.setAttribute('aria-expanded', String(active))
        })
        flipFrom(Flip, state, reduced, animations, { stagger: 0.025 })
      }
      trigger.addEventListener('click', handler)
      return [[trigger, handler]]
    })
    if (!listeners.length) return undefined
    return () => {
      listeners.forEach(([trigger, handler]) => trigger.removeEventListener('click', handler))
      animationCleanup(animations)()
      items.forEach((item) => {
        item.removeAttribute('data-expanded')
        item.querySelector('[data-motion-layout-trigger]')?.setAttribute('aria-expanded', 'false')
      })
    }
  }).filter(Boolean)
}
